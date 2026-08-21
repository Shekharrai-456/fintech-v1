import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { Family } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    let userId = 'user_shekhar_1'; // fallback demo user

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyToken(authHeader.split(' ')[1]);
      if (payload) userId = payload.userId;
    }

    const family = db.getFamilyByUserId(userId);
    if (!family) {
      return NextResponse.json({ error: 'Family not found' }, { status: 404 });
    }

    const members = db.getFamilyMembers(family.id);
    const accounts = db.getAccountsByFamily(family.id);

    return NextResponse.json({
      family,
      members,
      accountsCount: accounts.length,
    });
  } catch (error) {
    console.error('GET Families API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Family name is required.' }, { status: 400 });
    }

    const newFamily: Family = {
      id: `family_${uuidv4().substring(0, 8)}`,
      name,
      created_at: new Date().toISOString(),
    };

    db.createFamily(newFamily);

    return NextResponse.json({
      message: 'Family created successfully',
      family: newFamily,
    });
  } catch (error) {
    console.error('POST Families API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
