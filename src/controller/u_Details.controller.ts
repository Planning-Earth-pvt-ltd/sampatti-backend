import { Request, Response } from 'express';
import { PrismaClient, KYCStatus } from '@prisma/client';

const prisma = new PrismaClient();

// 0. GET all users
export const getAllUsers = async (_req: Request, res: Response): Promise<Response> => {
  try {
    const users = await prisma.user.findMany({
      include: { Token: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Get All Users Error:', error);
    return res.status(500).json({ message: 'Failed to fetch users', error });
  }
};


// 1. GET user details by ID
export const getUserDetailsById = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { Token: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
};

// 2. UPDATE user email
export const updateEmail = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { email },
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating email', error });
  }
};

// 3. UPDATE KYC status and isKycVerified
export const updateKycStatusAndVerification = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { kycStatus, isKycVerified } = req.body;

  if (!kycStatus || typeof isKycVerified !== 'boolean') {
    return res.status(400).json({ message: 'kycStatus and isKycVerified are required' });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        kycStatus: kycStatus as KYCStatus,
        isKycVerified,
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating KYC info', error });
  }
};

// 4. UPDATE user's tokens (replace Token array)
export const updateTokens = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { tokens } = req.body;

  if (!Array.isArray(tokens)) {
    return res.status(400).json({ message: 'tokens must be an array' });
  }

  try {
    await prisma.token.deleteMany({
      where: { userId: id },
    });

    const created = await prisma.token.createMany({
      data: tokens.map((token: any) => ({
        ...token,
        userId: id,
      })),
      skipDuplicates: true,
    });

    return res.status(200).json({ message: 'Tokens updated', created });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating tokens', error });
  }
};
 