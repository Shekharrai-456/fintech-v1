import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { FamilyMember, Account } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: familyId } = await params;
    const members = db.getFamilyMembers(familyId);
    return NextResponse.json({ members });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: familyId } = await params;
    const body = await req.json();
    const { name, relation, monthly_income_target, bank_name, account_number, initial_balance } = body;

    if (!name || !relation) {
      return NextResponse.json(
        { error: 'Member name and relation are required.' },
        { status: 400 }
      );
    }

    const memberId = `mem_${uuidv4().substring(0, 8)}`;
    const newMember: FamilyMember = {
      id: memberId,
      family_id: familyId,
      name,
      relation,
      monthly_income_target: Number(monthly_income_target) || 0,
      avatar_url: `https://picsum.photos/seed/${memberId}/150/150`,
      created_at: new Date().toISOString(),
    };

    db.addFamilyMember(newMember);

    // Optionally create default account for this member
    let createdAccount: Account | null = null;
    if (bank_name) {
      createdAccount = {
        id: `acc_${uuidv4().substring(0, 8)}`,
        family_member_id: memberId,
        bank_name: bank_name || 'Nabil Bank',
        account_number: account_number || `ACC-${Math.floor(10000000 + Math.random() * 90000000)}`,
        balance: Number(initial_balance) || 0,
        currency: 'NPR',
        updated_at: new Date().toISOString(),
      };
      db.addAccount(createdAccount);
    }

    return NextResponse.json({
      message: 'Family member added successfully',
      member: newMember,
      account: createdAccount,
    });
  } catch (error) {
    console.error('Add Family Member API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
