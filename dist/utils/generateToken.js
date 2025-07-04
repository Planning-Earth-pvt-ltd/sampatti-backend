"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.removeRefreshToken = exports.refreshAccessToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const generateToken = async (userId) => {
    try {
        if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            throw new Error("Missing Keys");
        }
        const payload = {
            userId,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "14m",
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "30d",
        });
        const existingToken = await prisma_1.default.token.findFirst({
            where: { userId },
        });
        if (existingToken) {
            await prisma_1.default.token.delete({
                where: { id: existingToken.id },
            });
        }
        await prisma_1.default.token.create({
            data: {
                userId,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 1000),
            },
        });
        return { accessToken, refreshToken };
    }
    catch (error) {
        console.error("Error in tokens", error);
        throw error;
    }
};
exports.generateToken = generateToken;
const refreshAccessToken = async (refreshToken) => {
    try {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error("Missing Keys");
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const tokenDoc = await prisma_1.default.token.findFirst({
            where: {
                token: refreshToken,
                userId: decoded.userId,
                expiresAt: {
                    gt: new Date(), // checking if token is expired or not
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        email: true,
                    },
                },
            },
        });
        if (!tokenDoc) {
            throw new Error("Token not found or expired");
        }
        const newAccessToken = jsonwebtoken_1.default.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "14m" });
        return {
            accessToken: newAccessToken,
            user: tokenDoc.user,
        };
    }
    catch (error) {
        console.error(error);
        throw new Error("Could not refresh access token");
    }
};
exports.refreshAccessToken = refreshAccessToken;
// Remove refresh token (logout)
const removeRefreshToken = async (refreshToken) => {
    try {
        await prisma_1.default.token.deleteMany({
            where: { token: refreshToken },
        });
    }
    catch (error) {
        console.error("Error removing refresh token:", error);
        throw error;
    }
};
exports.removeRefreshToken = removeRefreshToken;
// Verify access token and get user
const verifyAccessToken = async (accessToken) => {
    try {
        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new Error("Missing ACCESS_TOKEN_SECRET");
        }
        const decoded = jsonwebtoken_1.default.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                email: true,
                kycStatus: true,
                isKycVerified: true,
            },
        });
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }
    catch (error) {
        console.error("Error verifying access token:", error);
        throw new Error("Invalid access token");
    }
};
exports.verifyAccessToken = verifyAccessToken;
