import { Request, Response } from 'express';
import { PrismaClient, PropertyType, PropertyStatus } from '@prisma/client';

const prisma = new PrismaClient();

const isValidEnumValue = <T extends object>(enumObj: T, value: any): value is T[keyof T] => {
  return Object.values(enumObj).includes(value);
};

export const addProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      address,
      city,
      state,
      propertyType,
      totalAreaSqft,
      TotalTokens,
      currentValuation,
      status,
      ownerUserId,
    } = req.body;

    if (
      !title ||
      !description ||
      !address ||
      !city ||
      !state ||
      !propertyType ||
      !status ||
      !ownerUserId ||
      totalAreaSqft == null ||
      TotalTokens == null ||
      currentValuation == null
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!isValidEnumValue(PropertyType, propertyType)) {
      res.status(400).json({ error: 'Invalid propertyType value' });
      return;
    }

    if (!isValidEnumValue(PropertyStatus, status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    if (totalAreaSqft <= 0 || TotalTokens <= 0 || currentValuation <= 0) {
      res.status(400).json({ error: 'Invalid numeric values for totalAreaSqft, TotalTokens, or currentValuation' });
      return;
    }

    const PricePerSqFt = currentValuation / totalAreaSqft;
    const SqFtAreaPerToken = totalAreaSqft / TotalTokens;
    const PricePerToken = SqFtAreaPerToken * PricePerSqFt;

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        state,
        propertyType,
        totalAreaSqft: Number(totalAreaSqft),
        TotalTokens: Number(TotalTokens),
        currentValuation: Number(currentValuation),
        PricePerSqFt,
        SqFtAreaPerToken,
        PricePerToken,
        status,
        ownerUserId,
      },
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Add property error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to add property', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to add property', details: 'Unknown error' });
    }
  }
};

export const listProperties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany();
    res.status(200).json(properties);
  } catch (error) {
    console.error('List properties error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to fetch properties', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to fetch properties', details: 'Unknown error' });
    }
  }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    totalAreaSqft,
    TotalTokens,
    currentValuation,
    ...rest
  } = req.body;

  try {
    const existingProperty = await prisma.property.findUnique({ where: { id } });
    if (!existingProperty) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    const updatedTotalAreaSqft = totalAreaSqft ?? existingProperty.totalAreaSqft;
    const updatedTotalTokens = TotalTokens ?? existingProperty.TotalTokens;
    const updatedCurrentValuation = currentValuation ?? existingProperty.currentValuation;

    if (updatedTotalAreaSqft <= 0 || updatedTotalTokens <= 0 || updatedCurrentValuation <= 0) {
      res.status(400).json({ error: 'Invalid numeric values for totalAreaSqft, TotalTokens, or currentValuation' });
      return;
    }

    const PricePerSqFt = updatedCurrentValuation / updatedTotalAreaSqft;
    const SqFtAreaPerToken = updatedTotalAreaSqft / updatedTotalTokens;
    const PricePerToken = SqFtAreaPerToken * PricePerSqFt;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...rest,
        totalAreaSqft: updatedTotalAreaSqft,
        TotalTokens: updatedTotalTokens,
        currentValuation: updatedCurrentValuation,
        PricePerSqFt,
        SqFtAreaPerToken,
        PricePerToken,
      },
    });

    res.status(200).json(property);
  } catch (error) {
    console.error('Update property error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to update property', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update property', details: 'Unknown error' });
    }
  }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    await prisma.property.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    console.error('Delete property error:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Failed to delete property', details: error.message });
    } else {
      res.status(500).json({ error: 'Failed to delete property', details: 'Unknown error' });
    }
  }
};
