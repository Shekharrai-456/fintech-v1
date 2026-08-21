'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { CSVUploadResult } from '@/types';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Sparkles, 
  Building2, 
  FileSpreadsheet,
  Zap
} from 'lucide-react';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

// Preset Sample CSVs for quick testing
const PRESET_SAMPLES = [
  {
    title: "Father's Nabil Bank (Salary & Groceries)",
    memberIndex: 0,
    bankName: "Nabil Bank - Salary Acc",
    csv: `Date,Description,Amount,Type
2026-08-01,Monthly Salary Remittance - Nepal Gov,120000,Credit
2026-08-03,Bhatbhateni Supermarket Naxal,18500,Debit
2026-08-05,Nepal Telecom NTC Bill,2500,Debit
2026-08-08,WorldLink Fiber Internet 100Mbps,3200,Debit
2026-08-10,Nabil Mutual Fund SIP Investment,15000,Debit
2026-08-14,Salesberry Departmental Store,8400,Debit
2026-08-18,NEA Electricity Water Payment,2100,Debit`,
  },
  {
    title: "Mother's Global IME Bank (Business Income & Healthcare)",
    memberIndex: 1,
    bankName: "Global IME - Savings Acc",
    csv: `Date,Description,Amount,Type
2026-08-02,Handicraft Boutique Revenue,85000,Credit
2026-08-04,Norvic Hospital Consultation & Lab,14500,Debit
2026-08-07,Big Mart Jhamsikhet Groceries,6200,Debit
2026-08-12,Pathao Ride Shares Weekly,1800,Debit
2026-08-15,Global IME Capital SIP,10000,Debit
2026-08-19,Bhatbhateni Supermarket,12400,Debit`,
  },
  {
    title: "Shekhar's NIC Asia (Tech Salary & Dining)",
    memberIndex: 2,
    bankName: "NIC Asia - Tech Salary Acc",
    csv: `Date,Description,Amount,Type
2026-08-01,Tech Company Salary Direct Deposit,95000,Credit
2026-08-03,Foodmandu Bakery & Pizza Order,2800,Debit
2026-08-06,QFX Cinema Movie Tickets,1600,Debit
2026-08-09,NIC Asia Capital SIP Purchase,15000,Debit
2026-08-11,Pathao Taxi Ride,750,Debit
2026-08-13,Daraz Online Shopping - Electronics,32000,Debit
2026-08-17,Bhatbhateni Supermarket Groceries,28500,Debit`,
  },
];

export default function CSVUploadModal({ isOpen, onClose, onUploadSuccess }: CSVUploadModalProps) {
  const { members } = useAuth();
  
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || 'mem_shekhar');
  const [accountName, setAccountName] = useState<string>('Nabil Bank - Primary');
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadResult, setUploadResult] = useState<CSVUploadResult | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const loadPresetSample = (sample: typeof PRESET_SAMPLES[0]) => {
    const targetMember = members[sample.memberIndex] || members[0];
    if (targetMember) {
      setSelectedMemberId(targetMember.id);
    }
    setAccountName(sample.bankName);
    setCsvContent(sample.csv);
    setFileName(`${sample.title}.csv`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent) {
      setErrorMsg('Please select a CSV file or choose a preset sample.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    try {
      const currentMember = members.find((m) => m.id === selectedMemberId);

      const res = await fetch('/api/transactions/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: selectedMemberId,
          accountName,
          csvContent,
          memberName: currentMember?.name || 'Family Member',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to process CSV statement.');
      } else {
        setUploadResult(data.result);
        onUploadSuccess();
      }
    } catch (err) {
      setErrorMsg('Network error while processing file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-xl w-full border border-slate-200 p-6 shadow-2xl space-y-5 animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Upload Bank CSV Statement</h3>
              <p className="text-xs text-slate-500">Auto-categorization &amp; duplicate detection</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {uploadResult ? (
          /* Result Summary Screen */
          <div className="space-y-5 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-base text-emerald-900">Statement Successfully Processed!</h4>
                <p className="text-xs text-emerald-700">
                  Transactions have been categorized and appended to {uploadResult.member_name}&apos;s profile.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Imported</span>
                <span className="text-lg font-extrabold text-indigo-600">{uploadResult.transactions_imported} Txs</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Total Income</span>
                <span className="text-base font-bold text-emerald-600">Rs. {uploadResult.total_income.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Total Expenses</span>
                <span className="text-base font-bold text-rose-600">Rs. {uploadResult.total_expenses.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 font-medium block">Duplicates</span>
                <span className="text-lg font-bold text-slate-600">{uploadResult.duplicates_skipped} Skipped</span>
              </div>
            </div>

            {uploadResult.unusual_detected > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center space-x-2 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>{uploadResult.unusual_detected} unusual transactions</strong> detected (large amounts or high grocery spikes).
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => { setUploadResult(null); onClose(); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors shadow-xs"
              >
                View Transactions
              </button>
            </div>
          </div>
        ) : (
          /* CSV Upload Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Presets Bar */}
            <div className="space-y-2">
              <div className="flex items-center space-x-1 text-xs font-bold text-indigo-700 uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Quick Test Preset Statements</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PRESET_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadPresetSample(sample)}
                    className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-lg text-left transition-colors group"
                  >
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 truncate">
                      {sample.title}
                    </p>
                    <p className="text-[10px] text-slate-500">{sample.bankName}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Family Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nabil Bank Salary"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Drag and Drop Box */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Upload CSV File</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center bg-slate-50 hover:bg-indigo-50/30 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">
                  {fileName ? (
                    <span className="text-indigo-700 font-bold">{fileName}</span>
                  ) : (
                    'Click or Drag & Drop Bank CSV Statement'
                  )}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Supports Date, Description, Amount, Debit/Credit columns</p>
              </div>
            </div>

            {/* Raw CSV Preview / Paste */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Or Paste CSV Raw Text</label>
              <textarea
                rows={4}
                value={csvContent}
                onChange={(e) => {
                  setCsvContent(e.target.value);
                  setFileName('Pasted CSV Content');
                }}
                placeholder="Date,Description,Amount,Type&#10;2026-08-01,Bhatbhateni Supermarket,8500,Debit"
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-semibold shadow-sm flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Processing...' : 'Process Statement'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
