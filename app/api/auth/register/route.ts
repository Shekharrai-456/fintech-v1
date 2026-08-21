import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { User, Family, FamilyMember } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, familyName } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required.' },
        { status: 400 }
      );
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: `user_${uuidv4().substring(0, 8)}`,
      name,
      email: email.toLowerCase(),
      password_hash: hashPassword(password),
      created_at: new Date().toISOString(),
    };

    db.createUser(newUser);

    // Create a new family or use existing Rai Family as default
    const familyTitle = familyName || `${name.split(' ')[0]}'s Family`;
    const newFamily: Family = {
      id: `family_${uuidv4().substring(0, 8)}`,
      name: familyTitle,
      created_at: new Date().toISOString(),
    };

    db.createFamily(newFamily);

    // Create self as primary member
    const newMember: FamilyMember = {
      id: `mem_${uuidv4().substring(0, 8)}`,
      family_id: newFamily.id,
      user_id: newUser.id,
      name,
      relation: 'Father', // Default relation
      monthly_income_target: 50000,
      avatar_url: `https://picsum.photos/seed/${newUser.id}/150/150`,
      created_at: new Date().toISOString(),
    };

    db.addFamilyMember(newMember);

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });

    const { password_hash, ...safeUser } = newUser;

    return NextResponse.json({
      message: 'Registration successful!',
      token,
      user: safeUser,
      family: newFamily,
    });
  } catch (error) {
    console.error('Register API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration.' },
      { status: 500 }
    );
  }
}
