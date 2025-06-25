import jwt from "jsonwebtoken";
import prisma from "../prisma";
import { Prisma } from "@prisma/client";

interface User {
  id: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email?: string | null;
  };
}

export const generateToken = async (userId: string): Promise<TokenResponse> => {
  try {
    if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("Missing Keys");
    }
    const payload = {
      userId,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "14m",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });

    const existingToken = await prisma.token.findFirst({
      where: { userId },
    });

    if (existingToken) {
      await prisma.token.delete({
        where: { id: existingToken.id },
      });
    }

    await prisma.token.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in tokens", error);
    throw error;
  }
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<RefreshResponse> => {
  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error("Missing Keys");
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload;

    const tokenDoc = await prisma.token.findFirst({
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

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "14m" }
    );

    return {
      accessToken: newAccessToken,
      user: tokenDoc.user,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Could not refresh access token");
  }
};

// Remove refresh token (logout)
export const removeRefreshToken = async (
  refreshToken: string
): Promise<void> => {
  try {
    await prisma.token.deleteMany({
      where: { token: refreshToken },
    });
  } catch (error) {
    console.error("Error removing refresh token:", error);
    throw error;
  }
};

// Verify access token and get user
export const verifyAccessToken = async (accessToken: string) => {
  try {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("Missing ACCESS_TOKEN_SECRET");
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    ) as { userId: string };

    const user = await prisma.user.findUnique({
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
  } catch (error) {
    console.error("Error verifying access token:", error);
    throw new Error("Invalid access token");
  }
};
