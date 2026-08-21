import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = db.updateSIPStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'SIP not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'SIP status updated',
      sip: updated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = db.deleteSIP(id);

    if (!success) {
      return NextResponse.json({ error: 'SIP not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'SIP deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
