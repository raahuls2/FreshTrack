export type FoodStatus = 'FRESH' | 'EXPIRING_SOON' | 'EXPIRED';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Household {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoodItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string;
  storageLocation: string;
  status: FoodStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShoppingItem {
  id: string;
  userId: string;
  name: string;
  quantity: number;
  unit: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FoodWaste {
  id: string;
  userId: string;
  foodItemId?: string | null;
  name: string;
  quantity: number;
  unit: string;
  reason: string;
  date: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: string;
  ingredients: string[];
  instructions: string;
  image: string;
  matchingIngredients?: string[];
  missingIngredients?: string[];
  matchScore?: number;
}

export interface DashboardSummary {
  summary: {
    totalFoodItems: number;
    itemsExpiringToday: number;
    itemsExpiringSoon: number;
    expiredItems: number;
    freshItems: number;
    shoppingCount: number;
    wasteCount: number;
  };
  attention: {
    expired: FoodItem[];
    expiringSoon: FoodItem[];
    fresh: FoodItem[];
  };
  useFirst: FoodItem[];
  recentlyAdded: FoodItem[];
  shoppingListPreview: ShoppingItem[];
  wasteSummary: {
    total: number;
    recent: FoodWaste[];
  };
}
