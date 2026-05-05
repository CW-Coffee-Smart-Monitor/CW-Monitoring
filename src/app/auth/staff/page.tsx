'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, Eye, EyeOff, LayoutDashboard } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function StaffLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Set session cookie via server route
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // Sync Firebase client-side auth state
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch {
        // Cookie sudah di-set, tetap lanjut redirect
      }
      router.push('/admin/dashboard');
    } else {
      setIsLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Email atau kata sandi salah.');
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#3b0f50] flex-col">

        {/* Purple gradient base */}
        <div className="absolute inset-0 bg-linear-to-br from-[#4B135F] via-[#6c1f82] to-[#2a0840]" />

        {/* Logo — pojok kiri atas */}
        <div className="relative z-10 p-10 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CWClub.png" alt="CW Coffee" width={36} height={36} className="object-contain" />
          <span className="text-white font-bold text-base tracking-widest uppercase">CW Coffee</span>
        </div>

        {/* Dashboard screenshot — pojok kanan bawah, overflow seperti Directus */}
        <Image
          src="/images/dashboard.png"
          alt="CW Monitor Dashboard Preview"
          width={1100}
          height={800}
          className="absolute bottom-0 right-[-30%] w-[115%] h-auto object-cover object-left-top rounded-tl-2xl shadow-2xl opacity-90"
          priority
        />

        {/* Gradient kiri agar teks terbaca, bukan gelap seluruh panel */}
        <div className="absolute inset-0 bg-linear-to-r from-[#3b0f50]/90 via-[#3b0f50]/40 to-transparent" />
        {/* Gradient bawah tipis */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-[#2a0840]/80 to-transparent" />

        {/* Tagline — pojok kiri bawah */}
        <div className="relative mt-auto p-10 z-10">
          <p className="text-white text-2xl font-extrabold leading-snug max-w-xs">
            Monitoring coworking space<br />secara real-time.
          </p>
          <p className="text-purple-300 text-sm mt-2 max-w-xs leading-relaxed">
            Pantau sesi meja, RFID, anomali, dan laporan shift dalam satu dashboard terpadu.
          </p>
          {/* Dot indicators */}
          <div className="flex gap-1.5 mt-6">
            <span className="w-5 h-1.5 rounded-full bg-white" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-96 xl:w-md shrink-0 flex flex-col bg-white">

        {/* Top nav */}
        <div className="px-8 pt-7 pb-4 flex items-center justify-between border-b border-neutral-100">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Kembali
          </Link>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full font-medium">
            Staff Portal
          </span>
        </div>

        {/* Form area — scrollable on small screens */}
        <div className="flex-1 flex flex-col justify-center px-8 py-10 overflow-y-auto">

          {/* Logo mobile */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#4B135F] flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#4B135F]">CW Monitor</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-extrabold text-neutral-900 mb-1">Masuk ke Dashboard</h1>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            Gunakan akun yang telah diberikan oleh pemilik kafe. Akun tidak dapat dibuat sendiri.
          </p>

          {/* Error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="flex items-center gap-3 border border-neutral-200 rounded-xl px-4 py-3.5 focus-within:border-[#4B135F] focus-within:ring-2 focus-within:ring-[#4B135F]/15 transition bg-white">
              <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Alamat Email"
                required
                autoComplete="email"
                className="flex-1 outline-none text-sm text-neutral-800 placeholder-neutral-400 bg-transparent"
              />
            </div>

            {/* Password — with inline forgot */}
            <div className="flex items-center gap-3 border border-neutral-200 rounded-xl px-4 py-3.5 focus-within:border-[#4B135F] focus-within:ring-2 focus-within:ring-[#4B135F]/15 transition bg-white">
              <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Kata Sandi"
                required
                autoComplete="current-password"
                className="flex-1 outline-none text-sm text-neutral-800 placeholder-neutral-400 bg-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[#4B135F] text-xs font-semibold hover:underline whitespace-nowrap shrink-0 ml-1"
                aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-neutral-400" /> : <Eye className="w-4 h-4 text-neutral-400" />}
              </button>
              <button
                type="button"
                className="text-[#4B135F] text-xs font-semibold hover:underline whitespace-nowrap shrink-0 border-l border-neutral-200 pl-3"
              >
                Lupa Sandi?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#4B135F] py-4 text-sm font-bold text-white hover:bg-[#3a0f4a] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#4B135F]/20"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Memverifikasi...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Bottom notice */}
        <div className="px-8 py-6 border-t border-neutral-100">
          <p className="text-xs text-neutral-400 text-center leading-relaxed">
            Dengan masuk, Anda menyetujui ketentuan penggunaan sistem CW Monitor.{' '}
            <button type="button" className="text-[#4B135F] hover:underline">
              Hubungi admin
            </button>{' '}
            jika belum memiliki akun.
          </p>
        </div>
      </div>

    </div>
  );
}
