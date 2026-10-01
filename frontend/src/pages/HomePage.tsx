import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertCircle, Clock, CheckCircle2, ShoppingCart, Plus, ChevronRight, 
  ArrowRight, Utensils, Calendar, RefreshCw, Package, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardSummary, FoodItem } from '../types';
import { useAuth } from '../context/AuthContext';

interface HomePageProps {
  onOpenQuickAdd: () => void;
  onSelectEditFood: (food: FoodItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenQuickAdd, onSelectEditFood }) => {
  const { user, household } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newShoppingName, setNewShoppingName] = useState('');
  const [isAddingShopping, setIsAddingShopping] = useState(false);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await api.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    window.addEventListener('foodItemChanged', fetchDashboard);
    return () => window.removeEventListener('foodItemChanged', fetchDashboard);
  }, []);

  const handleAddQuickShopping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoppingName.trim()) return;
    try {
      setIsAddingShopping(true);
      await api.createShopping({ name: newShoppingName.trim() });
      setNewShoppingName('');
      fetchDashboard();
    } catch (err) {
      console.error(err);
    } finally {
      setIsAddingShopping(false);
    }
  };

  const getDaysLabel = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Expired ${Math.abs(diffDays)}d ago`;
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-pulse">
        <div className="h-24 bg-slate-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
          <div className="h-28 bg-slate-200 rounded-2xl"></div>
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl"></div>
      </div>
    );
  }

  const { summary, useFirst, shoppingListPreview, wasteSummary } = dashboard || {
    summary: { totalFoodItems: 0, itemsExpiringToday: 0, itemsExpiringSoon: 0, expiredItems: 0, freshItems: 0, shoppingCount: 0, wasteCount: 0 },
    useFirst: [],
    shoppingListPreview: [],
    wasteSummary: { total: 0, recent: [] }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-28 md:pb-12">
      {/* 1. Greeting & Household Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{household?.name || 'Household Inventory'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Hello, {user?.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md">
            {summary.expiredItems > 0 || summary.itemsExpiringSoon > 0
              ? `You have ${summary.expiredItems + summary.itemsExpiringSoon} item${summary.expiredItems + summary.itemsExpiringSoon === 1 ? '' : 's'} requiring attention.`
              : 'Your food inventory is completely fresh and organized!'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all text-xs sm:text-sm min-h-[44px]"
            aria-label="Add Food Item"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Food</span>
          </button>
          <button
            onClick={fetchDashboard}
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Primary 4 Questions Dashboard Section */}
      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900">What needs your attention?</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {/* 🔴 1. What has expired? */}
          <Link
            to="/pantry?status=EXPIRED"
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group ${
              summary.expiredItems > 0
                ? 'bg-rose-50/90 border-rose-200 hover:border-rose-300 shadow-sm'
                : 'bg-white border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Expired</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-rose-700">
                {summary.expiredItems}
              </span>
              <p className="text-[11px] font-semibold text-rose-600 mt-0.5">
                🔴 {summary.expiredItems === 1 ? '1 item expired' : `${summary.expiredItems} items expired`}
              </p>
            </div>
          </Link>

          {/* 🟡 2. What should I use soon? */}
          <Link
            to="/pantry?status=EXPIRING_SOON"
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between group ${
              summary.itemsExpiringSoon > 0
                ? 'bg-amber-50/90 border-amber-200 hover:border-amber-300 shadow-sm'
                : 'bg-white border-slate-200 opacity-80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Use Soon</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">
                {summary.itemsExpiringSoon}
              </span>
              <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                🟡 {summary.itemsExpiringToday > 0 ? `${summary.itemsExpiringToday} today` : 'Within 3 days'}
              </p>
            </div>
          </Link>

          {/* 🟢 3. What food do I have? */}
          <Link
            to="/pantry"
            className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 hover:border-emerald-300 shadow-sm transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Food</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                {summary.totalFoodItems}
              </span>
              <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                🟢 {summary.freshItems} fresh items
              </p>
            </div>
          </Link>

          {/* 🛒 4. What do I need to buy? */}
          <Link
            to="/shopping"
            className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200 hover:border-sky-300 shadow-sm transition-all duration-200 flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 flex items-center space-x-1">
                <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
                <span>To Buy</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>

            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-sky-700">
                {summary.shoppingCount}
              </span>
              <p className="text-[11px] font-semibold text-sky-700 mt-0.5">
                🛒 {summary.shoppingCount === 1 ? '1 item needed' : `${summary.shoppingCount} items needed`}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. "Use these first" Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Use these first</h2>
            <p className="text-xs text-slate-500">Ordered by nearest expiry date</p>
          </div>
          <Link
            to="/pantry"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
          >
            <span>View All ({summary.totalFoodItems})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {useFirst.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {useFirst.map((item) => {
              const daysText = getDaysLabel(item.expiryDate);
              const isExpired = item.status === 'EXPIRED';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectEditFood(item)}
                  className={`cursor-pointer p-4 rounded-2xl border transition-all hover:shadow-md bg-white flex flex-col justify-between ${
                    isExpired
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : 'border-amber-300 ring-1 ring-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      <span className="text-xs font-medium text-slate-500">
                        {item.quantity} {item.unit}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${
                        isExpired
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isExpired ? 'Expired' : 'Use Soon'}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span className={isExpired ? 'text-rose-600 font-bold' : 'text-amber-700'}>
                        {daysText}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      {item.storageLocation}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-800 text-sm">No items expiring soon</p>
            <p className="text-xs text-slate-500">All your food has a healthy expiry buffer.</p>
          </div>
        )}
      </section>

      {/* 4. Shopping Preview & Quick Insights Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shopping list preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span>Shopping List</span>
              </h2>
            </div>
            <Link
              to="/shopping"
              className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
            >
              <span>Manage Shopping</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <form onSubmit={handleAddQuickShopping} className="flex gap-2">
              <input
                type="text"
                placeholder="Quick add item to buy..."
                value={newShoppingName}
                onChange={(e) => setNewShoppingName(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={isAddingShopping}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all min-h-[40px]"
              >
                + Add
              </button>
            </form>

            {shoppingListPreview.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {shoppingListPreview.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 text-xs sm:text-sm">{item.name}</span>
                    <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-2">
                Your shopping list is clear.
              </p>
            )}
          </div>
        </div>

        {/* Recipe suggestion teaser */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Pantry Recipes</h2>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Use existing ingredients</span>
            </div>
            <p className="text-xs text-slate-600">
              Discover recipes tailored to items in your pantry, prioritizing food near expiry.
            </p>
            <Link
              to="/recipes"
              className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:underline pt-1"
            >
              <span>Explore Pantry Recipes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
