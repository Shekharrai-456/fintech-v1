'use client';

import React, { useState, useEffect } from 'react';
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
  LayoutDashboard
} from 'lucide-react';

export default function Phase1SetupPage() {
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
      setSeedMessage(data.message || 'Database seeded!');
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
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">FAMILYFIN AI</span>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-100">
                Sleek MVP
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Understand your family&apos;s money. Plan smarter. Grow together.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={reseedDB}
            disabled={loading}
            className="flex items-center space-x-2 text-xs font-medium px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Demo DB</span>
          </button>
          <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Phase 1 Active</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                MVP Modules
              </p>
              <nav className="space-y-1">
                {[
                  { name: 'Dashboard', icon: LayoutDashboard, active: true },
                  { name: 'Transactions', icon: CreditCard, active: false },
                  { name: 'Budget', icon: Target, active: false },
                  { name: 'Investments / SIP', icon: TrendingUp, active: false },
                  { name: 'Goals', icon: Target, active: false },
                  { name: 'AI Advisor', icon: Bot, active: false },
                  { name: 'Family Members', icon: Users, active: false },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                      item.active
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${item.active ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </nav>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-700">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Nepal Rai Family Data</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-configured with Father, Mother, Shekhar, &amp; Sister financial dataset (NPR / Rs.).
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-xs flex items-center justify-center font-bold text-slate-600">
              R
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Rai Family</p>
              <p className="text-xs text-slate-500">Premium Plan</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-6xl mx-auto overflow-y-auto">
          {/* Header Overview */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Family Overview</h2>
              <p className="text-sm text-slate-500">Welcome back, Shekhar. Here is your family&apos;s financial pulse.</p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs">
                Last 30 Days
              </button>
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                + Add Statement
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
                PHASE 1 COMPLETE: Sleek Architecture &amp; DB Initialized
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              FAMILYFIN AI Platform Core Initialized
            </h1>

            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              The foundation of the AI-powered family financial intelligence platform is set up with the Sleek Interface theme. Database schemas, TypeScript domain models, JWT authentication framework, and Nepal demo dataset (Rai Family) are ready.
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
                    <span className="text-slate-500 block mb-0.5 font-medium">Family</span>
                    <span className="text-base font-bold text-slate-900">Rai Family</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 block mb-0.5 font-medium">Members</span>
                    <span className="text-base font-bold text-indigo-600">{healthStatus.database.membersCount} Members</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <span className="text-slate-500 block mb-0.5 font-medium font-medium">Transactions</span>
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

            {/* Architecture Overview */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>Technology Stack</span>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  Full Stack
                </span>
              </div>

              <ul className="text-xs space-y-2.5 text-slate-600">
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Frontend:</span>
                  <span className="font-semibold text-slate-800">Next.js App Router (TS)</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Styling &amp; Charts:</span>
                  <span className="font-semibold text-slate-800">Tailwind CSS &amp; Recharts</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">AI Intelligence:</span>
                  <span className="font-semibold text-indigo-600">Gemini 3.7 Flash API</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Database:</span>
                  <span className="font-semibold text-slate-800">File-backed Relational DB</span>
                </li>
              </ul>
            </div>

            {/* Security & Currency */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm font-semibold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Security &amp; Currency</span>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-100">
                  NPR / Rs.
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Auth Method:</span>
                  <span className="font-semibold text-slate-800">JWT + bcrypt Hashing</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Currency Unit:</span>
                  <span className="font-semibold text-emerald-600">Nepalese Rupee (Rs.)</span>
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
                <h3 className="font-bold text-sm tracking-wide text-indigo-100 uppercase">AI Advisor Preview</h3>
              </div>
              <p className="text-xs text-indigo-200 leading-relaxed">
                &quot;Your Rai Family saved Rs. 66,600 this month (28.3% savings rate). Your total family SIP across 3 active funds is Rs. 21,000/month.&quot;
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 px-4 py-2 rounded-lg text-xs font-semibold text-indigo-100 border border-white/10">
                Gemini 3.7 Flash Tool Calling
              </div>
            </div>
          </div>

          {/* Verification Summary */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Phase 1 Sleek Interface Summary</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-semibold text-slate-900 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Created Components &amp; Backend</span>
                </h4>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li><code className="text-slate-800 bg-slate-200/60 px-1 py-0.5 rounded">/types/index.ts</code> - Domain types</li>
                  <li><code className="text-slate-800 bg-slate-200/60 px-1 py-0.5 rounded">/lib/db.ts</code> - Relational DB &amp; Rai Family seed</li>
                  <li><code className="text-slate-800 bg-slate-200/60 px-1 py-0.5 rounded">/lib/auth.ts</code> - JWT &amp; password hashing</li>
                  <li><code className="text-slate-800 bg-slate-200/60 px-1 py-0.5 rounded">/app/api/health</code> &amp; <code className="text-slate-800 bg-slate-200/60 px-1 py-0.5 rounded">/api/seed</code></li>
                </ul>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <h4 className="font-semibold text-indigo-700 flex items-center space-x-1.5">
                  <ArrowRight className="w-4 h-4 text-indigo-600" />
                  <span>Ready for Phase 2</span>
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  Phase 1 is complete with the <strong>Sleek Interface</strong> theme applied. Ready to proceed to <strong>PHASE 2: Authentication + Family Management</strong> upon user confirmation.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

