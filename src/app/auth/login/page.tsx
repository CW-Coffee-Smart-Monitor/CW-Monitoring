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
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-300 px-4">
    <div className="w-full max-w-md space-y-6">

      {/* Icon */}
      <div className="flex justify-start">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-lg text-xl">
          ☕
        </div>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 leading-tight">
          Selamat Datang <br /> Kembali!
        </h1>
        <p className="mt-3 text-neutral-600">
          Masuk untuk cek ketersediaan meja, promo, dan mulai hari produktifmu.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">
          {error}
        </p>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm border border-neutral-200">
          <Mail className="h-5 w-5 text-neutral-400" />
          <input
            type="text"
            name="email"
            placeholder="Email / Nomor HP"
            required
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        {/* Password */}
        <div className="flex items-center gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm border border-neutral-200">
          <Lock className="h-5 w-5 text-neutral-400" />
          <input
            type="password"
            name="password"
            placeholder="Kata Sandi"
            required
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        {/* Options */}
        <div className="flex justify-between text-sm text-neutral-600">
          <span className="cursor-pointer">Ingat Saya</span>
          <span className="cursor-pointer font-medium text-neutral-900">
            Lupa Sandi?
          </span>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-95 transition disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          {isLoading ? 'Loading...' : 'Masuk →'}
        </button>

        {/* Register */}
        <p className="text-center text-sm text-neutral-600">
          Belum punya akun?{" "}
          <Link href="/auth/register" className="font-semibold text-black">
            Daftar Sekarang
          </Link>
        </p>
      </form>
    </div>
  </div>
);
}