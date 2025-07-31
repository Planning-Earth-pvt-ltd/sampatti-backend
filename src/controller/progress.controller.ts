import { Request, Response } from 'express';
import { PrismaClient,PropertyCategory} from '@prisma/client';
import { isValidPropertyCategory } from '../utils/validators';


const prisma = new PrismaClient();

// 1. Full Property List with progress_percentage
export const listProperties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedProperties = await Promise.all(
      properties.map(async (property) => {
        const percentagePerToken = 100 / property.TotalTokens;

        const transactionSum = await prisma.transaction.aggregate({
          where: { propertyId: property.id },
          _sum: { quantity: true },
        });

        const totalQuantity = transactionSum._sum.quantity || 0;
        const progress_percentage = parseFloat((totalQuantity * percentagePerToken).toFixed(2));

        return {
          ...property,
          progress_percentage,
        };
      })
    );

    res.status(200).json(enrichedProperties);
  } catch (error) {
    console.error('List Properties Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};


export const getFilteredProperties = async (req: Request, res: Response): Promise<void> => {
  const { state, category } = req.query;

  if (category && !isValidPropertyCategory(category as string)) {
    res.status(400).json({ error: 'Invalid category value' });
    return;
  }

  try {
    const properties = await prisma.property.findMany({
      where: {isDeleted: false,
        ...(state ? { state: { equals: state as string, mode: 'insensitive' } } : {}),
        ...(category ? { propertyCategory: category as PropertyCategory } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedProperties = await Promise.all(
      properties.map(async (property) => {
        const percentagePerToken = 100 / property.TotalTokens;

        const transactionSum = await prisma.transaction.aggregate({
          where: { propertyId: property.id },
          _sum: { quantity: true },
        });

        const totalQuantity = transactionSum._sum.quantity || 0;
        const progress_percentage = parseFloat((totalQuantity * percentagePerToken).toFixed(2));

        return {
          ...property,
          progress_percentage,
        };
      })
    );

    res.status(200).json(enrichedProperties);
  } catch (error) {
    console.error('Get Filtered Properties Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

// 2. Home Props List (Partial Fields) with progress_percentage
export const listHomeProps = async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        images: true,
        PricePerSqFt: true,
        TotalTokens: true,
      },
    });

    const enrichedHomeProps = await Promise.all(
      properties.map(async (property) => {
        const percentagePerToken = 100 / property.TotalTokens;

        const transactionSum = await prisma.transaction.aggregate({
          where: { propertyId: property.id },
          _sum: { quantity: true },
        });

        const totalQuantity = transactionSum._sum.quantity || 0;
        const progress_percentage = parseFloat((totalQuantity * percentagePerToken).toFixed(2));

        return {
          id: property.id,
          title: property.title,
          images: property.images,
          PricePerSqFt: property.PricePerSqFt,
          progress_percentage,
        };
      })
    );

    res.status(200).json(enrichedHomeProps);
  } catch (error) {
    console.error('List Home Properties Error:', error);
    res.status(500).json({ error: 'Failed to fetch home properties' });
  }
};
