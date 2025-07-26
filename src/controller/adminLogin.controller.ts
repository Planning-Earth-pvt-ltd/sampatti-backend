import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/hash';
import { generateCustomId } from '../utils/generateOwnerId';
import { generateOTP } from '../utils/resetOTP';
import { sendOTPNotification } from '../services/mailService';
import { saveOTP, verifyStoredOTP } from '../utils/generateOTP';
import { compare } from 'bcryptjs';

const prisma = new PrismaClient();

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !admin.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await compare(password, admin.password); 

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ message: "Login successful", admin: { id: admin.id, email: admin.email } });
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message || 'Unknown error' });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  try {
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.admin.create({
      data: {
        id: generateCustomId(name),
        email,
        password: hashedPassword,
        name
      }
    });

    res.json({
      success: true,
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin'
    });
  }
};


export const getAdmin = async (req: Request, res: Response) => {
  try {
    const admin = await prisma.admin.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    res.json({
      success: true,
      admin
    });

  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin'
    });
  }
};

export const requestPasswordOTP = async (req: Request, res: Response) => {
  const { email } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) return res.status(404).json({ error: 'Admin not found' });

  const otp = generateOTP();
  saveOTP(email, otp);

  await sendOTPNotification(email, otp);
  res.json({ message: 'OTP sent to email' });
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ error: 'Email and OTP required' });

  const valid = verifyStoredOTP(email, otp);

  if (!valid) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  res.json({ message: 'OTP verified. You can now reset your password.' });
};

export const changePasswordAfterOTP = async (req: Request, res: Response) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword)
    return res.status(400).json({ error: 'Email and password required' });

  const hashed = await hashPassword(newPassword);

  await prisma.admin.update({
    where: { email },
    data: {
      password: hashed,
    },
  });

  res.json({ message: 'Password changed successfully.' });
};