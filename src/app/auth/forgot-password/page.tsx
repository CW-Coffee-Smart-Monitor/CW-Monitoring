'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = (fd.get('email') as string).trim();

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/user-not-found') {
        setError('Email tidak terdaftar. Periksa kembali alamat email Anda.');
      } else if (code === 'auth/invalid-email') {
        setError('Format email tidak valid.');
      } else {
        setError('Gagal mengirim email. Coba lagi beberapa saat.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f5f7' }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CWClub.png" alt="CW Coffee" width={32} height={32} className="object-contain" />
          <span className="font-bold text-sm tracking-widest uppercase" style={{ color: '#1a1a2e' }}>CW Coffee</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-black mb-2" style={{ color: '#1a1a2e' }}>Email terkirim!</h2>
            <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
              Cek inbox Anda dan ikuti link reset kata sandi yang kami kirimkan. Periksa juga folder spam jika tidak muncul.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.45)' }}
            >
              Kembali ke Login
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-black tracking-tight mb-1" style={{ color: '#1a1a2e' }}>Lupa kata sandi?</h2>
            <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
              Masukkan email akun Anda dan kami akan kirimkan link reset kata sandi.
            </p>

            {error && (
              <div className="mb-6 flex items-start gap-2.5 text-sm text-red-300 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fp-email" className="block text-xs font-semibold mb-2 tracking-wide"
                  style={{ color: '#6b7280' }}>
                  Alamat Email
                </label>
                <div className="pb-3" style={{ borderBottom: '1px solid #d1d5db' }}>
                  <input
                    id="fp-email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    required
                    autoFocus
                    className="w-full bg-transparent text-sm outline-none"
                    style={{ caretColor: '#7c3aed', color: '#1a1a2e' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.45)' }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Mengirim...
                  </span>
                ) : 'Kirim Link Reset'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link href="/auth/login"
                className="text-sm transition-colors"
                style={{ color: '#9ca3af' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#6b7280')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}>
                ← Kembali ke login
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

