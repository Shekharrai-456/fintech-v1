'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Goal } from '@/types';
import { 
  Award, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  DollarSign, 
  X, 
  Sparkles,
  TrendingUp,
  Clock
} from 'lucide-react';

interface GoalWithStats extends Goal {
  percentage: number;
  remaining: number;
}

export default function GoalTracker() {
  const { family } = useAuth();
  
  const [goals, setGoals] = useState<GoalWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('1500000');
  const [currentAmount, setCurrentAmount] = useState('250000');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [submitting, setSubmitting] = useState(false);

  // Deposit Modal
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<GoalWithStats | null>(null);
  const [depositAmount, setDepositAmount] = useState('25000');

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          target_amount: Number(targetAmount),
          current_amount: Number(currentAmount),
          target_date: targetDate,
        }),
      });

      if (res.ok) {
        await fetchGoals();
        setIsAddModalOpen(false);
        setTitle('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/goals/${activeGoal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add_amount: Number(depositAmount) }),
      });

      if (res.ok) {
        await fetchGoals();
        setIsDepositModalOpen(false);
        setDepositAmount('25000');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const totalTarget = goals.reduce((acc, g) => acc + g.target_amount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.current_amount, 0);
  const totalRemaining = totalTarget - totalSaved;
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Milestone Goals</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Family Savings Milestones</h2>
          <p className="text-slate-500 text-sm">
            Track joint savings targets, emergency reserves, land/property funds, and educational goals.
          </p>
        </div>

        <button
          onClick={() => { setTitle('Emergency Reserve Fund'); setTargetAmount('1000000'); setCurrentAmount('350000'); setIsAddModalOpen(true); }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Goal Target</span>
          <p className="text-2xl font-extrabold text-slate-900">Rs. {totalTarget.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Saved So Far</span>
          <p className="text-2xl font-extrabold text-emerald-600">Rs. {totalSaved.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold">{overallProgress}% achieved overall</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Remaining to Save</span>
          <p className="text-2xl font-extrabold text-indigo-600">Rs. {totalRemaining.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Completed Milestones</span>
          <p className="text-2xl font-extrabold text-slate-900">
            {goals.filter((g) => g.status === 'completed').length} / {goals.length}
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading family goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-full p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-semibold text-sm">No savings goals set</p>
            <p className="text-xs text-slate-400">Click &quot;Create New Goal&quot; to define a milestone.</p>
          </div>
        ) : (
          goals.map((goal) => {
            const isCompleted = goal.status === 'completed' || goal.percentage >= 100;

            return (
              <div
                key={goal.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-200 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1.5 ${
                        isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base">{goal.title || goal.name}</h3>
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-indigo-600">{goal.percentage}%</span>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.min(100, goal.percentage)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Saved: <strong className="text-slate-900">Rs. {goal.current_amount.toLocaleString()}</strong></span>
                      <span>Target: <strong className="text-slate-900">Rs. {goal.target_amount.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Target: {goal.target_date}</span>
                  </div>

                  <button
                    onClick={() => { setActiveGoal(goal); setIsDepositModalOpen(true); }}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Add Deposit</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Goal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Create Family Savings Milestone</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kathmandu Land Down Payment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Amount (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Current Saved (Rs.)</label>
                  <input
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Completion Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {isDepositModalOpen && activeGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add Deposit to Goal</h3>
              <button onClick={() => setIsDepositModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Goal: <strong className="text-slate-900 font-semibold">{activeGoal.title || activeGoal.name}</strong>
            </p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deposit Amount (Rs.)</label>
                <input
                  type="number"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm"
                >
                  {submitting ? 'Updating...' : 'Add Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
