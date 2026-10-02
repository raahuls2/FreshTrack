import { User, Household, FoodItem, ShoppingItem, FoodWaste, Recipe, DashboardSummary } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('freshtrack_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// Initial Demo State for client fallback
const DEMO_USER: User = {
  id: 'demo-user-id',
  name: 'Sarah Jenkins',
  email: 'demo@freshtrack.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const DEMO_HOUSEHOLD: Household = {
  id: 'demo-household-id',
  name: "Jenkins Family Kitchen",
  ownerId: 'demo-user-id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const getDaysDateStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
};

const calculateStatus = (expiryDateInput: string) => {
  const expiry = new Date(expiryDateInput);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiryDay = new Date(expiry);
  expiryDay.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiryDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'EXPIRED';
  if (diffDays <= 3) return 'EXPIRING_SOON';
  return 'FRESH';
};

// Initial local storage items if offline fallback is used
function getLocalFoods(): FoodItem[] {
  const stored = localStorage.getItem('freshtrack_local_foods');
  if (stored) return JSON.parse(stored);

  const initial: FoodItem[] = [
    { id: 'f1', userId: 'demo-user-id', name: 'Spinach', category: 'Vegetables', quantity: 250, unit: 'g', purchaseDate: getDaysDateStr(0), expiryDate: getDaysDateStr(0), storageLocation: 'Crisper Drawer', status: 'EXPIRING_SOON', notes: 'Use for salad today', createdAt: getDaysDateStr(0), updatedAt: getDaysDateStr(0) },
    { id: 'f2', userId: 'demo-user-id', name: 'Tomatoes', category: 'Vegetables', quantity: 750, unit: 'g', purchaseDate: getDaysDateStr(-1), expiryDate: getDaysDateStr(1), storageLocation: 'Fridge', status: 'EXPIRING_SOON', notes: 'Vine ripe tomatoes', createdAt: getDaysDateStr(-1), updatedAt: getDaysDateStr(-1) },
    { id: 'f3', userId: 'demo-user-id', name: 'Bananas', category: 'Fruits', quantity: 6, unit: 'pcs', purchaseDate: getDaysDateStr(-2), expiryDate: getDaysDateStr(2), storageLocation: 'Countertop', status: 'EXPIRING_SOON', notes: 'Great for smoothies', createdAt: getDaysDateStr(-2), updatedAt: getDaysDateStr(-2) },
    { id: 'f4', userId: 'demo-user-id', name: 'Milk', category: 'Dairy', quantity: 1, unit: 'L', purchaseDate: getDaysDateStr(-3), expiryDate: getDaysDateStr(3), storageLocation: 'Fridge Door', status: 'EXPIRING_SOON', notes: 'Whole milk', createdAt: getDaysDateStr(-3), updatedAt: getDaysDateStr(-3) },
    { id: 'f5', userId: 'demo-user-id', name: 'Apples', category: 'Fruits', quantity: 1, unit: 'kg', purchaseDate: getDaysDateStr(-1), expiryDate: getDaysDateStr(6), storageLocation: 'Fridge', status: 'FRESH', notes: 'Honeycrisp apples', createdAt: getDaysDateStr(-1), updatedAt: getDaysDateStr(-1) },
    { id: 'f6', userId: 'demo-user-id', name: 'Potatoes', category: 'Vegetables', quantity: 2, unit: 'kg', purchaseDate: getDaysDateStr(-4), expiryDate: getDaysDateStr(15), storageLocation: 'Pantry', status: 'FRESH', notes: 'Yukon Gold potatoes', createdAt: getDaysDateStr(-4), updatedAt: getDaysDateStr(-4) },
    { id: 'f7', userId: 'demo-user-id', name: 'Greek Yogurt', category: 'Dairy', quantity: 1, unit: 'tub', purchaseDate: getDaysDateStr(-10), expiryDate: getDaysDateStr(-2), storageLocation: 'Fridge', status: 'EXPIRED', notes: 'Vanilla flavor', createdAt: getDaysDateStr(-10), updatedAt: getDaysDateStr(-10) },
  ];
  localStorage.setItem('freshtrack_local_foods', JSON.stringify(initial));
  return initial;
}

function getLocalShopping(): ShoppingItem[] {
  const stored = localStorage.getItem('freshtrack_local_shopping');
  if (stored) return JSON.parse(stored);
  const initial: ShoppingItem[] = [
    { id: 's1', userId: 'demo-user-id', name: 'Eggs', quantity: 12, unit: 'pcs', purchased: false, createdAt: getDaysDateStr(0), updatedAt: getDaysDateStr(0) },
    { id: 's2', userId: 'demo-user-id', name: 'Whole Wheat Bread', quantity: 1, unit: 'loaf', purchased: false, createdAt: getDaysDateStr(0), updatedAt: getDaysDateStr(0) },
    { id: 's3', userId: 'demo-user-id', name: 'Butter', quantity: 250, unit: 'g', purchased: true, createdAt: getDaysDateStr(0), updatedAt: getDaysDateStr(0) }
  ];
  localStorage.setItem('freshtrack_local_shopping', JSON.stringify(initial));
  return initial;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn(`API network request to ${endpoint} failed, using demo state fallback.`);
  }

  // Client-side Fallback handler for hosted demo compatibility
  if (endpoint === '/auth/login' || endpoint === '/auth/register') {
    const fakeToken = 'freshtrack_demo_jwt_token_2026';
    return { user: DEMO_USER, household: DEMO_HOUSEHOLD, token: fakeToken } as unknown as T;
  }

  if (endpoint === '/auth/me') {
    return { user: DEMO_USER, household: DEMO_HOUSEHOLD } as unknown as T;
  }

  if (endpoint === '/foods' && options.method === 'POST') {
    const body = JSON.parse((options.body as string) || '{}');
    const foods = getLocalFoods();
    const expiry = body.expiryDate || getDaysDateStr(3);
    const newFood: FoodItem = {
      id: `food-${Date.now()}`,
      userId: DEMO_USER.id,
      name: body.name || 'Food Item',
      quantity: body.quantity || 1,
      unit: body.unit || 'pcs',
      purchaseDate: new Date().toISOString(),
      expiryDate: expiry,
      category: body.category || 'Pantry',
      storageLocation: body.storageLocation || 'Fridge',
      status: calculateStatus(expiry) as any,
      notes: body.notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedFoods = [newFood, ...foods];
    localStorage.setItem('freshtrack_local_foods', JSON.stringify(updatedFoods));
    return newFood as unknown as T;
  }

  if (endpoint === '/foods') {
    const foods = getLocalFoods().map(f => ({ ...f, status: calculateStatus(f.expiryDate) as any }));
    return foods as unknown as T;
  }

  if (endpoint === '/shopping') {
    return getLocalShopping() as unknown as T;
  }

  if (endpoint === '/dashboard') {
    const foods = getLocalFoods().map(f => ({ ...f, status: calculateStatus(f.expiryDate) as any }));
    const shopping = getLocalShopping().filter(s => !s.purchased);
    
    return {
      summary: {
        totalFoodItems: foods.length,
        itemsExpiringToday: foods.filter(f => calculateStatus(f.expiryDate) === 'EXPIRING_SOON').length,
        itemsExpiringSoon: foods.filter(f => f.status === 'EXPIRING_SOON').length,
        expiredItems: foods.filter(f => f.status === 'EXPIRED').length,
        freshItems: foods.filter(f => f.status === 'FRESH').length,
        shoppingCount: shopping.length,
        wasteCount: 3
      },
      attention: {
        expired: foods.filter(f => f.status === 'EXPIRED'),
        expiringSoon: foods.filter(f => f.status === 'EXPIRING_SOON'),
        fresh: foods.filter(f => f.status === 'FRESH')
      },
      useFirst: foods.filter(f => f.status === 'EXPIRED' || f.status === 'EXPIRING_SOON'),
      recentlyAdded: foods.slice(0, 5),
      shoppingListPreview: shopping.slice(0, 5),
      wasteSummary: { total: 3, recent: [] }
    } as unknown as T;
  }

  if (endpoint === '/recipes' || endpoint === '/recipes/suggestions') {
    const foods = getLocalFoods();
    const pantryNames = foods.map(f => f.name.toLowerCase());
    return [
      {
        id: 'r1',
        name: 'Tomato & Spinach Omelette',
        category: 'Breakfast',
        ingredients: ['Tomatoes', 'Spinach', 'Eggs', 'Butter'],
        matchingIngredients: ['Tomatoes', 'Spinach'],
        missingIngredients: ['Eggs', 'Butter'],
        matchScore: 50,
        instructions: '1. Sauté tomatoes and spinach.\n2. Add beaten eggs and cook until set.',
        image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'r2',
        name: 'Banana Apple Smoothie',
        category: 'Drinks',
        ingredients: ['Bananas', 'Apples', 'Milk', 'Greek Yogurt'],
        matchingIngredients: ['Bananas', 'Apples', 'Milk', 'Greek Yogurt'],
        missingIngredients: [],
        matchScore: 100,
        instructions: '1. Blend bananas, apples, milk, and yogurt until smooth.',
        image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80'
      }
    ] as unknown as T;
  }

  if (endpoint === '/waste') {
    return { logs: [], summary: { totalCount: 3, reasonBreakdown: { 'Expired': 2, 'Spoiled': 1 } } } as unknown as T;
  }

  throw new Error('Action failed');
}

export const api = {
  register: (data: { name: string; email: string; password: string; householdName?: string }) =>
    request<{ user: User; household: Household; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; household: Household; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<{ user: User; household: Household }>('/auth/me'),

  getFoods: () => request<FoodItem[]>('/foods'),

  getFoodById: (id: string) => request<FoodItem>(`/foods/${id}`),

  createFood: (data: Partial<FoodItem>) =>
    request<FoodItem>('/foods', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFood: (id: string, data: Partial<FoodItem>) =>
    request<FoodItem>(`/foods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteFood: (id: string, logAsWaste: boolean = false, reason?: string) =>
    request<{ message: string }>(`/foods/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ logAsWaste, reason }),
    }),

  getShopping: () => request<ShoppingItem[]>('/shopping'),

  createShopping: (data: { name: string; quantity?: number; unit?: string }) =>
    request<ShoppingItem>('/shopping', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateShopping: (id: string, data: Partial<ShoppingItem> & { moveToPantry?: boolean; expiryDays?: number; category?: string; storageLocation?: string }) =>
    request<ShoppingItem>(`/shopping/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteShopping: (id: string) =>
    request<{ message: string }>(`/shopping/${id}`, {
      method: 'DELETE',
    }),

  getWaste: () => request<{ logs: FoodWaste[]; summary: { totalCount: number; reasonBreakdown: Record<string, number> } }>('/waste'),

  createWaste: (data: { name: string; quantity?: number; unit?: string; reason?: string; foodItemId?: string }) =>
    request<FoodWaste>('/waste', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDashboard: () => request<DashboardSummary>('/dashboard'),

  getRecipes: () => request<Recipe[]>('/recipes'),

  getRecipeSuggestions: () => request<Recipe[]>('/recipes/suggestions'),
};
