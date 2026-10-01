import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { calculateFoodStatus } from '../utils/status';

export const getFoods = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const items = await prisma.foodItem.findMany({
      where: { userId },
      orderBy: { expiryDate: 'asc' }
    });

    // Update statuses on the fly so UI always has crisp real-time calculated statuses
    const updatedItems = items.map(item => {
      const currentStatus = calculateFoodStatus(item.expiryDate);
      return {
        ...item,
        status: currentStatus
      };
    });

    return res.json(updatedItems);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch food items', error: error.message });
  }
};

export const createFood = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, quantity, unit, expiryDate, category, storageLocation, notes } = req.body;

    if (!name || !expiryDate) {
      return res.status(400).json({ message: 'Food name and expiry date are required' });
    }

    const expiry = new Date(expiryDate);
    const status = calculateFoodStatus(expiry);

    const food = await prisma.foodItem.create({
      data: {
        userId,
        name: name.trim(),
        quantity: quantity !== undefined ? parseFloat(quantity) : 1,
        unit: unit || 'pcs',
        expiryDate: expiry,
        category: category || 'Pantry',
        storageLocation: storageLocation || 'Fridge',
        notes: notes || null,
        status
      }
    });

    return res.status(201).json(food);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to create food item', error: error.message });
  }
};

export const getFoodById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const food = await prisma.foodItem.findFirst({
      where: { id, userId }
    });

    if (!food) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const currentStatus = calculateFoodStatus(food.expiryDate);
    return res.json({ ...food, status: currentStatus });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch food item', error: error.message });
  }
};

export const updateFood = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const existing = await prisma.foodItem.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    const { name, quantity, unit, expiryDate, category, storageLocation, notes, status: manualStatus } = req.body;

    const expiry = expiryDate ? new Date(expiryDate) : existing.expiryDate;
    const status = expiryDate ? calculateFoodStatus(expiry) : (manualStatus || existing.status);

    const updated = await prisma.foodItem.update({
      where: { id },
      data: {
        name: name !== undefined ? name.trim() : existing.name,
        quantity: quantity !== undefined ? parseFloat(quantity) : existing.quantity,
        unit: unit !== undefined ? unit : existing.unit,
        expiryDate: expiry,
        category: category !== undefined ? category : existing.category,
        storageLocation: storageLocation !== undefined ? storageLocation : existing.storageLocation,
        notes: notes !== undefined ? notes : existing.notes,
        status
      }
    });

    return res.json(updated);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to update food item', error: error.message });
  }
};

export const deleteFood = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { logAsWaste, reason } = req.body || {};

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const existing = await prisma.foodItem.findFirst({
      where: { id, userId }
    });

    if (!existing) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Optionally log waste before deleting if requested
    if (logAsWaste) {
      await prisma.foodWaste.create({
        data: {
          userId,
          foodItemId: null, // set to null since item is deleted
          name: existing.name,
          quantity: existing.quantity,
          unit: existing.unit,
          reason: reason || (existing.status === 'EXPIRED' ? 'Expired' : 'Spoiled'),
          date: new Date()
        }
      });
    }

    await prisma.foodItem.delete({
      where: { id }
    });

    return res.json({ message: 'Food item deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to delete food item', error: error.message });
  }
};
