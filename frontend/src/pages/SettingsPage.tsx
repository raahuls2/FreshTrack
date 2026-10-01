import React, { useState } from 'react';
import { Settings, User, Home as HomeIcon, Shield, Database, LogOut, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user, household, logout } = useAuth();
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 md:pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Settings className="w-7 h-7 text-emerald-600" />
          <span>Account & Household Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Manage user preferences and household ownership</p>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* User Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-lg">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium">User ID</span>
            <p className="font-mono text-slate-700 font-semibold mt-0.5">{user?.id}</p>
          </div>
          <div>
            <span className="text-slate-400 font-medium">Account Created</span>
            <p className="text-slate-700 font-semibold mt-0.5">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Household Boundary Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-emerald-700">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <HomeIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Household Boundary</h3>
            <p className="text-xs text-slate-500">Security & data isolation boundary</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Household Name:</span>
            <span className="font-bold text-slate-800">{household?.name || 'Primary Household'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Household ID:</span>
            <span className="font-mono text-slate-700">{household?.id}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500">
            <span>Ownership Status:</span>
            <span className="font-semibold text-emerald-700">Owner (Isolated Access)</span>
          </div>
        </div>
      </div>

      {/* Demo Credentials Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 text-emerald-700">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Database className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Demo Account Credentials</h3>
            <p className="text-xs text-slate-500">Pre-seeded evaluation account details</p>
          </div>
        </div>

        <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl text-xs space-y-2">
          <p className="font-bold text-emerald-900">Evaluation Demo User:</p>
          <p className="font-mono text-slate-700">Email: demo@freshtrack.com</p>
          <p className="font-mono text-slate-700">Password: password123</p>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-sm rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of FreshTrack</span>
        </button>
      </div>
    </div>
  );
};
