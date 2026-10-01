import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { calculateFoodStatus } from '../utils/status';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const allFoods = await prisma.foodItem.findMany({
      where: { userId },
      orderBy: { expiryDate: 'asc' }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tonight = new Date();
    tonight.setHours(23, 59, 59, 999);

    let expiredCount = 0;
    let expiringSoonCount = 0;
    let expiringTodayCount = 0;
    let freshCount = 0;

    const foodsWithStatus = allFoods.map(item => {
      const status = calculateFoodStatus(item.expiryDate);
      const itemExpiry = new Date(item.expiryDate);
      itemExpiry.setHours(0, 0, 0, 0);

      if (status === 'EXPIRED') {
        expiredCount++;
      } else if (status === 'EXPIRING_SOON') {
        expiringSoonCount++;
        if (itemExpiry.getTime() === today.getTime()) {
          expiringTodayCount++;
        }
      } else {
        freshCount++;
      }

      return {
        ...item,
        status
      };
    });

    // "Use these first": Prioritize EXPIRED and EXPIRING_SOON ordered by expiryDate
    const useFirst = foodsWithStatus
      .filter(item => item.status === 'EXPIRED' || item.status === 'EXPIRING_SOON')
      .slice(0, 8);

    // Recently added (last 5)
    const recentlyAdded = [...foodsWithStatus]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Shopping items count (unpurchased)
    const shoppingCount = await prisma.shoppingItem.count({
      where: { userId, purchased: false }
    });

    const recentShoppingList = await prisma.shoppingItem.findMany({
      where: { userId, purchased: false },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    // Waste summary
    const wasteCount = await prisma.foodWaste.count({
      where: { userId }
    });

    const recentWaste = await prisma.foodWaste.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 5
    });

    return res.json({
      summary: {
        totalFoodItems: allFoods.length,
        itemsExpiringToday: expiringTodayCount,
        itemsExpiringSoon: expiringSoonCount,
        expiredItems: expiredCount,
        freshItems: freshCount,
        shoppingCount,
        wasteCount
      },
      attention: {
        expired: foodsWithStatus.filter(f => f.status === 'EXPIRED'),
        expiringSoon: foodsWithStatus.filter(f => f.status === 'EXPIRING_SOON'),
        fresh: foodsWithStatus.filter(f => f.status === 'FRESH')
      },
      useFirst,
      recentlyAdded,
      shoppingListPreview: recentShoppingList,
      wasteSummary: {
        total: wasteCount,
        recent: recentWaste
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to fetch dashboard data', error: error.message });
  }
};
