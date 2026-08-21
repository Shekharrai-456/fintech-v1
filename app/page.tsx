'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import FamilyManager from '@/components/FamilyManager';
import TransactionList from '@/components/TransactionList';
import BudgetManager from '@/components/BudgetManager';
import SIPTracker from '@/components/SIPTracker';
import GoalTracker from '@/components/GoalTracker';
import AuthModal from '@/components/AuthModal';
import { 
  ShieldCheck, 
  Database, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Target, 
  Bot, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Server,
  Layers,
  ArrowRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  UserCheck
} from 'lucide-react';

export default function AppMainPage() {
  const { user, family, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Family Members' | 'Transactions' | 'Budget' | 'Investments / SIP' | 'Goals' | 'AI Advisor'>('Dashboard');
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const reseedDB = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      setSeedMessage(data.message || 'Database reseeded!');
      fetchHealth();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">FAMILYFIN AI</span>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                Phase 2 Active
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {family?.name ? `${family.name} Financial Portal` : "Understand your family's money. Plan smarter."}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={reseedDB}
            disabled={loading}
            className="hidden sm:flex items-center space-x-2 text-xs font-medium px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Demo DB</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                {user.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{user.email}</p>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }}
                className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                Navigation
              </p>
              <nav className="space-y-1">
                {[
                  { name: 'Dashboard', icon: LayoutDashboard },
                  { name: 'Family Members', icon: Users },
                  { name: 'Transactions', icon: CreditCard },
                  { name: 'Budget', icon: Target },
                  { name: 'Investments / SIP', icon: TrendingUp },
                  { name: 'Goals', icon: Target },
                  { name: 'AI Advisor', icon: Bot },
                ].map((item) => {
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.name as any)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>{family?.name || 'Rai Family'}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Active family budget workspace with multi-member support and bank accounts.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 border-2 border-white shadow-xs flex items-center justify-center font-bold">
              {family?.name ? family.name.charAt(0) : 'R'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{family?.name || 'Rai Family'}</p>
              <p className="text-xs text-slate-500">Family Workspace</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl mx-auto overflow-y-auto">
          {activeTab === 'Family Members' ? (
            <FamilyManager />
          ) : activeTab === 'Transactions' ? (
            <TransactionList />
          ) : activeTab === 'Budget' ? (
            <BudgetManager />
          ) : activeTab === 'Investments / SIP' ? (
            <SIPTracker />
          ) : activeTab === 'Goals' ? (
            <GoalTracker />
          ) : (
            <>
              {/* Header Overview */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{family?.name || 'Rai Family'} Overview</h2>
                  <p className="text-sm text-slate-500">Welcome back, {user?.name || 'Shekhar Rai'}. Here is your family&apos;s financial status.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setActiveTab('Transactions')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-xs flex items-center space-x-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>View Transactions</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('Family Members')}
                    className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs flex items-center space-x-2"
                  >
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>Manage Members</span>
                  </button>
                </div>
              </div>

              {/* Phase Banner Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    PHASE 4 COMPLETE: Budgeting, SIPs &amp; Milestone Goals
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                  Category Budgets, Mutual Fund SIPs &amp; Savings Goals
                </h1>

                <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
                  Phase 4 is active! Configure monthly category limits with real-time alert thresholds, track automated Systematic Investment Plans in Nepalese mutual funds (Nabil, Global IME, NIC Asia), and monitor joint family savings milestones.
                </p>

                {seedMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-medium">
                    {seedMessage}
                  </div>
                )}
              </div>

              {/* System Health & Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Database Stats */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <span>Database State</span>
                    </div>
                    <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded border border-indigo-100">
                      Persistent DB
                    </span>
                  </div>

                  {healthStatus?.database ? (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block mb-0.5 font-medium">Active Family</span>
                        <span className="text-sm font-bold text-slate-900 truncate block">{family?.name || 'Rai Family'}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block mb-0.5 font-medium">Members</span>
                        <span className="text-base font-bold text-indigo-600">{healthStatus.database.membersCount} Members</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block mb-0.5 font-medium">Transactions</span>
                        <span className="text-base font-bold text-slate-900">{healthStatus.database.transactionsCount} Records</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block mb-0.5 font-medium">Family SIPs</span>
                        <span className="text-base font-bold text-emerald-600">{healthStatus.database.sipsCount} Active</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 animate-pulse">Loading database status...</div>
                  )}
                </div>

                {/* Authentication Overview */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                      <UserCheck className="w-4 h-4 text-indigo-600" />
                      <span>Auth &amp; User State</span>
                    </div>
                    <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-100">
                      JWT Active
                    </span>
                  </div>

                  <ul className="text-xs space-y-2.5 text-slate-600">
                    <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Current User:</span>
                      <span className="font-semibold text-slate-800">{user?.name || 'Shekhar Rai'}</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">User Email:</span>
                      <span className="font-semibold text-slate-800">{user?.email || 'shekhar.rai456@gmail.com'}</span>
                    </li>
                    <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-slate-500">Token Status:</span>
                      <span className="font-semibold text-indigo-600">Authenticated</span>
                    </li>
                  </ul>
                </div>

                {/* Family Workspace Specs */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>Family Members</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('Family Members')}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Manage →
                    </button>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="text-slate-500">
                      Track individual income targets and assign specific bank accounts (Nabil, Global IME, NIC Asia, Prabhu).
                    </p>
                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
                      <span className="text-indigo-900 font-semibold">Total Family Members:</span>
                      <span className="font-bold text-indigo-700 text-sm">{healthStatus?.database?.membersCount || 4}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sleek AI Advisor Preview Section */}
              <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-sm tracking-wide text-indigo-100 uppercase">AI Advisor Insight</h3>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed">
                    &quot;Your family workspace is ready. You have 4 members registered with monthly income targets totaling Rs. 235,000.&quot;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('Family Members')}
                    className="bg-white text-indigo-900 px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    View Family Members →
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
}
