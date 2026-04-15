'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 200) {
      setIsLoading(false);
      router.push('/'); // ganti sesuai halaman tujuan kamu
    } else {
      setIsLoading(false);
      const data = await response.json();
      setError(data.error || 'Terjadi kesalahan');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300 p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <div className="flex justify-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md">
            ☕
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Selamat <br /> Datang Kembali!
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Masuk untuk memantau kursi dan menikmati kopi favoritmu.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-neutral-200">
            <Mail className="h-5 w-5 text-neutral-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-neutral-200">
            <Lock className="h-5 w-5 text-neutral-400" />
            <input
              type="password"
              name="password"
              placeholder="Kata Sandi"
              required
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-semibold text-white hover:opacity-90 active:scale-95 transition disabled:opacity-50"
          >
            <LogIn className="h-4 w-4" strokeWidth={2.5} />
            {isLoading ? 'Loading...' : 'Masuk'}
          </button>

          {/* Register */}
          <p className="text-center text-sm text-neutral-500">
            Belum memiliki akun?{' '}
            <Link href="/auth/register" className="font-medium text-neutral-900">
              Daftar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}