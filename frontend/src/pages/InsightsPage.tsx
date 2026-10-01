import React, { useEffect, useState } from 'react';
import { BarChart3, PieChart as PieChartIcon, TrendingDown, Leaf, AlertTriangle } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';
import { api } from '../services/api';
import { FoodWaste, FoodItem } from '../types';

export const InsightsPage: React.FC = () => {
  const [wasteLogs, setWasteLogs] = useState<FoodWaste[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [wasteRes, foodsRes] = await Promise.all([
          api.getWaste(),
          api.getFoods()
        ]);
        setWasteLogs(wasteRes.logs);
        setFoods(foodsRes);
      } catch (err) {
        console.error('Failed to load insights data', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart 1: Expiring vs Fresh vs Expired Status Distribution
  const statusCounts = {
    FRESH: foods.filter(f => f.status === 'FRESH').length,
    EXPIRING_SOON: foods.filter(f => f.status === 'EXPIRING_SOON').length,
    EXPIRED: foods.filter(f => f.status === 'EXPIRED').length,
  };

  const statusData = [
    { name: 'Fresh (>3 days)', value: statusCounts.FRESH, color: '#22c55e' },
    { name: 'Use Soon (0-3 days)', value: statusCounts.EXPIRING_SOON, color: '#f59e0b' },
    { name: 'Expired', value: statusCounts.EXPIRED, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Chart 2: Category Distribution
  const categoryMap: Record<string, number> = {};
  foods.forEach(f => {
    categoryMap[f.category] = (categoryMap[f.category] || 0) + 1;
  });

  const categoryData = Object.keys(categoryMap).map((cat, idx) => ({
    name: cat,
    value: categoryMap[cat],
    color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'][idx % 6]
  }));

  // Chart 3: Food Waste over time (grouped by month or reason)
  const reasonMap: Record<string, number> = {};
  wasteLogs.forEach(w => {
    reasonMap[w.reason] = (reasonMap[w.reason] || 0) + 1;
  });

  const wasteReasonData = Object.keys(reasonMap).map(r => ({
    reason: r,
    count: reasonMap[r]
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 pb-24 md:pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <BarChart3 className="w-7 h-7 text-emerald-600" />
          <span>Waste & Inventory Insights</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Visual metrics to help your household reduce food waste and optimize grocery spending.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Inventory Health Split */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <PieChartIcon className="w-5 h-5 text-emerald-600" />
                <span>Inventory Status Breakdown</span>
              </h3>
              <span className="text-xs text-slate-500">{foods.length} items total</span>
            </div>

            {statusData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">No inventory data available</p>
            )}
          </div>

          {/* Chart 2: Category Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-teal-600" />
                <span>Food Category Distribution</span>
              </h3>
            </div>

            {categoryData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">No category data available</p>
            )}
          </div>

          {/* Chart 3: Waste Reasons Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                <span>Logged Food Waste by Reason</span>
              </h3>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                {wasteLogs.length} waste entries recorded
              </span>
            </div>

            {wasteReasonData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wasteReasonData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="reason" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-12">
                🎉 No food waste logged yet! Keep it up!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
