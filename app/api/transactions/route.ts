import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Transaction, CategoryType } from '@/types';
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

    const searchParams = req.nextUrl.searchParams;
    const memberId = searchParams.get('memberId');
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const query = searchParams.get('q');

    let transactions = db.getTransactionsByFamily(family.id);

    if (memberId && memberId !== 'all') {
      transactions = transactions.filter((t) => t.family_member_id === memberId);
    }

    if (category && category !== 'all') {
      transactions = transactions.filter((t) => t.category === category);
    }

    if (type && type !== 'all') {
      transactions = transactions.filter((t) => t.type === type);
    }

    if (query) {
      const qLower = query.toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.description.toLowerCase().includes(qLower) ||
          (t.merchant && t.merchant.toLowerCase().includes(qLower)) ||
          t.account_name.toLowerCase().includes(qLower)
      );
    }

    // Sort descending by date
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('GET Transactions API Error:', error);
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
    const { family_member_id, account_name, date, description, amount, type, category } = body;

    if (!family_member_id || !description || !amount || !type || !category) {
      return NextResponse.json(
        { error: 'Member, description, amount, type, and category are required.' },
        { status: 400 }
      );
    }

    const newTx: Transaction = {
      id: `tx_${uuidv4().substring(0, 8)}`,
      family_id: family.id,
      family_member_id,
      account_name: account_name || 'Primary Bank',
      date: date || new Date().toISOString().split('T')[0],
      description,
      amount: Number(amount),
      type: type as 'income' | 'expense',
      category: category as CategoryType,
      merchant: description.split(' ')[0],
      confidence: 1.0,
      created_at: new Date().toISOString(),
    };

    db.addTransaction(newTx);

    return NextResponse.json({
      message: 'Transaction added successfully',
      transaction: newTx,
    });
  } catch (error) {
    console.error('POST Transaction API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
