import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullname } = body;

    if (!email || !password || !fullname) {
      return NextResponse.json(
        { error: 'Email, password, and fullname are required' },
        { status: 400 }
      );
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      fullname,
      email,
      createdAt: new Date().toISOString(),
      role: 'user',
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        uid: user.uid,
      },
      { status: 201 }
    );

  } catch (error: unknown) {                                    // ✅ unknown
    const firebaseError = error as { code?: string; message?: string };
    
    console.error('Registration Error:', firebaseError.code, firebaseError.message);

    if (firebaseError.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar.' },
        { status: 400 }
      );
    }

    if (firebaseError.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Password terlalu lemah (minimal 6 karakter).' },
        { status: 400 }
      );
    }

    if (firebaseError.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Format email tidak valid.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: firebaseError.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}