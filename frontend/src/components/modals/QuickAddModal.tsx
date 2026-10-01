import React, { useState } from 'react';
import { X, Calendar, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/api';
import { FoodItem } from '../../types';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (food: FoodItem) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 3);
  const defaultExpiryStr = defaultExpiry.toISOString().split('T')[0];

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState(defaultExpiryStr);

  const [showOptional, setShowOptional] = useState(false);
  const [category, setCategory] = useState('Pantry');
  const [storageLocation, setStorageLocation] = useState('Fridge');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Food name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const newFood = await api.createFood({
        name: name.trim(),
        quantity: quantity || 1,
        unit,
        expiryDate,
        category,
        storageLocation,
        notes: notes.trim() || undefined,
      });

      onSuccess(newFood);
      window.dispatchEvent(new Event('foodItemChanged'));
      
      // Reset
      setName('');
      setQuantity(1);
      setUnit('pcs');
      setExpiryDate(defaultExpiryStr);
      setShowOptional(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add food item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickExpirySelect = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setExpiryDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
              ⚡
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Quick Add Food</h3>
              <p className="text-xs text-slate-500">Fast pantry entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Food Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Food Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tomatoes, Milk, Spinach"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              autoFocus
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium bg-white"
              >
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pack">pack</option>
                <option value="bag">bag</option>
                <option value="tub">tub</option>
                <option value="loaf">loaf</option>
              </select>
            </div>
          </div>

          {/* Expiry Date */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700">Expiry Date *</label>
            </div>

            <div className="flex gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => handleQuickExpirySelect(0)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 rounded-lg border border-rose-200"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpirySelect(1)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-700 rounded-lg border border-amber-200"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpirySelect(3)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleQuickExpirySelect(7)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-700 rounded-lg"
              >
                +1 Wk
              </button>
            </div>

            <div className="relative">
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium bg-white"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Collapsible Optional Details */}
          <div>
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-700 hover:underline py-1 min-h-[44px]"
            >
              <span>{showOptional ? 'Hide optional details' : '+ Add optional details (Category, Storage, Notes)'}</span>
              {showOptional ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showOptional && (
              <div className="mt-2 p-3 bg-slate-50 rounded-xl space-y-3 border border-slate-200 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                    >
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Dairy">Dairy</option>
                      <option value="Meat">Meat & Poultry</option>
                      <option value="Seafood">Seafood</option>
                      <option value="Bakery">Bakery</option>
                      <option value="Pantry">Pantry & Grains</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Snacks">Snacks</option>
                      <option value="Frozen">Frozen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Storage Location</label>
                    <select
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-medium"
                    >
                      <option value="Fridge">Fridge</option>
                      <option value="Freezer">Freezer</option>
                      <option value="Pantry">Pantry Cabinet</option>
                      <option value="Countertop">Countertop</option>
                      <option value="Crisper Drawer">Crisper Drawer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Opened yesterday"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Primary Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 text-sm min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save to Pantry'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
