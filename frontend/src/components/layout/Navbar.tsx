import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Package, ShoppingCart, BarChart3, Utensils, Settings, Plus, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenQuickAdd: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenQuickAdd }) => {
  const { user, household, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/pantry', label: 'Pantry', icon: Package },
    { to: '/shopping', label: 'Shopping', icon: ShoppingCart },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/recipes', label: 'Recipes', icon: Utensils },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Household badge */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl p-1">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Leaf className="w-5 h-5 fill-white/20" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
                  FreshTrack
                </span>
                {household && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md w-max border border-emerald-200/60">
                    {household.name}
                  </span>
                )}
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Add Button & Profile */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2.5 rounded-xl shadow-sm transition-all active:scale-95 text-xs sm:text-sm min-h-[44px]"
              aria-label="Add Food Item"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="inline">+ Add Food</span>
            </button>

            {user && (
              <div className="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  aria-label="Log out"
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
