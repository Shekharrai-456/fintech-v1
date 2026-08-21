import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { add_amount, current_amount } = body;

    let newAmount: number;

    if (add_amount !== undefined) {
      const goals = db.getGoalsByFamily('family_rai_1'); // fallback or search
      const existing = goals.find((g) => g.id === id);
      newAmount = (existing ? existing.current_amount : 0) + Number(add_amount);
    } else if (current_amount !== undefined) {
      newAmount = Number(current_amount);
    } else {
      return NextResponse.json({ error: 'Amount is required' }, { status: 400 });
    }

    const updated = db.updateGoalAmount(id, newAmount);
    if (!updated) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Goal progress updated',
      goal: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
