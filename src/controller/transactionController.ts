import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ✅ Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_SECRET!,
});

// ✅ Create Razorpay order + transaction
export const createTransactionAndOrder = async (req: Request, res: Response) => {
  const { userId, propertyId, quantity, type } = req.body;

  try {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const tokenPrice = Number(property.PricePerToken);
    const amount = tokenPrice * quantity;

    // Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amount * 100, // in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Create transaction with Razorpay order info
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        propertyId,
        tokenPrice,
        quantity,
        amount,
        type,
        status: 'PENDING',
        razorpayOrderId: order.id,
      },
    });

    res.status(201).json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      transactionId: transaction.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({ error: 'Error creating transaction', details: error });
  }
};

// ✅ Verify Razorpay Payment Signature
export const verifyTransactionPayment = async (req: Request, res: Response) => {
  const {
    transactionId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  try {
    // Generate expected signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update transaction as successful
    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    });

    res.status(200).json({ success: true, transaction: updated });
  } catch (error) {
    console.error('Verify Transaction Error:', error);
    res.status(500).json({ error: 'Payment verification failed', details: error });
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

// ✅ Update transaction status manually (if needed)
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

// ✅ Get a specific transaction by ID
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
