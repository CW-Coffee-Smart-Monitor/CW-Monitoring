import { NextRequest, NextResponse } from 'next/server';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return NextResponse.json(
      { message: 'Login berhasil', uid: user.uid },
      { status: 200 }
    );

  } catch (error: unknown) {
    const firebaseError = error as { code?: string };

    if (firebaseError.code === 'auth/user-not-found' || 
        firebaseError.code === 'auth/wrong-password' ||
        firebaseError.code === 'auth/invalid-credential') {
      return NextResponse.json(
        { error: 'Email atau password salah.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan.' },
      { status: 500 }
    );
  }
}