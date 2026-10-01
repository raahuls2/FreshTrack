import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, ShoppingCart, BarChart3, Settings, Plus } from 'lucide-react';

interface MobileNavProps {
  onOpenQuickAdd: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenQuickAdd }) => {
  const items = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/pantry', label: 'Pantry', icon: Package },
    { to: '/shopping', label: 'Shopping', icon: ShoppingCart },
    { to: '/insights', label: 'Insights', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Floating Action Button (+) for Quick Add */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={onOpenQuickAdd}
          aria-label="Add Food Item"
          className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 hover:bg-emerald-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-1 pb-safe"
      >
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 rounded-xl text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'text-emerald-700 font-bold bg-emerald-50/80'
                      : 'text-slate-500 hover:text-slate-800'
                  }`
                }
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};
