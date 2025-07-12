import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Create transaction (e.g., after checkout)
export const createTransaction = async (req: Request, res: Response) => {
  const { userId, propertyId, tokenPrice, quantity, type } = req.body;

  try {
    const amount = Number(tokenPrice) * quantity;

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        propertyId,
        tokenPrice,
        quantity,
        amount,
        type,
        status: 'PENDING',
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Error creating transaction', details: error });
  }
};

// ✅ Get all transactions for a user
export const getUserTransactions = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { property: true },
    });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions', details: error });
  }
};

// ✅ Update transaction status
export const updateTransactionStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updated = await prisma.transaction.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction', details: error });
  }
};

// ✅ Get a specific transaction
export const getTransactionById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { property: true, user: true },
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transaction', details: error });
  }
};
