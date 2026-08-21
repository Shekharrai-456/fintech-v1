'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  RefreshCw, 
  ArrowUpRight, 
  DollarSign, 
  Lightbulb, 
  MessageSquare, 
  Award, 
  Zap,
  ChevronRight
} from 'lucide-react';

interface Recommendation {
  title: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  action: string;
  estimated_monthly_savings: number;
}

interface AuditData {
  health_score: number;
  health_status: string;
  summary: string;
  metrics: {
    savings_rate_pct: number;
    remittance_share_pct: number;
    emergency_fund_months: number;
    sip_contribution_pct: number;
  };
  strengths: string[];
  concerns: string[];
  recommendations: Recommendation[];
  nepal_wealth_tip: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function AIAdvisor() {
  const [activeSubTab, setActiveSubTab] = useState<'audit' | 'chat'>('audit');
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditError, setAuditError] = useState('');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: 'Namaste! I am your FAMILYFIN AI Financial Advisor. I have analyzed your family workspace context including remittance inflows, category budgets, active SIP mutual funds, and savings goals.\n\nHow can I help guide your family financial strategy today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const fetchAudit = async () => {
    setLoadingAudit(true);
    setAuditError('');
    try {
      const res = await fetch('/api/ai-advisor/audit', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.audit) {
        setAudit(data.audit);
      } else {
        setAuditError(data.error || 'Failed to fetch financial audit');
      }
    } catch (err: any) {
      console.error('Audit fetch error:', err);
      setAuditError('Network error while running AI audit');
    } finally {
      setLoadingAudit(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSubTab]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setChatInput('');
    setLoadingChat(true);

    try {
      const historyPayload = messages.map((m) => ({
        sender: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/ai-advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      if (res.ok && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'assistant',
            text: 'I encountered an issue processing your request. Please try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to connect to the AI Financial Advisor. Please check your internet connection.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoadingChat(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (score >= 55) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-md border border-indigo-700/50">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="bg-indigo-500/30 text-indigo-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>Phase 5 Active: Gemini AI Engine</span>
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Gemini AI Financial Advisor &amp; Wealth Insights
          </h2>
          <p className="text-xs md:text-sm text-indigo-200/90 leading-relaxed">
            Real-time contextual wealth audit analyzing family remittances, category budget discipline, automated mutual fund SIPs, and milestone savings goals.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10">
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'audit'
                ? 'bg-white text-indigo-950 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Health Audit</span>
          </button>
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'chat'
                ? 'bg-white text-indigo-950 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'audit' ? (
        <div className="space-y-6">
          {/* Refresh Action Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Family Wealth Audit Summary</h3>
                <p className="text-xs text-slate-500">
                  {audit ? 'Contextual analysis generated using real-time family workspace data' : 'Evaluating family metrics...'}
                </p>
              </div>
            </div>

            <button
              onClick={fetchAudit}
              disabled={loadingAudit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} />
              <span>{loadingAudit ? 'Auditing...' : 'Re-Run AI Audit'}</span>
            </button>
          </div>

          {loadingAudit && !audit ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm font-semibold text-slate-700">Analyzing income streams, remittance, budget limits, and SIP allocations...</p>
            </div>
          ) : auditError && !audit ? (
            <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-800 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Audit Generation Error</span>
              </div>
              <p className="text-xs">{auditError}</p>
              <button
                onClick={fetchAudit}
                className="mt-2 px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
              >
                Retry Audit
              </button>
            </div>
          ) : audit ? (
            <>
              {/* Score & Key Metrics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Score Card */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Financial Health Score
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getScoreColor(audit.health_score)}`}>
                      {audit.health_status}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2 my-2">
                    <span className="text-5xl font-extrabold text-slate-900 tracking-tight">
                      {audit.health_score}
                    </span>
                    <span className="text-lg font-bold text-slate-400">/ 100</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${audit.health_score}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                    {audit.summary}
                  </p>
                </div>

                {/* Metrics Cards */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Savings Rate</span>
                    <p className="text-2xl font-extrabold text-indigo-600 my-2">
                      {audit.metrics.savings_rate_pct}%
                    </p>
                    <span className="text-[10px] text-slate-400">Target: &gt; 25%</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Remittance Share</span>
                    <p className="text-2xl font-extrabold text-emerald-600 my-2">
                      {audit.metrics.remittance_share_pct}%
                    </p>
                    <span className="text-[10px] text-slate-400">Of Total Income</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">Emergency Fund</span>
                    <p className="text-2xl font-extrabold text-slate-900 my-2">
                      {audit.metrics.emergency_fund_months} <span className="text-xs font-normal text-slate-500">Months</span>
                    </p>
                    <span className="text-[10px] text-emerald-600 font-semibold">Healthy Liquid Reserve</span>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                    <span className="text-xs font-semibold text-slate-500">SIP Allocation</span>
                    <p className="text-2xl font-extrabold text-indigo-600 my-2">
                      {audit.metrics.sip_contribution_pct}%
                    </p>
                    <span className="text-[10px] text-slate-400">Mutual Fund Growth</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Concerns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Family Wealth Strengths</span>
                  </div>
                  <ul className="space-y-2 text-xs text-emerald-950">
                    {audit.strengths.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span className="leading-snug">{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Concerns */}
                <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center space-x-2 text-amber-800 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Areas for Optimization</span>
                  </div>
                  <ul className="space-y-2 text-xs text-amber-950">
                    {audit.concerns.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-white/80 p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        <span className="leading-snug">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actionable AI Recommendations */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Actionable AI Wealth Recommendations</h3>
                    <p className="text-xs text-slate-500">Prioritized steps to accelerate family milestone goals</p>
                  </div>
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-md border border-indigo-100">
                    {audit.recommendations.length} Strategic Actions
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {audit.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                            {rec.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            rec.impact === 'High' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-800'
                          }`}>
                            {rec.impact} Impact
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{rec.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{rec.action}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Est. Savings:</span>
                        <span className="font-bold text-emerald-600">+Rs. {rec.estimated_monthly_savings.toLocaleString()}/mo</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nepal Wealth Tip */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-5 rounded-2xl flex items-start space-x-3 text-amber-900 shadow-xs">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-800">
                    Nepal Financial Opportunity
                  </h4>
                  <p className="text-xs leading-relaxed text-amber-900/90 font-medium">
                    {audit.nepal_wealth_tip}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : (
        /* Interactive Chat Section */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[620px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">FAMILYFIN AI Assistant</h3>
                <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  Connected with Full Workspace Context
                </p>
              </div>
            </div>

            <button
              onClick={() => setMessages([{
                id: 'init_reset',
                sender: 'assistant',
                text: 'Chat cleared! Ask me anything about your family budget, remittance, or mutual fund SIPs.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }])}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2.5 py-1 rounded border border-slate-200 bg-white"
            >
              Clear Chat
            </button>
          </div>

          {/* Quick Preset Prompts */}
          <div className="px-4 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Prompts:</span>
            {[
              "How can we optimize our Dubai remittance inflows?",
              "Which Nepalese mutual fund SIP is best for long term wealth?",
              "How can we save faster for our land down payment goal?",
              "Are we overspending on household & dining budgets?",
            ].map((promptText, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(undefined, promptText)}
                className="shrink-0 bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition-colors shadow-2xs text-xs font-medium"
              >
                {promptText}
              </button>
            ))}
          </div>

          {/* Messages Scroll View */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#FAFBFD]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-indigo-600 text-white'
                  }`}
                >
                  {msg.sender === 'user' ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed space-y-1 shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.text}</div>
                  <div
                    className={`text-[9px] text-right mt-1 ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {loadingChat && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-none p-3 text-xs italic">
                  FamilyFin AI Advisor is thinking...
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={(e) => handleSendMessage(e)} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about family savings, remittance, SIPs, or budgets..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <button
              type="submit"
              disabled={loadingChat || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
