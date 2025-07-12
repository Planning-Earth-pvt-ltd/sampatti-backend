import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ✅ Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  const { userId, propertyId, tokenPrice, quantity } = req.body;

  try {
    const amount = Number(tokenPrice) * quantity;

    const cartItem = await prisma.cart.create({
      data: {
        userId,
        propertyId,
        tokenPrice,
        quantity,
        amount,
      },
    });

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: 'Error adding to cart', details: error });
  }
};

// ✅ Get all cart items for a user
export const getUserCart = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      include: { property: true },
    });

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart', details: error });
  }
};

// ✅ Update cart item
export const updateCartItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity, tokenPrice } = req.body;

  try {
    const amount = Number(tokenPrice) * quantity;

    const updated = await prisma.cart.update({
      where: { id },
      data: {
        quantity,
        tokenPrice,
        amount,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating cart', details: error });
  }
};

// ✅ Delete cart item
export const deleteCartItem = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.cart.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting cart item', details: error });
  }
};

// ✅ Clear user's cart
export const clearCart = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await prisma.cart.deleteMany({ where: { userId } });
    res.status(200).json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Error clearing cart', details: error });
  }
};
