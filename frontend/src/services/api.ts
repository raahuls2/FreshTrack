import { User, Household, FoodItem, ShoppingItem, FoodWaste, Recipe, DashboardSummary } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('freshtrack_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
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

  // Foods
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

  // Shopping
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

  // Waste
  getWaste: () => request<{ logs: FoodWaste[]; summary: { totalCount: number; reasonBreakdown: Record<string, number> } }>('/waste'),

  createWaste: (data: { name: string; quantity?: number; unit?: string; reason?: string; foodItemId?: string }) =>
    request<FoodWaste>('/waste', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard
  getDashboard: () => request<DashboardSummary>('/dashboard'),

  // Recipes
  getRecipes: () => request<Recipe[]>('/recipes'),

  getRecipeSuggestions: () => request<Recipe[]>('/recipes/suggestions'),
};
