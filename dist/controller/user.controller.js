"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTP = exports.sendOTP = void 0;
const twilio_1 = __importDefault(require("twilio"));
const prisma_1 = __importDefault(require("../prisma"));
const generateToken_1 = require("../utils/generateToken");
const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSID = process.env.TWILIO_SERVICE_SID;
const client = (0, twilio_1.default)(accountSID, authToken);
const sendOTP = async (req, res) => {
    try {
        const { phoneNumber, fullName } = req.body;
        const user = await prisma_1.default.user.findFirst({
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
        }
        else {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to send OTP",
            success: false,
        });
    }
};
exports.sendOTP = sendOTP;
const verifyOTP = async (req, res) => {
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
        let user = await prisma_1.default.user.findUnique({
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
        }
        else {
            // Create new user only if they don't exist (this will handle on frontend also)
            if (user) {
                // If user is trying to sign up but already exists
                res.status(409).json({
                    message: "Account with this phone number already exists. Please log in.",
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
            user = await prisma_1.default.user.create({
                data: {
                    phoneNumber,
                    fullName,
                },
            });
            message = "Account Created Successfully";
        }
        const { accessToken, refreshToken } = await (0, generateToken_1.generateToken)(user.id);
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
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            message: "OTP verification Failed",
            success: false,
        });
        return;
    }
};
exports.verifyOTP = verifyOTP;
