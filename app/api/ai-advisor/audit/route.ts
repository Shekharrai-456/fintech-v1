import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let authUser = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      authUser = verifyToken(authHeader.substring(7));
    }

    // Default to demo Rai family if unauthenticated
    let family = null;
    if (authUser) {
      family = db.getFamilyByUserId(authUser.userId);
    }
    if (!family) {
      family = db.getFamily('fam_rai_1') || db.getRawData().families[0];
    }

    if (!family) {
      return NextResponse.json({ error: 'Family workspace not found' }, { status: 404 });
    }

    // Fetch complete family financial context
    const members = db.getFamilyMembers(family.id);
    const accounts = db.getAccountsByFamily(family.id);
    const transactions = db.getTransactionsByFamily(family.id);
    const budgets = db.getBudgetsByFamily(family.id);
    const sips = db.getSIPsByFamily(family.id);
    const goals = db.getGoalsByFamily(family.id);

    // Compute basic math for prompt & fallback
    const totalAccountBalance = accounts.reduce((acc, a) => acc + (a.balance || 0), 0);
    
    const incomeTxns = transactions.filter(t => t.type === 'income');
    const expenseTxns = transactions.filter(t => t.type === 'expense');
    const remittanceTxns = transactions.filter(t => t.is_remittance || (t.category as string) === 'Remittance' || t.description.toLowerCase().includes('remittance') || t.description.toLowerCase().includes('dubai') || t.description.toLowerCase().includes('exchange'));

    const totalIncome = incomeTxns.reduce((acc, t) => acc + t.amount, 0);
    const totalExpenses = expenseTxns.reduce((acc, t) => acc + t.amount, 0);
    const totalRemittance = remittanceTxns.reduce((acc, t) => acc + t.amount, 0);
    const totalSipMonthly = sips.filter(s => s.status === 'active').reduce((acc, s) => acc + s.monthly_amount, 0);
    
    const goalTargetSum = goals.reduce((acc, g) => acc + g.target_amount, 0);
    const goalCurrentSum = goals.reduce((acc, g) => acc + g.current_amount, 0);

    const contextPayload = {
      family_name: family.name,
      currency: 'NPR (Nepalese Rupees - Rs.)',
      members: members.map(m => ({ name: m.name, relation: m.relation, income_target: m.monthly_income_target })),
      total_account_balance: totalAccountBalance,
      recent_monthly_income: totalIncome,
      recent_monthly_expense: totalExpenses,
      remittance_inflow: totalRemittance,
      active_sips_count: sips.length,
      active_sips_monthly_total: totalSipMonthly,
      sips_detail: sips.map(s => ({ fund: s.fund_name, monthly: s.monthly_amount, status: s.status })),
      category_budgets: budgets.map(b => ({ category: b.category, limit: b.monthly_limit || b.monthly_budget })),
      financial_goals: goals.map(g => ({ title: g.title || g.name, target: g.target_amount, saved: g.current_amount, target_date: g.target_date })),
    };

    let auditResult = null;

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

        const prompt = `
Perform an expert, personalized Nepali Family Wealth & Financial Audit for the family workspace context provided below:

Family Context JSON:
${JSON.stringify(contextPayload, null, 2)}

Provide a structured financial audit JSON response adhering strictly to the schema.
Consider:
- Nepali economic & household patterns (Remittance optimization, Bank Fixed Deposits, Nabil/Global IME Mutual Fund SIPs, Land/Gold investment goals).
- Savings ratio (Income vs Expenses vs Remittance vs SIP contributions).
- Emergency fund readiness (months of expense coverage in bank balance).
- Budget discipline and actionable recommendations.
`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an elite Certified Financial Planner specializing in Nepalese family finances, remittance wealth management, and mutual fund investments. Output strictly valid JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                health_score: { type: Type.INTEGER, description: 'Overall financial health score from 0 to 100' },
                health_status: { type: Type.STRING, description: 'Excellent, Good, Fair, or Needs Attention' },
                summary: { type: Type.STRING, description: '2-3 sentence overview of family wealth position' },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    savings_rate_pct: { type: Type.INTEGER },
                    remittance_share_pct: { type: Type.INTEGER },
                    emergency_fund_months: { type: Type.NUMBER },
                    sip_contribution_pct: { type: Type.INTEGER },
                  },
                },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                concerns: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      category: { type: Type.STRING },
                      impact: { type: Type.STRING },
                      action: { type: Type.STRING },
                      estimated_monthly_savings: { type: Type.NUMBER },
                    },
                  },
                },
                nepal_wealth_tip: { type: Type.STRING },
              },
              required: ['health_score', 'health_status', 'summary', 'strengths', 'concerns', 'recommendations', 'nepal_wealth_tip'],
            },
          },
        });

        if (response.text) {
          auditResult = JSON.parse(response.text.trim());
        }
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to dynamic algorithm:', geminiError);
      }
    }

    // Dynamic Fallback Audit if Gemini unavailable or failed
    if (!auditResult) {
      const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 35;
      const emergencyMonths = totalExpenses > 0 ? Number((totalAccountBalance / totalExpenses).toFixed(1)) : 4.5;
      const remittanceShare = totalIncome > 0 ? Math.round((totalRemittance / totalIncome) * 100) : 42;
      const sipPct = totalIncome > 0 ? Math.round((totalSipMonthly / totalIncome) * 100) : 10;

      let score = 75;
      if (savingsRate > 30) score += 10;
      if (emergencyMonths >= 6) score += 10;
      if (sips.length > 0) score += 5;

      auditResult = {
        health_score: Math.min(score, 98),
        health_status: score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : 'Needs Attention',
        summary: `The ${family.name} maintains a strong financial foundation with an active monthly remittance inflow of Rs. ${totalRemittance.toLocaleString()} and Rs. ${totalSipMonthly.toLocaleString()} committed to Nepalese mutual fund SIPs.`,
        metrics: {
          savings_rate_pct: Math.max(savingsRate, 15),
          remittance_share_pct: remittanceShare,
          emergency_fund_months: emergencyMonths,
          sip_contribution_pct: sipPct,
        },
        strengths: [
          `Consistent remittance inflows representing ${remittanceShare}% of family revenue`,
          `Active automated SIP investments in Nepalese mutual funds (Rs. ${totalSipMonthly.toLocaleString()}/mo)`,
          `Healthy liquid emergency coverage (${emergencyMonths} months of current expenses)`,
        ],
        concerns: [
          'Category budget enforcement can be tightened for Dining & Utilities',
          'A portion of unallocated bank balance could earn higher yield in NPR Fixed Deposits or Equities',
        ],
        recommendations: [
          {
            title: 'Automate Remittance-to-SIP Direct Transfer',
            category: 'Remittance & Investments',
            impact: 'High',
            action: 'Route 20% of incoming foreign remittances directly into Nabil Balanced Fund II before secondary spending.',
            estimated_monthly_savings: 15000,
          },
          {
            title: 'Set Up 6-Month High-Yield NRB Remittance FD',
            category: 'Emergency Fund',
            impact: 'Medium',
            action: 'Lock Rs. 200,000 liquid surplus into a Nepali Remittance Fixed Deposit earning +1% premium interest.',
            estimated_monthly_savings: 3500,
          },
          {
            title: 'Optimize Household Shopping & Dining Budget',
            category: 'Budgeting',
            impact: 'Medium',
            action: 'Caps non-essential grocery & festival shopping to stay within the Rs. 35,000 monthly limit.',
            estimated_monthly_savings: 8000,
          },
        ],
        nepal_wealth_tip: 'Nepali commercial banks offer a 1% additional interest rate bonus on Fixed Deposits funded directly from foreign remittance receipts!',
      };
    }

    // Save insight into DB
    db.addInsight({
      id: `insight_${Date.now()}`,
      family_id: family.id,
      title: `Financial Wealth Audit (${auditResult.health_status})`,
      content: auditResult.summary,
      type: auditResult.health_score >= 80 ? 'positive' : auditResult.health_score >= 60 ? 'tip' : 'warning',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      family_name: family.name,
      audit: auditResult,
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error generating AI audit:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate financial audit' }, { status: 500 });
  }
}
