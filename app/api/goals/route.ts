import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Goal } from '@/types';
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

    const goals = db.getGoalsByFamily(family.id);

    const goalStats = goals.map((g) => {
      const percentage = g.target_amount > 0 ? Math.min(100, Math.round((g.current_amount / g.target_amount) * 100)) : 0;
      return {
        ...g,
        percentage,
        remaining: Math.max(0, g.target_amount - g.current_amount),
      };
    });

    return NextResponse.json({ goals: goalStats });
  } catch (error) {
    console.error('GET Goals API Error:', error);
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
    const { title, target_amount, current_amount, target_date } = body;

    if (!title || !target_amount || !target_date) {
      return NextResponse.json(
        { error: 'Title, target amount, and target date are required.' },
        { status: 400 }
      );
    }

    const newGoal: Goal = {
      id: `goal_${uuidv4().substring(0, 8)}`,
      family_id: family.id,
      name: title,
      title,
      target_amount: Number(target_amount),
      current_amount: Number(current_amount) || 0,
      target_date,
      status: Number(current_amount) >= Number(target_amount) ? 'completed' : 'in_progress',
      created_at: new Date().toISOString(),
    };

    db.addGoal(newGoal);

    return NextResponse.json({
      message: 'Goal created successfully',
      goal: newGoal,
    });
  } catch (error) {
    console.error('POST Goal API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
