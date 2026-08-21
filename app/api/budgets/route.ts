import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Budget, CategoryType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'user_shekhar_1';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.split(' ')[1]);
      if (payload) userId = payload.userId;
    }

    const family = db.getFamilyByUserId(userId);
    if (!family) {
      return NextResponse.json({ error: 'Family not found.' }, { status: 404 });
    }

    const budgets = db.getBudgetsByFamily(family.id);
    const transactions = db.getTransactionsByFamily(family.id);

    // Calculate actual spend per category for current month
    const categorySpent: Record<string, number> = {};
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date.startsWith(currentMonth)) {
        categorySpent[tx.category] = (categorySpent[tx.category] || 0) + tx.amount;
      }
    });

    const budgetStatus = budgets.map((b) => {
      const limit = b.monthly_limit || b.monthly_budget || 0;
      const spent = categorySpent[b.category] || 0;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return {
        ...b,
        monthly_limit: limit,
        monthly_budget: limit,
        spent,
        remaining: limit - spent,
        percentage,
        is_warning: percentage >= 80 && percentage < 100,
        is_exceeded: percentage >= 100,
      };
    });

    return NextResponse.json({
      month: currentMonth,
      budgets: budgetStatus,
      categorySpent,
    });
  } catch (error) {
    console.error('GET Budgets API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'user_shekhar_1';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.split(' ')[1]);
      if (payload) userId = payload.userId;
    }

    const family = db.getFamilyByUserId(userId);
    if (!family) {
      return NextResponse.json({ error: 'Family not found.' }, { status: 404 });
    }

    const body = await req.json();
    const { category, monthly_limit } = body;

    if (!category || monthly_limit === undefined) {
      return NextResponse.json(
        { error: 'Category and monthly_limit are required.' },
        { status: 400 }
      );
    }

    const existingBudgets = db.getBudgetsByFamily(family.id);
    const existing = existingBudgets.find((b) => b.category === category);

    const budget: Budget = {
      id: existing ? existing.id : `bgt_${uuidv4().substring(0, 8)}`,
      family_id: family.id,
      category: category as CategoryType,
      monthly_limit: Number(monthly_limit),
      monthly_budget: Number(monthly_limit),
      created_at: existing ? existing.created_at : new Date().toISOString(),
    };

    const saved = db.saveBudget(budget);

    return NextResponse.json({
      message: 'Budget saved successfully',
      budget: saved,
    });
  } catch (error) {
    console.error('POST Budget API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
