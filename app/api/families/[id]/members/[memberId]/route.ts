import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const body = await req.json();

    const updated = db.updateFamilyMember(memberId, body);
    if (!updated) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Family member updated successfully',
      member: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { memberId } = await params;
    const success = db.deleteFamilyMember(memberId);

    if (!success) {
      return NextResponse.json({ error: 'Family member not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Family member removed successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
