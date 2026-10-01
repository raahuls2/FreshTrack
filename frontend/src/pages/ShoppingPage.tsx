import React, { useEffect, useState } from 'react';
import { ShoppingCart, Plus, Check, Trash2, PackageCheck } from 'lucide-react';
import { api } from '../services/api';
import { ShoppingItem } from '../types';

export const ShoppingPage: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('pcs');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Move to pantry prompt state
  const [moveToPantryItem, setMoveToPantryItem] = useState<ShoppingItem | null>(null);
  const [expiryDays, setExpiryDays] = useState(7);
  const [pantryCategory, setPantryCategory] = useState('Pantry');

  const fetchShopping = async () => {
    try {
      setIsLoading(true);
      const data = await api.getShopping();
      setItems(data);
    } catch (err) {
      console.error('Failed to load shopping list', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShopping();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const newItem = await api.createShopping({
        name: name.trim(),
        quantity,
        unit,
      });
      setItems([newItem, ...items]);
      setName('');
      setQuantity(1);
      setUnit('pcs');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    const newPurchasedStatus = !item.purchased;

    if (newPurchasedStatus) {
      setMoveToPantryItem(item);
    } else {
      try {
        const updated = await api.updateShopping(item.id, { purchased: false });
        setItems(items.map(i => i.id === item.id ? updated : i));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const confirmPurchase = async (addToPantry: boolean) => {
    if (!moveToPantryItem) return;
    try {
      const updated = await api.updateShopping(moveToPantryItem.id, {
        purchased: true,
        moveToPantry: addToPantry,
        expiryDays,
        category: pantryCategory,
      });

      setItems(items.map(i => i.id === moveToPantryItem.id ? updated : i));
      setMoveToPantryItem(null);
      if (addToPantry) {
        window.dispatchEvent(new Event('foodItemChanged'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteShopping(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const unpurchasedItems = items.filter(i => !i.purchased);
  const purchasedItems = items.filter(i => i.purchased);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-28 md:pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <ShoppingCart className="w-6 h-6 text-emerald-600" />
          <span>Shopping List</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {unpurchasedItems.length} items to buy • {purchasedItems.length} purchased
        </p>
      </div>

      {/* Add Shopping Item Box */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            required
            placeholder="Add item to buy (e.g. Eggs, Milk, Bread)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-xs sm:text-sm"
          />

          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              min="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              className="w-20 px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-center"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-24 px-2 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium bg-white"
            >
              <option value="pcs">pcs</option>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="L">L</option>
              <option value="ml">ml</option>
              <option value="pack">pack</option>
              <option value="loaf">loaf</option>
              <option value="box">box</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center space-x-1 min-h-[44px]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Move to Pantry Confirmation Modal */}
      {moveToPantryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-emerald-700">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <PackageCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add to Pantry Inventory?</h3>
                <p className="text-xs text-slate-500">Purchased: {moveToPantryItem.name}</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={pantryCategory}
                    onChange={(e) => setPantryCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="Pantry">Pantry & Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Meat">Meat & Poultry</option>
                    <option value="Bakery">Bakery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Expiry</label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value={3}>In 3 Days</option>
                    <option value={7}>In 7 Days</option>
                    <option value={14}>In 14 Days</option>
                    <option value={30}>In 30 Days</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => confirmPurchase(true)}
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm min-h-[44px]"
                >
                  ✓ Mark Purchased & Add to Pantry
                </button>
                <button
                  onClick={() => confirmPurchase(false)}
                  className="w-full py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 min-h-[44px]"
                >
                  Just Mark Purchased (Don't Add to Pantry)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Needed Items List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-900">
          To Buy ({unpurchasedItems.length})
        </h2>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-12 bg-slate-200 rounded-xl"></div>
          </div>
        ) : unpurchasedItems.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {unpurchasedItems.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTogglePurchased(item)}
                    aria-label={`Mark ${item.name} as purchased`}
                    className="w-6 h-6 rounded-lg border-2 border-slate-300 hover:border-emerald-600 flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
                  >
                  </button>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm">{item.name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            Your shopping list is clear.
          </div>
        )}
      </div>

      {/* Purchased Items List (Visually Separated) */}
      {purchasedItems.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <h2 className="text-sm font-bold text-slate-500">
            Purchased ({purchasedItems.length})
          </h2>

          <div className="bg-slate-100/70 rounded-2xl border border-slate-200 divide-y divide-slate-200/60 overflow-hidden">
            {purchasedItems.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleTogglePurchased(item)}
                    aria-label={`Unmark ${item.name}`}
                    className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-sm min-h-[44px] min-w-[44px]"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                  <span className="font-medium text-slate-600 text-xs sm:text-sm line-through">{item.name}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete ${item.name}`}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
