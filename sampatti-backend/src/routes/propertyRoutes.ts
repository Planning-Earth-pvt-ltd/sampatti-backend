import { Router, Request, Response } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all properties
router.get('/', async (req: Request, res: Response) => {
    try {
        const properties = await prisma.property.findMany();
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// Get a property by ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const property = await prisma.property.findUnique({
            where: { id: Number(id) },
        });
        if (property) {
            res.json(property);
        } else {
            res.status(404).json({ error: 'Property not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch property' });
    }
});

// Create a new property
router.post('/', async (req: Request, res: Response) => {
    const { name, location, price } = req.body;
    try {
        const newProperty = await prisma.property.create({
            data: { name, location, price },
        });
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create property' });
    }
});

// Update a property by ID
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, location, price } = req.body;
    try {
        const updatedProperty = await prisma.property.update({
            where: { id: Number(id) },
            data: { name, location, price },
        });
        res.json(updatedProperty);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update property' });
    }
});

// Delete a property by ID
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.property.delete({
            where: { id: Number(id) },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete property' });
    }
});

export default router;