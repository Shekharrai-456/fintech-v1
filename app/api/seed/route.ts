import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const data = db.resetDatabase();
    return NextResponse.json({
      message: 'FamilyFin AI database reset and populated with Rai Family demo dataset successfully.',
      family: data.families[0],
      membersCount: data.family_members.length,
      transactionsCount: data.transactions.length,
      sipsCount: data.sips.length,
      goalsCount: data.goals.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to reset database' },
      { status: 500 }
    );
  }
}
