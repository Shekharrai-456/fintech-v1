import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    let authUser = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authUser = verifyToken(authHeader.substring(7));
    }

    let family = null;
    if (authUser) {
      family = db.getFamilyByUserId(authUser.userId);
    }
    if (!family) {
      family = db.getFamily('fam_rai_1') || db.getRawData().families[0];
    }

    // Retrieve family financial state for AI context
    const members = db.getFamilyMembers(family ? family.id : 'fam_rai_1');
    const accounts = db.getAccountsByFamily(family ? family.id : 'fam_rai_1');
    const transactions = db.getTransactionsByFamily(family ? family.id : 'fam_rai_1');
    const budgets = db.getBudgetsByFamily(family ? family.id : 'fam_rai_1');
    const sips = db.getSIPsByFamily(family ? family.id : 'fam_rai_1');
    const goals = db.getGoalsByFamily(family ? family.id : 'fam_rai_1');

    const contextSummary = {
      family_name: family?.name || 'Rai Family',
      currency: 'NPR (Rs.)',
      total_balance: accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
      members: members.map(m => `${m.name} (${m.relation}, Income Target: Rs. ${m.monthly_income_target || 0})`),
      budgets: budgets.map(b => `${b.category}: Limit Rs. ${b.monthly_limit || b.monthly_budget}`),
      sips: sips.map(s => `${s.fund_name}: Rs. ${s.monthly_amount}/mo (${s.status})`),
      goals: goals.map(g => `${g.title || g.name}: Saved Rs. ${g.current_amount} / Target Rs. ${g.target_amount} by ${g.target_date}`),
      recent_transactions_count: transactions.length,
    };

    let replyText = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction = `
You are FamilyFin AI Advisor, an expert Nepalese financial planner and family wealth strategist.
You provide warm, highly practical, actionable financial advice tailored for Nepali households, remittance earners, and mutual fund investors.

Family Financial Context:
${JSON.stringify(contextSummary, null, 2)}

Instructions:
- Address the user with respect (e.g. "Namaste" or "Hello").
- Format currency consistently as "Rs. X,XXX" or "NPR".
- Provide bullet points, clear breakdowns, and actionable next steps when applicable.
- Reference Nepalese financial realities (commercial bank accounts like Nabil/Global IME/NIC Asia, NRB remittance incentives, SIP mutual funds, gold/property savings).
- Keep answers encouraging, concise, and structured.
`;

        const chatMessages = (history || []).map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        }));

        chatMessages.push({
          role: 'user',
          parts: [{ text: message }],
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: chatMessages,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        if (response.text) {
          replyText = response.text;
        }
      } catch (geminiErr) {
        console.error('Gemini chat error, using smart fallback:', geminiErr);
      }
    }

    if (!replyText) {
      // Dynamic fallback chat response generator
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes('remittance') || lowerMsg.includes('dubai') || lowerMsg.includes('foreign')) {
        replyText = `**Namaste!** For optimizing foreign remittance inflows into Nepal:\n\n1. **Direct Remittance SIP**: Divert at least 15-20% of incoming foreign transfers immediately into systematic mutual fund SIPs (e.g., *Nabil Balanced Fund II* or *Global IME Samunnati Scheme*).\n2. **Remittance FD Premium**: Nepalese commercial banks offer +1% extra annual interest on Remittance Fixed Deposit accounts.\n3. **Target Savings**: Your family currently receives consistent remittance inflows. Setting up an auto-debit rule on your Nabil Bank account ensures long-term wealth growth!`;
      } else if (lowerMsg.includes('sip') || lowerMsg.includes('mutual fund') || lowerMsg.includes('invest')) {
        replyText = `**Nepalese Mutual Fund SIP Analysis**:\n\n- You currently have **${sips.length} active SIPs** totaling **Rs. ${sips.reduce((sum, s) => sum + s.monthly_amount, 0).toLocaleString()} / month**.\n- Top recommended schemes in Nepal:\n  1. *Nabil Balanced Fund II* (High stability & consistent dividends)\n  2. *Global IME Samunnati Scheme* (Strong 1-year equity performance)\n  3. *NIC Asia Dynamic Equity Fund* (Flexible allocation)\n\n*Tip:* Keep your SIP debit date set 2 days after expected income dates to avoid failed auto-debits.`;
      } else if (lowerMsg.includes('budget') || lowerMsg.includes('spend') || lowerMsg.includes('expense')) {
        replyText = `**Family Budget Overview**:\n\n- Your family has defined category limits across **${budgets.length} spending categories**.\n- To maintain strong financial health, ensure non-essential spending (Shopping, Dining) stays below 30% of total household revenue.\n- Track expenses weekly in FamilyFin AI to catch warning alerts before exceeding your limits!`;
      } else if (lowerMsg.includes('goal') || lowerMsg.includes('land') || lowerMsg.includes('house') || lowerMsg.includes('emergency')) {
        replyText = `**Milestone Goals Strategy**:\n\n- You have **${goals.length} joint family goals** configured.\n- To reach milestone targets faster, assign specific family member contributions or link dedicated fixed deposit accounts.\n- For emergency reserves, keep 3 to 6 months of living expenses in liquid bank accounts (Nabil / Global IME Savings).`;
      } else {
        replyText = `**Namaste!** I am your **FAMILYFIN AI Financial Advisor**.\n\nBased on your family workspace:\n- **Total Liquid Balance**: Rs. ${contextSummary.total_balance.toLocaleString()}\n- **Active SIP Investments**: ${sips.length} schemes\n- **Family Members**: ${members.length} registered\n\nHow can I help you today? You can ask me about **remittance optimization**, **SIP mutual fund choices**, **budgeting tips**, or **savings goals**.`;
      }
    }

    return NextResponse.json({ reply: replyText });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process AI chat message' }, { status: 500 });
  }
}
