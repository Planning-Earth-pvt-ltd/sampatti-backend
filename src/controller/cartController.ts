import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
// ✅ Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  const { userId, propertyId, quantity } = req.body;

  try {
    // Fetch the property to get PricePerToken
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    const tokenPrice = Number(property.PricePerToken);
    const amount = tokenPrice * quantity;

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
    console.error('Add to Cart Error:', error);
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
    const updatedCartItems = await Promise.all(
      cartItems.map(async (item) => {
        const latestTokenPrice = Number(item.property.PricePerToken);
        const amount = latestTokenPrice * item.quantity;

        if (
          Number(item.tokenPrice) !== latestTokenPrice ||
          Number(item.amount) !== amount
        ) {
          await prisma.cart.update({
            where: { id: item.id },
            data: {
              tokenPrice: latestTokenPrice,
              amount: amount,
            },
          });

          return {
            ...item,
            tokenPrice: latestTokenPrice,
            amount: amount,
          };
        }

        return item;
      })
    );
    res.status(200).json(updatedCartItems);
  } catch (error) {
    console.error('Error fetching or updating cart:', error);
    res.status(500).json({ error: 'Error fetching cart', details: error });
  }
};


// ✅ Update cart item
export const updateCartItem = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    // Fetch existing cart item
    const existingCartItem = await prisma.cart.findUnique({
      where: { id },
    });

    if (!existingCartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    // Use the tokenPrice stored in the cart item
    const tokenPrice = Number(existingCartItem.tokenPrice);
    const amount = tokenPrice * quantity;

    const updated = await prisma.cart.update({
      where: { id },
      data: {
        quantity,
        amount,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating cart item:', error);
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
