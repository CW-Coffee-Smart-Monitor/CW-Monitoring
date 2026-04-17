'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = (formData.get('email') as string | null)?.trim();

    if (!email) {
      setError('Email harus diisi.');
      setIsLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Email reset password telah dikirim. Periksa inbox atau folder spam.');
      form.reset();
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string };

      switch (firebaseError.code) {
        case 'auth/user-not-found':
          setError('Tidak ditemukan akun dengan email tersebut.');
          break;
        case 'auth/invalid-email':
          setError('Format email tidak valid.');
          break;
        case 'auth/network-request-failed':
          setError('Koneksi gagal. Periksa koneksi internet Anda.');
          break;
        default:
          setError(firebaseError.message || 'Terjadi kesalahan saat mengirim email reset.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-300 px-4">
      <div className="w-full max-w-md space-y-6">

        <div className="flex justify-start">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg text-xl">
            🔐
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-neutral-900 leading-tight">
            Lupa Kata Sandi?
          </h1>
          <p className="mt-3 text-neutral-600">
            Masukkan email Anda dan kami akan mengirimkan instruksi untuk mereset kata sandi.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm border border-neutral-200">
            <Mail className="h-5 w-5 text-neutral-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              disabled={isLoading}
              className="w-full bg-transparent outline-none text-sm"
            />
            
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            {isLoading ? 'Mengirim...' : 'Kirim Instruksi Reset'}
          </button>
        </form>

        <div className="flex flex-col gap-3 text-sm text-neutral-600">
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="inline-flex items-center gap-2 text-neutral-900 font-medium hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </button>
          <p>
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-semibold text-black">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
