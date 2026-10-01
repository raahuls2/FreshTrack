import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { calculateFoodStatus } from '../utils/status';

export const getShopping = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const items = await prisma.shoppingItem.findMany({
      where: { userId },
      orderBy: [{ purchased: 'asc' }, { createdAt: 'desc' }]
    });

    return res.json(items);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch shopping items', error: error.message });
  }
};

export const createShopping = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, quantity, unit } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const item = await prisma.shoppingItem.create({
      data: {
        userId,
        name: name.trim(),
        quantity: quantity !== undefined ? parseFloat(quantity) : 1,
        unit: unit || 'pcs',
        purchased: false
      }
    });

    return res.status(201).json(item);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create shopping item', error: error.message });
  }
};

export const updateShopping = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const existing = await prisma.shoppingItem.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Shopping item not found' });
    }

    const { name, quantity, unit, purchased, moveToPantry, expiryDays, category, storageLocation } = req.body;

    const updated = await prisma.shoppingItem.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        quantity: quantity !== undefined ? parseFloat(quantity) : existing.quantity,
        unit: unit !== undefined ? unit : existing.unit,
        purchased: purchased !== undefined ? Boolean(purchased) : existing.purchased
      }
    });

    // If option to add directly to pantry on purchase is enabled
    if (moveToPantry && purchased) {
      const days = expiryDays ? parseInt(expiryDays) : 7;
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + days);

      await prisma.foodItem.create({
        data: {
          userId,
          name: updated.name,
          quantity: updated.quantity,
          unit: updated.unit,
          expiryDate: expiry,
          category: category || 'Pantry',
          storageLocation: storageLocation || 'Fridge',
          status: calculateFoodStatus(expiry)
        }
      });
    }

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update shopping item', error: error.message });
  }
};

export const deleteShopping = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const existing = await prisma.shoppingItem.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Shopping item not found' });
    }

    await prisma.shoppingItem.delete({
      where: { id }
    });

    return res.json({ message: 'Shopping item deleted' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete shopping item', error: error.message });
  }
};
