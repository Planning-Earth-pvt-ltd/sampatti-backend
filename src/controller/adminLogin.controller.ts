import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { comparePassword, hashPassword } from '../utils/hash';
import { generateCustomId } from '../utils/generateOwnerId';


const prisma = new PrismaClient();

export const adminLogin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await comparePassword(password, admin.password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
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