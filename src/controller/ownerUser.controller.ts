import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { generateCustomId } from '../utils/generateOwnerId';

const prisma = new PrismaClient();

export const createOwner = async (req: Request, res: Response) => {
  const { name, phoneNumber, address } = req.body;

  try {
    const newOwner = await prisma.ownerUser.create({
      data: {
        id: generateCustomId(name),
        name,
        phoneNumber,
        address,
      },
      include: {
        properties: true,
      },
    });

    res.status(201).json({ success: true, data: newOwner });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create owner' });
  }
};

export const getAllOwners = async (_req: Request, res: Response) => {
  try {
    const owners = await prisma.ownerUser.findMany({
      where: { isDeleted: false },
      include: {
        properties: {
          where: { isDeleted: false }, // Only include non-deleted properties
        },
      },
    });

    res.status(200).json({ success: true, data: owners });
  } catch (error) {
    console.error("Get Owners Error:", error);
    res.status(500).json({ success: false, message: 'Failed to fetch owners' });
  }
};


export const getOwnerById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const owner = await prisma.ownerUser.findUnique({
      where: { id ,isDeleted: false,},
      
      include: { properties: true },
    });
    if (!owner) return res.status(404).json({ success: false, message: 'Owner not found' });
    res.status(200).json({ success: true, data: owner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch owner' });
  }
};

export const updateOwner = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phoneNumber, address, propertyId } = req.body;

  try {
    const updatedOwner = await prisma.ownerUser.update({
      where: { id },
      data: { name, phoneNumber, address },
    });

    let updatedProperty = null;

    if (propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });

      if (!property)
        return res.status(404).json({ success: false, message: 'Property not found' });

      if (property.ownerUserId)
        return res.status(400).json({ success: false, message: 'Property already owned' });

      updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: { ownerUserId: id },
      });
    }

    const updatedOwnerWithProps = await prisma.ownerUser.findUnique({
      where: { id },
      include: { properties: true },
    });

    res.status(200).json({
      success: true,
      message: propertyId ? 'Owner updated and property assigned' : 'Owner updated',
      data: updatedOwnerWithProps,
    });
  } catch (error) {
    console.error('Error updating owner:', error);
    res.status(500).json({ success: false, message: 'Failed to update owner' });
  }
};

export const assignPropertyToOwner = async (req: Request, res: Response) => {
  const { ownerId, propertyId } = req.body;
  try {
    const property = await prisma.property.findUnique({ where: { id: propertyId } });

    if (!property)
      return res.status(404).json({ success: false, message: 'Property not found' });

    if (property.ownerUserId)
      return res.status(400).json({ success: false, message: 'Property already assigned' });

    await prisma.property.update({
      where: { id: propertyId },
      data: { ownerUserId: ownerId },
    });

    const ownerWithUpdatedProperties = await prisma.ownerUser.findUnique({
      where: { id: ownerId },
      include: { properties: true },
    });

    res.status(200).json({ success: true, data: ownerWithUpdatedProperties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to assign property' });
  }
};

// export const deleteOwner = async (req: Request, res: Response) => {
//   const { id } = req.params;

//   try {
//     await prisma.ownerUser.delete({ where: { id } });
//     res.status(200).json({ success: true, message: 'Owner deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, message: 'Failed to delete owner' });
//   }
// };

export const deleteOwner = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if there are any properties that are not soft-deleted
    const activeProperties = await prisma.property.findMany({
      where: {
        ownerUserId: id,
        isDeleted: false,
      },
    });

    if (activeProperties.length > 0) {
      res.status(400).json({
        message: "Please delete all properties before deleting the owner",
      });
      return;
    }

    await prisma.ownerUser.update({
      where: { id },
      data: { isDeleted: true },
    });

    res.status(200).json({ message: "Owner deleted successfully" });
  } catch (error: any) {
    console.error("Delete Owner Error:", error);
    res.status(500).json({ message: error.message || "Failed to delete owner" });
  }
};
