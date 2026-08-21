import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const rawData = db.getRawData();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        usersCount: rawData.users.length,
        familiesCount: rawData.families.length,
        membersCount: rawData.family_members.length,
        transactionsCount: rawData.transactions.length,
        sipsCount: rawData.sips.length,
        goalsCount: rawData.goals.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Database failure' },
      { status: 500 }
    );
  }
}
