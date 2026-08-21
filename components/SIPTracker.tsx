'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { SIP, MutualFund } from '@/types';
import { 
  TrendingUp, 
  Plus, 
  Building2, 
  CheckCircle2, 
  PauseCircle, 
  Trash2, 
  Calendar, 
  X,
  Sparkles,
  PieChart
} from 'lucide-react';

export default function SIPTracker() {
  const { members } = useAuth();
  
  const [sips, setSips] = useState<SIP[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [totalMonthly, setTotalMonthly] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberId, setMemberId] = useState(members[0]?.id || 'mem_shekhar');
  const [fundName, setFundName] = useState('Nabil Balanced Fund-1');
  const [monthlyAmount, setMonthlyAmount] = useState('15000');
  const [sipDate, setSipDate] = useState('10');
  const [folioNumber, setFolioNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSIPs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sips');
      if (res.ok) {
        const data = await res.json();
        setSips(data.sips || []);
        setMutualFunds(data.mutualFunds || []);
        setTotalMonthly(data.totalMonthlyInvestment || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSIPs();
  }, []);

  const handleCreateSIP = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/sips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          family_member_id: memberId,
          fund_name: fundName,
          monthly_amount: Number(monthlyAmount),
          sip_date: Number(sipDate),
          folio_number: folioNumber,
        }),
      });

      if (res.ok) {
        await fetchSIPs();
        setIsModalOpen(false);
        setMonthlyAmount('15000');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (sipId: string, currentStatus: SIP['status']) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch(`/api/sips/${sipId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSips((prev) =>
          prev.map((s) => (s.id === sipId ? { ...s, status: newStatus } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSIP = async (sipId: string) => {
    if (!confirm('Are you sure you want to delete this SIP scheme?')) return;
    try {
      const res = await fetch(`/api/sips/${sipId}`, { method: 'DELETE' });
      if (res.ok) {
        setSips((prev) => prev.filter((s) => s.id !== sipId));
      }
    } catch (e) {
      console.error(e);
    }
  };

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
            <TrendingUp className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">SIP &amp; Mutual Funds</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Family Investment Portfolio (SIPs)</h2>
          <p className="text-slate-500 text-sm">
            Automated monthly Systematic Investment Plans in Nepalese mutual funds.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Start New Family SIP</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Monthly SIP Outflow</span>
          <p className="text-2xl font-extrabold text-emerald-600">Rs. {totalMonthly.toLocaleString()}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Active SIP Schemes</span>
          <p className="text-2xl font-extrabold text-indigo-600">
            {sips.filter((s) => s.status === 'active').length} Active
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Projected Annual Wealth Generation</span>
          <p className="text-2xl font-extrabold text-slate-900">Rs. {(totalMonthly * 12).toLocaleString()}</p>
        </div>
      </div>

      {/* Active SIP List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 font-bold text-slate-800 text-sm">
          Active Family SIP Investments
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
            Loading investment portfolio...
          </div>
        ) : sips.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-600 font-semibold text-sm">No active SIPs configured</p>
            <p className="text-xs text-slate-400">Click &quot;Start New Family SIP&quot; to add a mutual fund scheme.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sips.map((sip) => (
              <div key={sip.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 mt-1">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-900 text-base">{sip.fund_name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sip.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sip.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Investor: <strong className="text-slate-800 font-semibold">{getMemberName(sip.family_member_id)}</strong> • Folio: {sip.folio_number || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-xs text-slate-600 w-full md:w-auto justify-between md:justify-end">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Monthly Amount</span>
                    <span className="font-extrabold text-slate-900 text-sm">Rs. {sip.monthly_amount.toLocaleString()}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px]">Debit Date</span>
                    <span className="font-semibold text-slate-800">{sip.sip_date}th of month</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(sip.id, sip.status)}
                      className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${
                        sip.status === 'active'
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {sip.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => handleDeleteSIP(sip.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete SIP"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nepalese Mutual Funds Catalog */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-indigo-600" />
          <span>Popular Nepalese Mutual Fund Schemes</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mutualFunds.map((fund) => (
            <div key={fund.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {fund.category}
                </span>
                <span className="text-xs font-semibold text-emerald-600">1Yr Return: +{fund.return_1yr}%</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{fund.name}</h4>
              <p className="text-xs text-slate-500">{fund.fund_manager}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Create SIP Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full border border-slate-200 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Start New Family SIP</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSIP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Investor (Family Member)</label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mutual Fund Scheme</label>
                <select
                  value={fundName}
                  onChange={(e) => setFundName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {mutualFunds.map((mf) => (
                    <option key={mf.id} value={mf.name}>
                      {mf.name} ({mf.fund_manager})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Monthly SIP (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Debit Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    required
                    value={sipDate}
                    onChange={(e) => setSipDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Folio / Account No. (Optional)</label>
                <input
                  type="text"
                  placeholder="FOLIO-99210"
                  value={folioNumber}
                  onChange={(e) => setFolioNumber(e.target.value)}
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
                  {submitting ? 'Creating...' : 'Start SIP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
