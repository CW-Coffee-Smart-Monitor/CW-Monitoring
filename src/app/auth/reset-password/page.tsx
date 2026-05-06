'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get('oobCode');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!oobCode) {
      setCodeValid(false);
      return;
    }
    verifyPasswordResetCode(auth, oobCode)
      .then((resolvedEmail) => {
        setEmail(resolvedEmail);
        setCodeValid(true);
      })
      .catch(() => {
        setCodeValid(false);
      });
  }, [oobCode]);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Kata sandi tidak cocok.'); return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.'); return;
    }
    setError('');
    if (!oobCode) { setError('Link tidak valid.'); return; }
    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/expired-action-code') {
        setError('Link sudah kedaluwarsa. Minta link reset baru.');
      } else if (code === 'auth/invalid-action-code') {
        setError('Link tidak valid atau sudah digunakan.');
      } else if (code === 'auth/weak-password') {
        setError('Kata sandi terlalu lemah.');
      } else {
        setError('Gagal mengubah kata sandi. Coba lagi.');
      }
      setIsLoading(false);
    }
  };

  /* ── Loading: memverifikasi oobCode ── */
  if (codeValid === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm" style={{ color: '#6b7280' }}>
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Memverifikasi link...
      </div>
    );
  }

  /* ── Link tidak valid / kedaluwarsa ── */
  if (!codeValid) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#1a1a2e' }}>Link tidak valid</h2>
        <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
          Link reset kata sandi sudah kedaluwarsa atau sudah pernah digunakan. Silakan minta link baru.
        </p>
        <Link href="/auth/forgot-password"
          className="block w-full py-3.5 rounded-xl text-sm font-bold text-white text-center"
          style={{ background: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.45)' }}>
          Minta Link Baru
        </Link>
      </div>
    );
  }

  /* ── Sukses ── */
  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)' }}>
          <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: '#1a1a2e' }}>Kata sandi diperbarui!</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Mengalihkan ke halaman login...
        </p>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <>
      <h2 className="text-3xl font-black tracking-tight mb-1" style={{ color: '#1a1a2e' }}>Buat sandi baru</h2>
      <p className="text-sm mb-8" style={{ color: '#6b7280' }}>
        {email && <><strong style={{ color: '#1a1a2e' }}>{email}</strong> · </>}
        Masukkan kata sandi baru Anda di bawah ini.
      </p>

      {error && (
        <div className="mb-6 flex items-start gap-2.5 text-sm text-red-600 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="rp-password" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: '#6b7280' }}>
            Kata Sandi Baru
          </label>
          <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <input
              id="rp-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
              autoFocus
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300"
              style={{ caretColor: '#7c3aed', color: '#1a1a2e' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="shrink-0 transition-colors" style={{ color: '#9ca3af' }}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="rp-confirm" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: '#6b7280' }}>
            Konfirmasi Kata Sandi
          </label>
          <div className="pb-3" style={{ borderBottom: '1px solid #e5e7eb' }}>
            <input
              id="rp-confirm"
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi kata sandi"
              required
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-300"
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
              Menyimpan...
            </span>
          ) : 'Simpan Kata Sandi Baru'}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#f5f5f7' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CWClub.png" alt="CW Coffee" width={32} height={32} className="object-contain" />
          <span className="font-bold text-sm tracking-widest uppercase" style={{ color: '#1a1a2e' }}>CW Coffee</span>
        </div>
        <Suspense fallback={<div className="text-sm py-8 text-center" style={{ color: '#6b7280' }}>Memuat...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
