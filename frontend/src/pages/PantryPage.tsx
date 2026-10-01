import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Plus, Calendar, MapPin, RefreshCw, Package 
} from 'lucide-react';
import { api } from '../services/api';
import { FoodItem, FoodStatus } from '../types';

interface PantryPageProps {
  onOpenQuickAdd: () => void;
  onSelectEditFood: (food: FoodItem) => void;
}

export const PantryPage: React.FC<PantryPageProps> = ({ onOpenQuickAdd, onSelectEditFood }) => {
  const [searchParams] = useSearchParams();
  const initialStatusFilter = (searchParams.get('status') as FoodStatus | 'ALL') || 'ALL';

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'expiryAsc' | 'expiryDesc' | 'name'>('expiryAsc');

  const fetchFoods = async () => {
    try {
      setIsLoading(true);
      const data = await api.getFoods();
      setFoods(data);
    } catch (err) {
      console.error('Failed to load foods', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
    window.addEventListener('foodItemChanged', fetchFoods);
    return () => window.removeEventListener('foodItemChanged', fetchFoods);
  }, []);

  // Filter & Sort logic
  const filteredFoods = foods.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesLocation = selectedLocation === 'ALL' || item.storageLocation === selectedLocation;

    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    const timeA = new Date(a.expiryDate).getTime();
    const timeB = new Date(b.expiryDate).getTime();
    return sortBy === 'expiryAsc' ? timeA - timeB : timeB - timeA;
  });

  const categories = Array.from(new Set(foods.map(f => f.category)));
  const locations = Array.from(new Set(foods.map(f => f.storageLocation)));

  const getStatusBadge = (status: FoodStatus) => {
    switch (status) {
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold rounded-md flex items-center space-x-1">
            <span>🔴 Expired</span>
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-md flex items-center space-x-1">
            <span>🟡 Use soon</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-md flex items-center space-x-1">
            <span>🟢 Fresh</span>
          </span>
        );
    }
  };

  const getDaysLabel = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expiryDateStr);
    exp.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `Expired ${Math.abs(diffDays)}d ago`;
    if (diffDays === 0) return 'Expires today!';
    if (diffDays === 1) return 'Expires tomorrow';
    return `Expires in ${diffDays} days`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-12">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <span>Pantry Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredFoods.length} of {foods.length} items
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchFoods}
            title="Refresh pantry"
            aria-label="Refresh pantry"
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenQuickAdd}
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all text-xs sm:text-sm min-h-[44px]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Add Food</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-semibold bg-white text-slate-800"
            >
              <option value="ALL">Status: All</option>
              <option value="FRESH">🟢 Fresh</option>
              <option value="EXPIRING_SOON">🟡 Use Soon</option>
              <option value="EXPIRED">🔴 Expired</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium bg-white text-slate-800"
            >
              <option value="ALL">Category: All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Storage Filter */}
          <div>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium bg-white text-slate-800"
            >
              <option value="ALL">Storage: All</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 font-medium bg-white text-slate-800"
            >
              <option value="expiryAsc">Sort: Expiry (Earliest)</option>
              <option value="expiryDesc">Sort: Expiry (Latest)</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      ) : filteredFoods.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredFoods.map((food) => {
            const daysLabel = getDaysLabel(food.expiryDate);
            const isExpired = food.status === 'EXPIRED';
            const isExpiringSoon = food.status === 'EXPIRING_SOON';

            return (
              <div
                key={food.id}
                onClick={() => onSelectEditFood(food)}
                className={`cursor-pointer bg-white p-4 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
                  isExpired
                    ? 'border-rose-300 ring-1 ring-rose-200'
                    : isExpiringSoon
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {food.category}
                    </span>
                    {getStatusBadge(food.status)}
                  </div>

                  <h3 className="font-bold text-slate-900 text-base">
                    {food.name}
                  </h3>

                  <div className="mt-1 flex items-baseline space-x-1">
                    <span className="text-xl font-extrabold text-slate-800">{food.quantity}</span>
                    <span className="text-xs font-medium text-slate-500">{food.unit}</span>
                  </div>

                  {food.notes && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">
                      "{food.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span
                      className={
                        isExpired
                          ? 'text-rose-600 font-bold'
                          : isExpiringSoon
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                      }
                    >
                      {daysLabel}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-slate-400 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{food.storageLocation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
          <Package className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Your pantry is empty or no items match</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Add your first food item or reset search filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              setSelectedLocation('ALL');
            }}
            className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
