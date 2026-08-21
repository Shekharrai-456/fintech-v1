import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing or malformed token.' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid or expired token.' },
        { status: 401 }
      );
    }

    const user = db.getUserById(payload.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    const family = db.getFamilyByUserId(user.id);
    const members = family ? db.getFamilyMembers(family.id) : [];

    const { password_hash, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
      family: family || null,
      members,
    });
  } catch (error) {
    console.error('Auth /me API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}
