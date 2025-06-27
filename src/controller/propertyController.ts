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
      tokenisedAreaSqft,
      currentValuation,
      status,
      ownerUserId,
    } = req.body;

    if (!isValidEnumValue(PropertyType, propertyType)) {
      res.status(400).json({ error: 'Invalid propertyType value' });
      return;
    }

    if (!isValidEnumValue(PropertyStatus, status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const property = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        state,
        propertyType,
        totalAreaSqft: Number(totalAreaSqft),
        tokenisedAreaSqft: Number(tokenisedAreaSqft),
        currentValuation: Number(currentValuation),
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
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    propertyType,
    status,
    ownerUserId,
    totalAreaSqft,
    tokenisedAreaSqft,
    currentValuation,
  } = req.body;

  try {
    if (propertyType && !isValidEnumValue(PropertyType, propertyType)) {
      res.status(400).json({ error: 'Invalid propertyType value' });
      return;
    }

    if (status && !isValidEnumValue(PropertyStatus, status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    if (ownerUserId) {
      const owner = await prisma.user.findUnique({ where: { id: ownerUserId } });
      if (!owner) {
        res.status(400).json({ error: 'Owner user not found' });
        return;
      }
    }

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...req.body,
        totalAreaSqft: totalAreaSqft !== undefined ? Number(totalAreaSqft) : undefined,
        tokenisedAreaSqft: tokenisedAreaSqft !== undefined ? Number(tokenisedAreaSqft) : undefined,
        currentValuation: currentValuation !== undefined ? Number(currentValuation) : undefined,
      },
    });
    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update property' });
  }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await prisma.property.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};
