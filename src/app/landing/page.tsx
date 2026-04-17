'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import Link from 'next/link';
import MasukButton from '@/components/landing/MasukButton';
import {
  ChevronDown,
  Plus,
  Minus,
  Wifi,
  MapPin,
  Clock,
  GitBranch,
  MessageSquare,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  Leaf,
  Cpu,
  Radio,
  Globe,
  BrainCircuit,
  Activity,
  Timer,
  Target,
  Server,
  Menu,
  X,
} from 'lucide-react';

/* ================================================================
   ANIMATION HELPERS
   ================================================================ */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

function Section({ children, className = '' }: Readonly<{ children: React.ReactNode; className?: string }>) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeIn}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ================================================================
   LANDING PAGE
   ================================================================ */
export default function LandingPage() {
  /* ── Mobile nav toggle ── */
  const [mobileNav, setMobileNav] = useState(false);

  /* ── Accordion state for "How It Works" ── */
  const [openAccordion, setOpenAccordion] = useState<number | null>(1);

  /* ── Live activity feed ── */
  const activityMessages = [
    'Meja 08 baru saja tersedia.',
    'Seseorang baru saja produktif selama 2 jam di Area Indoor.',
    'Rata-rata kepadatan kafe saat ini: 65%.',
    'Meja 03 di-claim via RFID.',
    'Sofa Corner hampir penuh — sisa 1 spot.',
    'Hemat energi: 4 meja non-aktif, AC area B di-dim otomatis.',
  ];
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activityMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [activityMessages.length]);

  /* ── Nav links ── */
  const navLinks = [
    { label: 'About', href: '#about' },
    { label: 'Fitur', href: '#features' },
    { label: 'Cara Kerja', href: '#how-it-works' },
    { label: 'Roadmap', href: '#roadmap' },
    { label: 'Kontak', href: '#contact' },
  ];

  return (
    <div className="min-h-screen bg-white text-neutral-900 overflow-x-hidden">
      {/* ================================================================
          NAVBAR — WebTech style
          ================================================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
          {/* Logo */}
          <Link href="/landing" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/CWClub.png" alt="CW Coffee Logo" width={32} height={32} className="object-contain" />
            <span className="text-base font-bold tracking-widest text-white uppercase">
              CW Coffee
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center md:flex">
            <div className="flex items-center gap-0 px-1 py-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <MasukButton className="border border-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-[#4B135F]">
              Masuk
            </MasukButton>
          </div>

          {/* Mobile toggle */}
          <button
            className="text-white md:hidden"
            onClick={() => setMobileNav(!mobileNav)}
          >
            {mobileNav ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileNav && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#4B135F]/95 md:hidden"
            >
              <div className="flex flex-col gap-4 px-6 py-6">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileNav(false)}
                    className="text-xs font-semibold uppercase tracking-widest text-neutral-300 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
                <MasukButton className="mt-2 border border-white px-5 py-2 text-center text-xs font-bold uppercase tracking-widest text-white">
                  Masuk
                </MasukButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ================================================================
          SECTION 1 — HERO (WebTech style: full-screen bg image)
          ================================================================ */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden"
        style={{
          backgroundImage: "url('/CW.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Dark overlay — lebih gelap di atas agar teks terbaca */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.15) 100%)',
          }}
        />

        {/* ── Content — posisi atas viewport ── */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-36 text-center md:pt-44">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            className="font-extrabold uppercase leading-[1.1] tracking-wider text-white"
            style={{
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              textShadow: '0 2px 30px rgba(0,0,0,0.5)',
            }}
          >
            <span className="text-white">Productivity </span>
            <span className="text-white/45">Meets</span>
            <span className="text-white"> Vision, </span>
            <span className="text-white/45">Ignite</span>
            <br />
            <span className="text-white/45">Tomorrow&apos;s </span>
            <span className="text-white">Innovation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-white/55 md:text-base"
          >
            Jangan biarkan drama &ldquo;meja penuh tapi kosong&rdquo; mengganggu fokusmu.
            Cek ketersediaan meja secara real-time dan nikmati pengalaman nugas paling seamless di Malang.
          </motion.p>
        </div>

        {/* ── Scroll indicator (bottom center) ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            <ChevronDown className="h-4 w-4 text-white/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================================
          SECTION 2 — ABOUT CW EXPERIENCE
          ================================================================ */}
      <Section className="bg-white py-20 md:py-28" >
        <div id="about" className="mx-auto max-w-7xl px-6">
          {/* Top headline */}
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B135F]">
              Who We Are
            </p>
            <h2 className="mx-auto max-w-3xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-[#4B135F] md:text-4xl">
              Lebih dari Sekadar Tempat Ngopi.
            </h2>
          </motion.div>

          {/* Two columns */}
          <div className="grid items-center gap-12 md:grid-cols-2">
            {/* Left — Image */}
            <motion.div variants={fadeUp} custom={1} className="relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/CWSuasana.jpg"
                alt="CW Coffee suasana"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Right — Text */}
            <motion.div variants={fadeUp} custom={2} className="space-y-6">
              <h3 className="text-xl font-bold text-[#4B135F] md:text-2xl">
                Rumah Kedua bagi Mahasiswa &amp; Kreatif.
              </h3>
              <p className="leading-relaxed text-neutral-600">
                CW Coffee hadir sebagai ruang kerja dan belajar yang didesain khusus
                untuk mendukung produktivitasmu — WiFi kencang, colokan melimpah,
                dan kopi berkualitas dalam satu tempat.
              </p>
              <p className="border-l-4 border-[#D07E20] pl-4 text-sm italic text-neutral-500">
                &ldquo;Kami mengerti dedikasimu. Itulah mengapa kami mengintegrasikan
                teknologi tepat di meja tempat kamu berkarya.&rdquo;
              </p>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full bg-[#4B135F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3a0f49]"
              >
                Kenapa CW Coffee <ArrowRight className="h-4 w-4" />
              </a>
            </motion.div>
          </div>

          {/* Stats bar */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-20 grid grid-cols-2 gap-6 md:grid-cols-4"
          >
            {[
              { value: '25+', label: 'Meja Termonitor' },
              { value: '10+', label: 'Sensor IoT Aktif' },
              { value: '99%', label: 'Uptime Sistem' },
              { value: '<1s', label: 'Latensi Data' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-neutral-200 bg-white p-6 text-center"
              >
                <p className="text-3xl font-extrabold text-[#D07E20] md:text-4xl">{stat.value}</p>
                <p className="mt-1 text-xs text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 3 — THE PROBLEM (Ghost Booking)
          ================================================================ */}
      <Section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B135F]">
              The Problem
            </p>
            <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-[#4B135F] md:text-4xl">
              Benci Lihat Meja &ldquo;Ter-booking&rdquo; Tas padahal Orangnya Tidak Ada?
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-neutral-50 p-8 text-center md:p-12"
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <Shield className="h-8 w-8 text-red-400" />
            </div>
            <p className="text-lg leading-relaxed text-neutral-700 md:text-xl">
              Banyak meja di kafe tampak penuh karena ditinggal pergi berjam-jam.
              Di <strong className="text-neutral-900">CW Coffee</strong>, kami memastikan
              setiap inci ruang digunakan secara adil untuk kamu yang benar-benar
              ingin produktif.
            </p>
          </motion.div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 4 — SMART FEATURES / IT SOLUTIONS
          ================================================================ */}
      <Section className="bg-white py-20 md:py-28">
        <div id="features" className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B135F]">
              Smart Features
            </p>
            <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-[#4B135F] md:text-4xl">
              Data untuk Kenyamananmu.
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <BarChart3 className="h-7 w-7" />,
                title: 'Smart Heatmap',
                desc: 'Ketahui area paling tenang atau paling padat di jam-jam tertentu.',
              },
              {
                icon: <Leaf className="h-7 w-7" />,
                title: 'Eco-Friendly',
                desc: 'Sistem otomatis mengoptimalkan penggunaan energi fasilitas di area yang tidak digunakan.',
              },
              {
                icon: <Zap className="h-7 w-7" />,
                title: 'Real-Time Sync',
                desc: 'Data tersinkronisasi dalam < 1 detik untuk pengalaman tanpa jeda.',
              },
              {
                icon: <Target className="h-7 w-7" />,
                title: 'High Accuracy',
                desc: 'Validasi ganda (RFID + Ultrasonic) memastikan akurasi 99%+ detection rate.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i + 1}
                className="group rounded-2xl border border-neutral-200 bg-white p-8 transition hover:border-[#D07E20]/60 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#D07E20]/10 text-[#D07E20] transition group-hover:bg-[#D07E20] group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#4B135F]">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 5 — HOW IT WORKS (Accordion)
          ================================================================ */}
      <Section className="bg-white py-20 md:py-28">
        <div id="how-it-works" className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B135F]">
              Cara Kerja
            </p>
            <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-[#4B135F] md:text-4xl">
              Sistem Cerdas, Tanpa Repot.
            </h2>
          </motion.div>

          <div className="mx-auto max-w-3xl divide-y divide-neutral-200">
            {[
              {
                num: '01',
                title: 'Tap to Claim',
                desc: 'Cukup tap kartu member/RFID-mu di meja pilihan, dan status meja otomatis menjadi milikmu.',
                icon: <Radio className="h-6 w-6" />,
              },
              {
                num: '02',
                title: 'Stay Protected',
                desc: 'Sensor ultrasonik kami akan menjaga mejamu tetap aktif selama kamu berada di tempat.',
                icon: <Shield className="h-6 w-6" />,
              },
              {
                num: '03',
                title: 'Auto-Release',
                desc: 'Pergi tanpa tap balik? Sistem akan mendeteksi kekosongan dan membuka meja untuk pelanggan lain setelah waktu tertentu.',
                icon: <Timer className="h-6 w-6" />,
              },
            ].map((step, i) => (
              <div key={step.num} className="py-6">
                <button
                  onClick={() => setOpenAccordion(openAccordion === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div className="flex items-center gap-5">
                    <span className="text-2xl font-extrabold text-neutral-300 md:text-3xl">
                      {step.num}
                    </span>
                    <span className="text-lg font-bold uppercase tracking-wide text-neutral-900 md:text-xl">
                      {step.title}
                    </span>
                  </div>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#4B135F]/30 text-[#4B135F]">
                    {openAccordion === i ? (
                      <Minus className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {openAccordion === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-4 pt-5 pl-12 md:pl-16">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#D07E20]/10 text-[#D07E20]">
                          {step.icon}
                        </div>
                        <p className="text-sm leading-relaxed text-neutral-600 md:text-base">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 6 — INTERACTIVE MAP PREVIEW (Dark Portfolio-style)
          ================================================================ */}
      <Section className="bg-[#4B135F] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#D07E20]">
              Core Feature
            </p>
            <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-white md:text-4xl">
              Cari Spot Favoritmu dalam Sekejap.
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12"
          >
            <div className="mb-8">
              <h3 className="mb-2 text-xl font-bold text-white">Interactive Floor Map</h3>
              <p className="text-sm text-neutral-400">
                Lihat meja mana yang paling tenang atau paling dekat dengan stopkontak
                langsung dari browsermu.
              </p>
            </div>

            {/* Map area labels */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              {[
                { label: 'Indoor AC', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                { label: 'Smoking Area', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
                { label: 'Sofa Corner', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
              ].map((area) => (
                <div
                  key={area.label}
                  className={`rounded-xl border p-4 text-center text-sm font-semibold ${area.color}`}
                >
                  {area.label}
                </div>
              ))}
            </div>

            {/* Simulated mini-map grid */}
            <div className="grid grid-cols-5 gap-2 md:grid-cols-8">
              {Array.from({ length: 24 }, (_, i) => {
                const statuses = ['available', 'occupied', 'available', 'reserved', 'available', 'occupied', 'available', 'available'];
                const status = statuses[i % statuses.length];
                const colors: Record<string, string> = {
                  available: 'bg-emerald-500/30 border-emerald-500/50',
                  occupied: 'bg-red-500/30 border-red-500/50',
                  reserved: 'bg-amber-500/30 border-amber-500/50',
                };
                const tableId = `table-${String(i + 1).padStart(2, '0')}`;
                return (
                  <div
                    key={tableId}
                    className={`flex aspect-square items-center justify-center rounded-lg border text-[10px] font-bold text-white/70 ${colors[status]}`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-emerald-500/60" /> Tersedia
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-red-500/60" /> Terpakai
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-amber-500/60" /> Reserved
              </span>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/map"
                className="inline-flex items-center gap-2 rounded-full bg-[#D07E20] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#b86d1a]"
              >
                Buka Map Interaktif <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 7 — LIVE ACTIVITY FEED (Testimonial-style)
          ================================================================ */}
      <Section className="bg-white py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B135F]">
              Live Feed
            </p>
            <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-[#4B135F] md:text-4xl">
              Happening Now at CW Coffee.
            </h2>
          </motion.div>

          {/* Activity cards */}
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            {/* Live ticker */}
            <motion.div
              variants={fadeUp}
              custom={1}
              className="flex flex-col justify-center rounded-2xl border border-neutral-200 bg-white p-8"
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-green-600">
                  Live
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={activityIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-lg font-medium text-neutral-800"
                >
                  &ldquo;{activityMessages[activityIndex]}&rdquo;
                </motion.p>
              </AnimatePresence>
              <p className="mt-4 text-xs text-neutral-400">Update otomatis setiap beberapa detik</p>
            </motion.div>

            {/* Quick stats feed */}
            <motion.div
              variants={fadeUp}
              custom={2}
              className="space-y-4"
            >
              {[
                { id: 'feed-available', icon: <Activity className="h-5 w-5" />, text: 'Meja 08 baru saja tersedia.', time: 'Baru saja' },
                { id: 'feed-productive', icon: <Clock className="h-5 w-5" />, text: 'Seseorang produktif 2 jam di Indoor.', time: '2 menit lalu' },
                { id: 'feed-density', icon: <BarChart3 className="h-5 w-5" />, text: 'Kepadatan kafe saat ini: 65%.', time: '5 menit lalu' },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-2xl border border-neutral-200 bg-white p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D07E20]/10 text-[#D07E20]">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-neutral-800">{item.text}</p>
                    <p className="mt-1 text-xs text-neutral-400">{item.time}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 8 — FUTURE ROADMAP
          ================================================================ */}
      <Section className="bg-white py-20 md:py-28">
        <div id="roadmap" className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B135F]">
              The Vision
            </p>
            <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-[#4B135F] md:text-4xl">
              Evolution of CW-SmartMonitor.
            </h2>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              {
                phase: 'Phase 1',
                badge: 'Current',
                badgeColor: 'bg-green-100 text-green-700',
                title: 'IoT Real-time Monitoring & Dashboard',
                desc: 'Sistem monitoring meja berbasis ESP32, RFID, dan sensor ultrasonik dengan dashboard real-time.',
                icon: <Cpu className="h-8 w-8" />,
              },
              {
                phase: 'Phase 2',
                badge: 'Next',
                badgeColor: 'bg-amber-100 text-amber-700',
                title: 'Decentralized Identity (Web3)',
                desc: 'Secure membership menggunakan blockchain-based identity untuk autentikasi tanpa password.',
                icon: <Globe className="h-8 w-8" />,
              },
              {
                phase: 'Phase 3',
                badge: 'Future',
                badgeColor: 'bg-purple-100 text-purple-700',
                title: 'AI-Powered Predictive Optimization',
                desc: 'Machine learning untuk memprediksi pola kepadatan dan mengoptimasi alokasi ruang secara otomatis.',
                icon: <BrainCircuit className="h-8 w-8" />,
              },
            ].map((item, i) => (
              <motion.div
                key={item.phase}
                variants={fadeUp}
                custom={i + 1}
                className="group relative rounded-2xl border border-neutral-200 bg-white p-8 transition hover:border-[#D07E20]/60 hover:shadow-lg"
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-300">{item.phase}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition group-hover:bg-[#D07E20]/10 group-hover:text-[#D07E20]">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#4B135F]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 9 — TECHNICAL SPECIFICATION
          ================================================================ */}
      <Section className="bg-[#4B135F] py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div variants={fadeUp} custom={0} className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#D07E20]">
              Engineering Badge
            </p>
            <h2 className="mx-auto max-w-4xl font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-white md:text-4xl">
              Robust Infrastructure.
            </h2>
          </motion.div>

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {[
              {
                icon: <Zap className="h-7 w-7" />,
                title: 'Low Latency',
                desc: 'Data tersinkronisasi dalam < 1 detik.',
              },
              {
                icon: <Shield className="h-7 w-7" />,
                title: 'High Accuracy',
                desc: 'Validasi ganda (RFID + Ultrasonic).',
              },
              {
                icon: <Server className="h-7 w-7" />,
                title: 'Scalable',
                desc: 'Arsitektur siap menangani hingga 100+ meja secara simultan.',
              },
            ].map((spec, i) => (
              <motion.div
                key={spec.title}
                variants={fadeUp}
                custom={i + 1}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-[#D07E20]/10 text-[#D07E20]">
                  {spec.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-white">{spec.title}</h3>
                <p className="text-sm text-neutral-400">{spec.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ================================================================
          SECTION 10 — CONTACT / GET IN TOUCH
          ================================================================ */}
      <Section className="bg-white py-20 md:py-28">
        <div id="contact" className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 md:grid-cols-2">
            {/* Left — CTA + Info */}
            <motion.div variants={fadeUp} custom={0} className="space-y-8">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#4B135F]">
                  Get in Touch
                </p>
                <h2 className="font-serif text-3xl font-bold uppercase leading-tight tracking-tight text-[#4B135F] md:text-4xl">
                  Kunjungi CW Coffee Sekarang.
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D07E20]/10 text-[#D07E20]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#4B135F]">Lokasi</p>
                    <p className="text-sm text-neutral-500">Malang, Jawa Timur, Indonesia</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D07E20]/10 text-[#D07E20]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#4B135F]">Jam Operasional</p>
                    <p className="text-sm text-neutral-500">Senin – Minggu: 08.00 – 23.00 WIB</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D07E20]/10 text-[#D07E20]">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#4B135F]">Fasilitas</p>
                    <p className="text-sm text-neutral-500">WiFi High-Speed, Colokan di Setiap Meja, AC</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right — Quick Links / Social */}
            <motion.div variants={fadeUp} custom={1}>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-8">
                <h3 className="mb-6 text-xl font-bold text-[#4B135F]">Connect With Us</h3>

                <div className="space-y-4">
                  <span
                    className="flex items-center gap-3 rounded-xl bg-white p-4 text-neutral-700 transition hover:bg-[#D07E20]/10 cursor-pointer"
                  >
                    <MessageSquare className="h-5 w-5 text-pink-500" />
                    <span className="text-sm font-medium">@cwcoffee.malang</span>
                  </span>
                  <span
                    className="flex items-center gap-3 rounded-xl bg-white p-4 text-neutral-700 transition hover:bg-[#D07E20]/10 cursor-pointer"
                  >
                    <MessageSquare className="h-5 w-5 text-sky-500" />
                    <span className="text-sm font-medium">@cwcoffee</span>
                  </span>
                  <span
                    className="flex items-center gap-3 rounded-xl bg-white p-4 text-neutral-700 transition hover:bg-[#D07E20]/10 cursor-pointer"
                  >
                    <GitBranch className="h-5 w-5 text-[#4B135F]" />
                    <span className="text-sm font-medium">GitHub — CW-SmartMonitor</span>
                  </span>
                </div>

                <div className="mt-8">
                  <Link
                    href="/map"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#D07E20] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#b86d1a]"
                  >
                    Cek Meja Sekarang <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ================================================================
          FOOTER
          ================================================================ */}
      <footer className="border-t border-white/10 bg-[#4B135F] text-neutral-300">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-5">
            {/* Brand */}
            <div className="sm:col-span-2 md:col-span-2">
              <div className="mb-4 flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/CWClub.png" alt="CW Coffee Logo" width={36} height={36} className="object-contain" />
                <span className="text-lg font-bold text-white">
                  CW<span className="text-[#D07E20]">-SmartMonitor</span>
                </span>
              </div>
              <p className="mb-4 max-w-xs text-sm leading-relaxed text-neutral-500">
                Dashboard monitoring meja real-time CW Coffee dengan anti-ghost booking
                system berbasis IoT.
              </p>
              <p className="text-xs text-neutral-600">
                Project UTS Framework — Teknik Informatika Polinema.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Navigasi</p>
              <ul className="space-y-3 text-sm">
                <li><a href="#about" className="hover:text-white">About</a></li>
                <li><a href="#features" className="hover:text-white">Fitur</a></li>
                <li><a href="#how-it-works" className="hover:text-white">Cara Kerja</a></li>
                <li><a href="#roadmap" className="hover:text-white">Roadmap</a></li>
              </ul>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Teknologi</p>
              <ul className="space-y-3 text-sm">
                <li>Next.js</li>
                <li>Firebase</li>
                <li>ESP32 + RFID</li>
                <li>Ultrasonic Sensor</li>
              </ul>
            </div>

            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">Links</p>
              <ul className="space-y-3 text-sm">
                <li><span className="hover:text-white cursor-pointer">GitHub</span></li>
                <li><span className="hover:text-white cursor-pointer">Instagram</span></li>
                <li><Link href="/auth/login" className="hover:text-white">Login Dashboard</Link></li>
                <li><Link href="/map" className="hover:text-white">Peta Meja</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 py-6">
          <p className="text-center text-xs text-neutral-600">
            &copy; {new Date().getFullYear()} CW-SmartMonitor — All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
