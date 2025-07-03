import twilio from "twilio";
import { Request, Response } from "express";
import prisma from "../prisma";
import { generateToken } from "../utils/generateToken";

const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSID = process.env.TWILIO_SERVICE_SID;

const client = twilio(accountSID, authToken);

interface SendOtpRequestBody {
  phoneNumber: string;
  fullName?: string | null;
  type: "signup" | "login";
}

interface VerifyOtpRequestBody {
  phoneNumber: string;
  OTP: string;
  fullName?: string;
  type: "signup" | "login";
}

export const sendOTP = async (
  req: Request<{}, {}, SendOtpRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber, fullName, type } = req.body;

    if (!phoneNumber || phoneNumber.trim().length !== 10) {
      res.status(400).json({
        message: "Valid phone number is required",
        success: false,
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    const isSignup = type === "signup";

    if (isSignup ? user : !user) {
      res.status(isSignup ? 400 : 404).json({
        message: isSignup
          ? "User already exists. Please login."
          : "User not found. Please sign up first.",
        success: false,
      });
      return;
    }

    if (isSignup && (!fullName || fullName.trim() === "")) {
      res.status(400).json({
        message: "Full name is required for signup",
        success: false,
      });
      return;
    }

    await client.verify.v2.services(serviceSID).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      success: false,
    });
  }
};


export const verifyOTP = async (
  req: Request<{}, {}, VerifyOtpRequestBody>,
  res: Response
): Promise<void> => {
  const { phoneNumber, OTP, fullName, type } = req.body;

  try {
    const verification = await client.verify.v2
      .services(serviceSID)
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: OTP,
      });

    if (verification.status !== "approved") {
      res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (type === "login") {
      if (!user) {
        res.status(404).json({
          message: "User not found. Please sign up first.",
          success: false,
        });
        return;
      }
    }

    if (type === "signup") {
      if (user) {
        res.status(409).json({
          message: "User already exists. Please login.",
          success: false,
        });
        return;
      }

      if (!fullName || fullName.trim() === "") {
        res.status(400).json({
          message: "Full name is required for signup.",
          success: false,
        });
        return;
      }

      user = await prisma.user.create({
        data: {
          phoneNumber,
          fullName,
        },
      });
    }

    const { accessToken, refreshToken } = await generateToken(user!.id);

    res.status(200).json({
      message: type === "signup" ? "Account created successfully." : "Login successful.",
      accessToken,
      refreshToken,
      success: true,
      user: {
        id: user!.id,
        fullName: user!.fullName,
        phoneNumber: user!.phoneNumber,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({
      message: "OTP verification failed.",
      success: false,
    });
  }
};

