'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CategoryType } from '@/types';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Edit3, 
  Plus, 
  PieChart, 
  DollarSign, 
  X,
  Sparkles,
  Zap
} from 'lucide-react';

const CATEGORIES: CategoryType[] = [
  'Food & Groceries',
  'Utilities',
  'Housing',
  'Transportation',
  'Healthcare',
  'Education',
  'Entertainment',
  'Shopping',
  'Other',
];

interface BudgetStatusItem {
  id: string;
  family_id: string;
  category: CategoryType;
  monthly_limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  is_warning: boolean;
  is_exceeded: boolean;
}

export default function BudgetManager() {
  const { family } = useAuth();
  const [budgets, setBudgets] = useState<BudgetStatusItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('Food & Groceries');
  const [limitAmount, setLimitAmount] = useState('35000');
  const [submitting, setSubmitting] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/budgets');
      if (res.ok) {
        const data = await res.json();
        setBudgets(data.budgets || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          monthly_limit: Number(limitAmount),
        }),
      });

      if (res.ok) {
        await fetchBudgets();
        setIsModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (cat: CategoryType, currentLimit: number) => {
    setSelectedCategory(cat);
    setLimitAmount(String(currentLimit || 30000));
    setIsModalOpen(true);
  };

  // Calculations
  const totalBudget = budgets.reduce((acc, b) => acc + b.monthly_limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const exceededCount = budgets.filter((b) => b.is_exceeded).length;
  const warningCount = budgets.filter((b) => b.is_warning).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Target className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Budgeting &amp; Limits</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Family Monthly Budget</h2>
          <p className="text-slate-500 text-sm">
            Set category spend targets, monitor real-time consumption, and receive alert warnings.
          </p>
        </div>

        <button
          onClick={() => { setSelectedCategory('Food & Groceries'); setLimitAmount('35000'); setIsModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Configure Budget Target</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Monthly Allocated</span>
          <p className="text-2xl font-extrabold text-slate-900">Rs. {totalBudget.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Spent This Month</span>
          <p className="text-2xl font-extrabold text-indigo-600">Rs. {totalSpent.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{overallPercentage}% of total budget used</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Remaining Funds</span>
          <p className={`text-2xl font-extrabold ${totalRemaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
            Rs. {totalRemaining.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Alert Status</span>
          <div className="flex items-center space-x-2 pt-1">
            {exceededCount > 0 ? (
              <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{exceededCount} Over Budget</span>
              </span>
            ) : warningCount > 0 ? (
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{warningCount} Near Limit</span>
              </span>
            ) : (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>On Track</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Budget Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading family budgets...
          </div>
        ) : (
          CATEGORIES.map((cat) => {
            const b = budgets.find((item) => item.category === cat) || {
              id: `cat_${cat}`,
              family_id: family?.id || '',
              category: cat,
              monthly_limit: 0,
              spent: 0,
              remaining: 0,
              percentage: 0,
              is_warning: false,
              is_exceeded: false,
            };

            let progressColor = 'bg-indigo-600';
            if (b.is_exceeded) progressColor = 'bg-rose-600';
            else if (b.is_warning) progressColor = 'bg-amber-500';

            return (
              <div
                key={cat}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-200 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{cat}</h3>
                      <span className="text-xs text-slate-500">
                        Target: {b.monthly_limit > 0 ? `Rs. ${b.monthly_limit.toLocaleString()}` : 'Unconfigured'}
                      </span>
                    </div>

                    <button
                      onClick={() => openEditModal(cat, b.monthly_limit)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Category Target"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Spent: Rs. {b.spent.toLocaleString()}</span>
                      <span className={`font-bold ${b.is_exceeded ? 'text-rose-600' : b.is_warning ? 'text-amber-600' : 'text-slate-600'}`}>
                        {b.percentage}%
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                        style={{ width: `${Math.min(100, b.percentage)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  {b.monthly_limit > 0 ? (
                    b.is_exceeded ? (
                      <span className="text-rose-600 font-bold flex items-center space-x-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Exceeded by Rs. {Math.abs(b.remaining).toLocaleString()}</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium">
                        Remaining: <strong className="text-emerald-600 font-bold">Rs. {b.remaining.toLocaleString()}</strong>
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400 italic">No budget limit set</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Configure Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Configure Category Budget</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CategoryType)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Monthly Spending Limit (NPR)</label>
                <input
                  type="number"
                  required
                  placeholder="35000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Limit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
