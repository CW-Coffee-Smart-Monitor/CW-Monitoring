'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'masuk' | 'daftar'>('masuk');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % 2), 4500);
    return () => clearInterval(t);
  }, []);

  /* ── LOGIN ── */
  const handleLogin = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const email    = fd.get('email') as string;
    const password = fd.get('password') as string;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      try { await signInWithEmailAndPassword(auth, email, password); } catch { /* cookie set */ }
      router.push('/home');
    } else {
      setIsLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Email atau kata sandi salah.');
    }
  };

  /* ── REGISTER ── */
  const handleRegister = async (e: { preventDefault: () => void; currentTarget: HTMLFormElement }) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const fullname = (fd.get('fullname') as string).trim();
    const email    = (fd.get('email')    as string).trim();
    const phone    = (fd.get('phone')    as string).trim();
    const password =  fd.get('password') as string;

    if (password.length < 6) {
      setError('Password minimal 6 karakter.'); setIsLoading(false); return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', cred.user.uid), {
        fullname, email, phone: phone || null,
        createdAt: new Date().toISOString(), role: 'user',
      });
      setSuccess('Akun berhasil dibuat! Silakan masuk.');
      e.currentTarget.reset();
      setTimeout(() => { setTab('masuk'); setSuccess(''); }, 1500);
    } catch (err: unknown) {
      const fe = err as { code?: string };
      const map: Record<string, string> = {
        'auth/email-already-in-use': 'Email sudah terdaftar.',
        'auth/weak-password': 'Password terlalu lemah.',
        'auth/invalid-email': 'Format email tidak valid.',
        'auth/network-request-failed': 'Koneksi gagal. Periksa internet kamu.',
        'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
        'auth/operation-not-allowed': 'Metode Email/Password belum diaktifkan.',
      };
      setError(map[fe.code ?? ''] ?? `Terjadi kesalahan (${fe.code ?? 'unknown'}).`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ══════════════════════════════════════
          LEFT PANEL — solid purple brand
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex flex-1 flex-col relative overflow-hidden">

        {/* ── Slideshow images ── */}
        <div
          className="absolute inset-0 flex"
          style={{ transform: `translateX(-${slideIndex * 100}%)`, transition: 'transform 0.8s cubic-bezier(0.77,0,0.18,1)', willChange: 'transform' }}
        >
          <div className="w-full h-full shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/CW.jpg" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="w-full h-full shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/CWSuasana.jpg" alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        {/* ── Purple brand overlay ── */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, rgba(30,10,80,0.55) 0%, rgba(88,28,190,0.45) 50%, rgba(30,10,80,0.6) 100%)' }} />
        {/* Bottom gradient for text legibility */}
        <div className="absolute inset-x-0 bottom-0 h-64" style={{ background: 'linear-gradient(to top, rgba(10,4,40,0.85) 0%, transparent 100%)' }} />

        {/* Decorative abstract lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 900" fill="none" preserveAspectRatio="xMidYMid slice">
          <path d="M320 -60 Q380 200 260 400 Q140 600 300 850" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none"/>
          <path d="M500 -20 Q560 180 460 360 Q360 540 480 780" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
          <path d="M160 100 Q80 300 180 480 Q280 660 200 880" stroke="rgba(255,255,255,0.07)" strokeWidth="1" fill="none"/>
          <path d="M600 200 L640 350" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round"/>
          <path d="M80 500 L50 600" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M550 600 Q580 680 540 760" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
          <circle cx="350" cy="380" r="160" stroke="rgba(255,255,255,0.06)" strokeWidth="1" fill="none"/>
          <circle cx="350" cy="380" r="240" stroke="rgba(255,255,255,0.04)" strokeWidth="1" fill="none"/>
        </svg>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5 px-10 pt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CWClub.png" alt="CW Coffee" width={34} height={34} className="object-contain" />
          <span className="text-white font-bold text-base tracking-widest uppercase" style={{ letterSpacing: '0.15em' }}>CW Coffee</span>
        </div>

        {/* Center circle CTA */}
        <div className="relative z-10 flex items-center justify-center flex-1">
          <div className="absolute w-72 h-72 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="absolute w-52 h-52 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.9)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
            <svg className="w-7 h-7 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
            </svg>
          </div>
        </div>

        {/* Bottom content */}
        <div className="relative z-10 px-10 pb-10">
          <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-2">CW Monitoring Platform</p>
          <h1 className="text-4xl font-black text-white leading-tight mb-6">
            Monitoring coworking<br />berbasis IoT,<br />real-time.
          </h1>
          <button
            onClick={() => { /* scroll to register */ }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ border: '1.5px solid rgba(255,255,255,0.5)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Jadwalkan Demo
          </button>

          {/* Dots indicator */}
          <div className="flex items-center gap-1.5 mt-6">
            <button onClick={() => setSlideIndex(0)}
              className="rounded-full transition-all duration-300"
              style={{ width: slideIndex === 0 ? '24px' : '6px', height: '6px',
                background: slideIndex === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }} />
            <button onClick={() => setSlideIndex(1)}
              className="rounded-full transition-all duration-300"
              style={{ width: slideIndex === 1 ? '24px' : '6px', height: '6px',
                background: slideIndex === 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — dark charcoal
      ══════════════════════════════════════ */}
      <div
        className="w-full lg:w-md shrink-0 flex flex-col justify-center relative"
        style={{ background: '#111114' }}
      >
        {/* Mobile logo (only visible < lg) */}
        <div className="lg:hidden absolute top-7 left-8 flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/CWClub.png" alt="CW Coffee" width={28} height={28} className="object-contain" />
          <span className="text-white font-bold text-sm tracking-widest uppercase">CW Coffee</span>
        </div>

        <div className="px-10 py-16 lg:py-0 w-full">

          {/* ── Heading ── */}
          <h2 className="text-3xl font-black text-white tracking-tight mb-1">
            {tab === 'masuk' ? 'Masuk ke CW Coffee' : 'Buat akun baru'}
          </h2>
          <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {tab === 'masuk' ? 'Masukkan detail akun Anda di bawah ini.' : 'Isi data berikut untuk mulai monitoring.'}
          </p>

          {/* Error / success banners */}
          {error && (
            <div className="mb-6 flex items-start gap-2.5 text-sm text-red-300 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 flex items-start gap-2.5 text-sm text-emerald-300 px-4 py-3 rounded-xl"
              style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.18)' }}>
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              {success}
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'masuk' && (
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Alamat Email
                </label>
                <div className="flex items-center gap-3 pb-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
                  <input id="login-email" name="email" type="email" placeholder="nama@email.com" required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    style={{ caretColor: '#7c3aed' }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Kata Sandi
                </label>
                <div className="flex items-center gap-3 pb-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
                  <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    style={{ caretColor: '#7c3aed' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.45)' }}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Memproses...
                  </span>
                ) : 'Masuk'}
              </button>

              <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Link href="/auth/forgot-password"
                  className="transition-colors"
                  style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Lupa kata sandi?
                </Link>
              </p>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'daftar' && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="reg-fullname" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>Nama Lengkap</label>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
                  <input id="reg-fullname" name="fullname" type="text" placeholder="Nama lengkap kamu" required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    style={{ caretColor: '#7c3aed' }} />
                </div>
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>Alamat Email</label>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
                  <input id="reg-email" name="email" type="email" placeholder="nama@email.com" required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    style={{ caretColor: '#7c3aed' }} />
                </div>
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Nomor HP <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.25)' }}>(opsional)</span>
                </label>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
                  <input id="reg-phone" name="phone" type="tel" placeholder="08xx-xxxx-xxxx"
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    style={{ caretColor: '#7c3aed' }} />
                </div>
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: 'rgba(255,255,255,0.45)' }}>Kata Sandi</label>
                <div className="flex items-center gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.14)' }}>
                  <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 6 karakter" required
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/20"
                    style={{ caretColor: '#7c3aed' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: '#7c3aed', boxShadow: '0 4px 20px rgba(124,58,237,0.45)' }}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                    </svg>
                    Memproses...
                  </span>
                ) : 'Buat Akun'}
              </button>
            </form>
          )}

          {/* ── Bottom: switch tab ── */}
          <div className="flex items-center justify-between mt-8 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {tab === 'masuk' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            </p>
            <button
              onClick={() => { setTab(tab === 'masuk' ? 'daftar' : 'masuk'); setError(''); setSuccess(''); }}
              className="text-sm font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
              {tab === 'masuk' ? 'Buat Akun' : 'Masuk'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
