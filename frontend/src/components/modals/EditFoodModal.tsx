import React, { useState, useEffect } from 'react';
import { X, Trash2, Save, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { FoodItem } from '../../types';

interface EditFoodModalProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: FoodItem) => void;
  onDeleted: (deletedId: string) => void;
}

export const EditFoodModal: React.FC<EditFoodModalProps> = ({
  food,
  isOpen,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  if (!isOpen || !food) return null;

  const [name, setName] = useState(food.name);
  const [quantity, setQuantity] = useState(food.quantity);
  const [unit, setUnit] = useState(food.unit);
  const [expiryDate, setExpiryDate] = useState(
    new Date(food.expiryDate).toISOString().split('T')[0]
  );
  const [category, setCategory] = useState(food.category);
  const [storageLocation, setStorageLocation] = useState(food.storageLocation);
  const [notes, setNotes] = useState(food.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [wasteReason, setWasteReason] = useState('Expired');

  useEffect(() => {
    setName(food.name);
    setQuantity(food.quantity);
    setUnit(food.unit);
    setExpiryDate(new Date(food.expiryDate).toISOString().split('T')[0]);
    setCategory(food.category);
    setStorageLocation(food.storageLocation);
    setNotes(food.notes || '');
    setShowDeleteConfirm(false);
  }, [food]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const updated = await api.updateFood(food.id, {
        name,
        quantity,
        unit,
        expiryDate,
        category,
        storageLocation,
        notes,
      });
      onUpdated(updated);
      window.dispatchEvent(new Event('foodItemChanged'));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (logWaste: boolean) => {
    try {
      setIsDeleting(true);
      await api.deleteFood(food.id, logWaste, wasteReason);
      onDeleted(food.id);
      window.dispatchEvent(new Event('foodItemChanged'));
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Edit Food Item</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleUpdate} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Food Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium bg-white"
              >
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pack">pack</option>
                <option value="tub">tub</option>
                <option value="loaf">loaf</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium bg-white"
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
              <select
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium bg-white"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
            <input
              type="date"
              required
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Add optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium"
            />
          </div>

          {/* Delete & Save Bar */}
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center space-x-1 text-rose-600 hover:text-rose-700 text-xs font-bold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove Item</span>
              </button>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm min-h-[44px]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-start space-x-2 text-rose-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 text-rose-600 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Remove {food.name}?</p>
                  <p className="text-[11px] text-rose-700">Did you consume it or discard it as waste?</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDelete(true)}
                  disabled={isDeleting}
                  className="px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-lg hover:bg-rose-700 shadow-sm min-h-[40px]"
                >
                  Discard & Log as Waste
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(false)}
                  disabled={isDeleting}
                  className="px-3 py-2 bg-slate-200 text-slate-800 text-xs font-bold rounded-lg hover:bg-slate-300 min-h-[40px]"
                >
                  Just Delete (Consumed)
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2 py-2 text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
