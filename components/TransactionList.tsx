'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Transaction, CategoryType } from '@/types';
import CSVUploadModal from '@/components/CSVUploadModal';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight,
  Tag,
  Trash2,
  X,
  Building2,
  Calendar
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
  'Salary',
  'Investment',
  'Other',
];

export default function TransactionList() {
  const { members } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [memberFilter, setMemberFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Manual Add Form
  const [addMemberId, setAddMemberId] = useState(members[0]?.id || 'mem_shekhar');
  const [accountName, setAccountName] = useState('Nabil Bank');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<CategoryType>('Food & Groceries');
  const [submitting, setSubmitting] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (memberFilter !== 'all') queryParams.append('memberId', memberFilter);
      if (categoryFilter !== 'all') queryParams.append('category', categoryFilter);
      if (typeFilter !== 'all') queryParams.append('type', typeFilter);
      if (searchQuery) queryParams.append('q', searchQuery);

      const res = await fetch(`/api/transactions?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [memberFilter, categoryFilter, typeFilter, searchQuery]);

  const handleCategoryChange = async (txId: string, newCategory: CategoryType) => {
    try {
      const res = await fetch(`/api/transactions/${txId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });

      if (res.ok) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, category: newCategory } : t))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    try {
      const res = await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== txId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddManualTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_member_id: addMemberId,
          account_name: accountName,
          date,
          description,
          amount: Number(amount),
          type,
          category,
        }),
      });

      if (res.ok) {
        await fetchTransactions();
        setIsAddModalOpen(false);
        setDescription('');
        setAmount('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  const getMemberName = (memId: string) => {
    const mem = members.find((m) => m.id === memId);
    return mem ? mem.name : 'Rai Family';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-600 mb-1">
            <CreditCard className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Transaction Management</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Family Transactions Log</h2>
          <p className="text-slate-500 text-sm">
            Categorized expenses, income remittances, and bank statement uploads.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCSVModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-sm px-4 py-2.5 rounded-lg border border-indigo-200 flex items-center space-x-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload CSV Statement</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Filtered Income</span>
            <p className="text-xl font-bold text-emerald-600">Rs. {totalIncome.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Filtered Expense</span>
            <p className="text-xl font-bold text-rose-600">Rs. {totalExpense.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Net Cashflow</span>
            <p className={`text-xl font-bold ${netCashflow >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
              Rs. {netCashflow.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search description, merchant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Member Filter */}
          <div>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Family Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relation})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Types (Income &amp; Expense)</option>
              <option value="income">Income Only</option>
              <option value="expense">Expense Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading family transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <CreditCard className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-semibold text-sm">No transactions found</p>
            <p className="text-xs text-slate-400">Try adjusting your search filters or upload a CSV statement.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Member / Account</th>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Amount (NPR)</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono">
                      {tx.date}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{getMemberName(tx.family_member_id)}</div>
                      <div className="text-[10px] text-slate-400">{tx.account_name}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">{tx.description}</span>
                        {tx.is_unusual && (
                          <span 
                            title={tx.unusual_reason || 'Unusual expenditure'} 
                            className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 shrink-0"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Unusual</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <select
                        value={tx.category}
                        onChange={(e) => handleCategoryChange(tx.id, e.target.value as CategoryType)}
                        className="bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold px-2 py-1 rounded border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap font-bold text-sm">
                      <span className={tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}>
                        {tx.type === 'income' ? '+' : '-'} Rs. {tx.amount.toLocaleString()}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CSV Upload Modal */}
      <CSVUploadModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onUploadSuccess={fetchTransactions}
      />

      {/* Add Manual Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-5 h-5 text-indigo-600" />
                <span>Add Transaction</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddManualTx} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Family Member</label>
                <select
                  value={addMemberId}
                  onChange={(e) => setAddMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhatbhateni Supermarket Naxal"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (Rs.)</label>
                  <input
                    type="number"
                    required
                    placeholder="8500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Label</label>
                <input
                  type="text"
                  placeholder="e.g. Nabil Bank - Primary"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
