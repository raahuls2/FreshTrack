import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { QuickAddModal } from './components/modals/QuickAddModal';
import { EditFoodModal } from './components/modals/EditFoodModal';

import { HomePage } from './pages/HomePage';
import { PantryPage } from './pages/PantryPage';
import { ShoppingPage } from './pages/ShoppingPage';
import { InsightsPage } from './pages/InsightsPage';
import { RecipesPage } from './pages/RecipesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { FoodItem } from './types';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-600">Loading FreshTrack...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleFoodAdded = () => {
    // Triggers full page or sub-component update via navigation or window event
    window.dispatchEvent(new Event('foodItemChanged'));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onSelectEditFood={(food) => setEditingFood(food)}
              />
            }
          />
          <Route
            path="/pantry"
            element={
              <PantryPage
                onOpenQuickAdd={() => setIsQuickAddOpen(true)}
                onSelectEditFood={(food) => setEditingFood(food)}
              />
            }
          />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <MobileNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Global Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        onSuccess={(newFood) => {
          handleFoodAdded();
        }}
      />

      {/* Global Edit Food Modal */}
      <EditFoodModal
        food={editingFood}
        isOpen={!!editingFood}
        onClose={() => setEditingFood(null)}
        onUpdated={() => handleFoodAdded()}
        onDeleted={() => handleFoodAdded()}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
