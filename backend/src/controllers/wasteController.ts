import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';

export const getWaste = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const wasteLogs = await prisma.foodWaste.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    // Compute basic analytics
    const totalCount = wasteLogs.length;
    const reasonBreakdown: Record<string, number> = {};

    wasteLogs.forEach(w => {
      reasonBreakdown[w.reason] = (reasonBreakdown[w.reason] || 0) + 1;
    });

    return res.json({
      logs: wasteLogs,
      summary: {
        totalCount,
        reasonBreakdown
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch waste records', error: error.message });
  }
};

export const createWaste = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, quantity, unit, reason, foodItemId, date } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const waste = await prisma.foodWaste.create({
      data: {
        userId,
        foodItemId: foodItemId || null,
        name: name.trim(),
        quantity: quantity !== undefined ? parseFloat(quantity) : 1,
        unit: unit || 'pcs',
        reason: reason || 'Expired',
        date: date ? new Date(date) : new Date()
      }
    });

    return res.status(201).json(waste);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to log food waste', error: error.message });
  }
};
