import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial' | 'Land';
type PropertyStatusType = 'Listed' | 'Active' | 'Sold' | 'Funded';

const validCategories: PropertyCategory[] = ['Residential', 'Commercial', 'Industrial', 'Land'];
const validStatuses: PropertyStatusType[] = ['Listed', 'Active', 'Sold', 'Funded'];

const isValidPropertyCategory = (value: any): value is PropertyCategory => validCategories.includes(value);
const isValidPropertyStatus = (value: any): value is PropertyStatusType => validStatuses.includes(value);

const extractImageFilenames = (files: Express.Multer.File[] | undefined): string[] => {
  if (!files) return [];
  return files.map(file => file.filename);
};

export const addProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      address,
      city,
      state,
      propertyCategory,
      propertyType,
      propertySubType,
      totalAreaSqft,
      TotalTokens,
      currentValuation,
      status,
      ownerUserId,
    } = req.body;

    if (
      !title || !description || !address || !city || !state ||
      !propertyCategory || !propertyType || !status || !ownerUserId ||
      totalAreaSqft == null || TotalTokens == null || currentValuation == null
    ) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!isValidPropertyCategory(propertyCategory)) {
      res.status(400).json({ error: 'Invalid propertyCategory value' });
      return;
    }

    if (!isValidPropertyStatus(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const area = Number(totalAreaSqft);
    const tokens = Number(TotalTokens);
    const valuation = Number(currentValuation);

    if (area <= 0 || tokens <= 0 || valuation <= 0) {
      res.status(400).json({ error: 'Numeric values must be greater than 0' });
      return;
    }

    const PricePerSqFt = valuation / area;
    const SqFtAreaPerToken = area / tokens;
    const PricePerToken = SqFtAreaPerToken * PricePerSqFt;

    const images = (req as any).cloudinaryImageUrls || [];


    const newProperty = await prisma.property.create({
      data: {
        title,
        description,
        address,
        city,
        state,
        propertyCategory,
        propertyType,
        propertySubType: propertySubType || null,
        totalAreaSqft: area,
        TotalTokens: tokens,
        currentValuation: valuation,
        PricePerSqFt: +PricePerSqFt.toFixed(4),
        SqFtAreaPerToken: +SqFtAreaPerToken.toFixed(4),
        PricePerToken: +PricePerToken.toFixed(4),
        status,
        ownerUserId,
        images,
      },
    });

    res.status(201).json(newProperty);
  } catch (error) {
    console.error('Add Property Error:', error);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const listProperties = async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('List Properties Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }
    res.status(200).json(property);
  } catch (error) {
    console.error('Get Property Error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Property not found' });
      return;
    }

    const {
      title,
      description,
      address,
      city,
      state,
      propertyCategory,
      propertyType,
      propertySubType,
      totalAreaSqft,
      TotalTokens,
      currentValuation,
      status,
      ownerUserId,
      existingImages,
    } = req.body;

    if (propertyCategory && !isValidPropertyCategory(propertyCategory)) {
      res.status(400).json({ error: 'Invalid propertyCategory value' });
      return;
    }

    if (status && !isValidPropertyStatus(status)) {
      res.status(400).json({ error: 'Invalid status value' });
      return;
    }

    const area = totalAreaSqft ? Number(totalAreaSqft) : existing.totalAreaSqft;
    const tokens = TotalTokens ? Number(TotalTokens) : existing.TotalTokens;
    const valuation = currentValuation ? Number(currentValuation) : existing.currentValuation;

    if (area <= 0 || tokens <= 0 || valuation <= 0) {
      res.status(400).json({ error: 'Numeric values must be greater than 0' });
      return;
    }

    const imagesFromReq = (req as any).cloudinaryImageUrls || [];

    const existingImgsArray = Array.isArray(existingImages) ? existingImages : existingImages ? [existingImages] : [];

    const updateData = {
      ...(title && { title }),
      ...(description && { description }),
      ...(address && { address }),
      ...(city && { city }),
      ...(state && { state }),
      ...(propertyCategory && { propertyCategory }),
      ...(propertyType && { propertyType }),
      ...(propertySubType && { propertySubType }),
      ...(ownerUserId && { ownerUserId }),
      totalAreaSqft: area,
      TotalTokens: tokens,
      currentValuation: valuation,
      PricePerSqFt: +(valuation / area).toFixed(4),
      SqFtAreaPerToken: +(area / tokens).toFixed(4),
      PricePerToken: +((area / tokens) * (valuation / area)).toFixed(4),
      status: status || existing.status,
      //images: [...existingImgsArray, ...imagesFromReq],
      updatedAt: new Date(),
    };

    const updated = await prisma.property.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json(updated);
  } catch (error) {
    console.error('Update Property Error:', error);
    res.status(500).json({ error: 'Failed to update property', details: (error as Error).message });
  }
};

// export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const property = await prisma.property.findUnique({ where: { id: req.params.id } });
//     if (!property) {
//       res.status(404).json({ error: 'Property not found' });
//       return;
//     }
//     await prisma.property.delete({ where: { id: req.params.id } });
//     res.status(204).send();
//   } catch (error) {
//     console.error('Delete Property Error:', error);
//     res.status(500).json({ error: 'Failed to delete property' });
//   }
// };

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Check if the property exists
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }

    // Delete the property
    await prisma.property.delete({ where: { id } });

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error: any) {
    console.error("Delete Property Error:", error);
    res.status(500).json({ error: error.message || "Failed to delete property" });
  }
};

export const getPropertiesByStatus = async (req: Request, res: Response): Promise<void> => {
  const { status } = req.params;
  if (!isValidPropertyStatus(status)) {
    res.status(400).json({ error: 'Invalid status value' });
    return;
  }

  try {
    const properties = await prisma.property.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('Get Properties by Status Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const getPropertiesByCategory = async (req: Request, res: Response): Promise<void> => {
  const { category } = req.params;
  if (!isValidPropertyCategory(category)) {
    res.status(400).json({ error: 'Invalid category value' });
    return;
  }

  try {
    const properties = await prisma.property.findMany({
      where: { propertyCategory: category },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('Get Properties by Category Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const getPropertiesByOwner = async (req: Request, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      where: { ownerUserId: req.params.ownerUserId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('Get Properties by Owner Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const listHomeProps = async (_req: Request, res: Response): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        images: true,
        PricePerSqFt: true,
      },
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error('List Properties Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};


export const getPropertiesByCity = async (req: Request, res: Response): Promise<void> => {
  const { city } = req.params;

  if (!city) {
    res.status(400).json({ error: 'City parameter is required' });
    return;
  }

  try {
    const properties = await prisma.property.findMany({
      where: { city: { equals: city, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('Get Properties by City Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties by city' });
  }
};


export const getPropertiesByState = async (req: Request, res: Response): Promise<void> => {
  const { state } = req.params;

  if (!state) {
    res.status(400).json({ error: 'State parameter is required' });
    return;
  }

  try {
    const properties = await prisma.property.findMany({
      where: { state: { equals: state, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(properties);
  } catch (error) {
    console.error('Get Properties by State Error:', error);
    res.status(500).json({ error: 'Failed to fetch properties by state' });
  }
};

