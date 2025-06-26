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
}

export const sendOTP = async (
  req: Request<{}, {}, SendOtpRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { phoneNumber, fullName } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        phoneNumber,
      },
    });

    let isExistingUser = false;

    // Checks if the user Exists or not

    if (user) {
      isExistingUser = true;

      // if user exists and fullname is sent , block signup

      if (fullName != null) {
        res.status(400).json({
          message: "User Already Exist, Kindly Login",
          success: false,
          isExistingUser: true,
        });
        return;
      }
    } else {
      //if user does not exist and fullname not send, block login

      if (fullName == null) {
        res.status(401).json({
          message: "User not registered, Kindly SignUp",
          success: false,
          isExistingUser: false,
        });
        return;
      }
    }

    // Send OTP using twilio

    if (!serviceSID) {
      throw new Error("Missing TWILIO_SERVICE_SID in environment variables");
    }

    await client.verify.v2.services(serviceSID).verifications.create({
      to: `+91${phoneNumber}`,
      channel: "sms",
    });

    res.status(200).json({
      message: "OTP sent successfully",
      success: true,
      isExistingUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to send OTP",
      success: false,
    });
  }
};

export const verifyOTP = async (
  req: Request<SendOtpRequestBody>,
  res: Response
): Promise<void> => {
  const { phoneNumber, OTP, fullName, isExistingUser } = req.body;
  try {
    const verifiedResponse = await client.verify.v2
      .services(serviceSID || "")
      .verificationChecks.create({
        to: `+91${phoneNumber}`,
        code: OTP,
      });

    // check OTP is valid
    if (verifiedResponse.status !== "approved") {
      res.status(400).json({
        message: "Invalid or expired OTP",
        success: false,
      });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    let message = "";

    if (isExistingUser) {
      if (!user) {
        res.status(404).json({
          message: "User not found, SignUp",
          success: false,
        });
        return;
      }
      message = "Login Successfully";
    } else {
      // Create new user only if they don't exist (this will handle on frontend also)
      if (user) {
        // If user is trying to sign up but already exists
        res.status(409).json({
          message:
            "Account with this phone number already exists. Please log in.",
          success: false,
        });
        return;
      }

      // If no existing user, proceed with creation
      if (!fullName || fullName.trim() === "") {
        res.status(400).json({
          message: "Full name is required for signup",
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
      message = "Account Created Successfully";
    }

    const { accessToken, refreshToken } = await generateToken(user.id);

    // Sending the response
    res.status(200).json({
      message: message,
      accessToken,
      refreshToken,
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.email,
      },
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "OTP verification Failed",
      success: false,
    });
    return;
  }
};
