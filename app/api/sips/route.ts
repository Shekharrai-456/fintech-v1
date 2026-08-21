import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { SIP } from '@/types';
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

    const sips = db.getSIPsByFamily(family.id);
    const mutualFunds = db.getMutualFunds();

    const totalMonthlyInvestment = sips
      .filter((s) => s.status === 'active')
      .reduce((acc, s) => acc + s.monthly_amount, 0);

    return NextResponse.json({
      sips,
      mutualFunds,
      totalMonthlyInvestment,
    });
  } catch (error) {
    console.error('GET SIPs API Error:', error);
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
    const { family_member_id, fund_name, monthly_amount, sip_date, folio_number } = body;

    if (!family_member_id || !fund_name || !monthly_amount) {
      return NextResponse.json(
        { error: 'Member, fund name, and monthly amount are required.' },
        { status: 400 }
      );
    }

    const newSIP: SIP = {
      id: `sip_${uuidv4().substring(0, 8)}`,
      family_id: family.id,
      family_member_id,
      fund_name,
      monthly_amount: Number(monthly_amount),
      sip_date: Number(sip_date) || 1,
      status: 'active',
      folio_number: folio_number || `FOLIO-${Math.floor(100000 + Math.random() * 900000)}`,
      created_at: new Date().toISOString(),
    };

    db.addSIP(newSIP);

    return NextResponse.json({
      message: 'SIP created successfully',
      sip: newSIP,
    });
  } catch (error) {
    console.error('POST SIP API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
