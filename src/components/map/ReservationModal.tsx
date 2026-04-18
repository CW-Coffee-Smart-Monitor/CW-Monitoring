'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Clock, CalendarDays, CheckCircle } from 'lucide-react';
import type { TableState } from '@/types';
import type { ReservationDuration } from '@/types/reservation';
import { saveReservation } from '@/lib/firestoreService';
import { useTableContext } from '@/context/TableContext';
import { auth } from '@/lib/firebase';

interface ReservationModalProps {
  readonly table: TableState;
  readonly onClose: () => void;
}

const DURATION_OPTIONS: { value: ReservationDuration; label: string; desc: string }[] = [
  { value: '1jam',  label: '1 Jam',  desc: '±60 menit' },
  { value: '2jam',  label: '2 Jam',  desc: '±120 menit' },
  { value: 'bebas', label: 'Bebas',  desc: 'Sesuai kebutuhan' },
];

const TOLERANCE_MINUTES = 30;

export default function ReservationModal({ table, onClose }: ReservationModalProps) {
  const { reserveTable } = useTableContext();

  const [guestName,    setGuestName]    = useState('');
  const [arrivalHour,  setArrivalHour]  = useState('');
  const [arrivalMinute,setArrivalMinute]= useState('00');
  const [duration,     setDuration]     = useState<ReservationDuration>('1jam');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [success,      setSuccess]      = useState(false);

  const now       = new Date();
  const todayStr  = now.toLocaleDateString('en-CA'); // YYYY-MM-DD
  const currentHour   = now.getHours();
  const currentMinute = now.getMinutes();

  // Jam tersedia: mulai jam sekarang (jika menit < 30) atau jam berikutnya
  const minHour    = currentMinute >= 30 ? currentHour + 1 : currentHour;
  const hourOptions = Array.from({ length: 24 - minHour }, (_, i) =>
    String(minHour + i).padStart(2, '0')
  );

  // Menit tersedia untuk jam yang dipilih
  const minuteOptions = (() => {
    if (!arrivalHour) return ['00', '30'];
    const h = Number.parseInt(arrivalHour, 10);
    if (h > currentHour) return ['00', '30'];
    return ['00', '30'].filter((m) => Number.parseInt(m, 10) > currentMinute);
  })();

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setArrivalHour(e.target.value);
    setArrivalMinute('00');
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!guestName.trim())  { setError('Nama harus diisi.'); return; }
    if (!arrivalHour)       { setError('Jam kedatangan harus dipilih.'); return; }

    setLoading(true);
    setError('');

    try {
      const arrivalTime = `${arrivalHour}:${arrivalMinute}`;

      // Hitung expiresAt: jam kedatangan hari ini + toleransi
      const [hh, mm] = arrivalTime.split(':').map(Number);
      const arrivalDate = new Date();
      arrivalDate.setHours(hh, mm, 0, 0);
      const expiresAt = arrivalDate.getTime() + TOLERANCE_MINUTES * 60 * 1000;

      const id = await saveReservation({
        tableId: table.id,
        tableName: table.name,
        blockCode: table.name.charAt(0).toUpperCase(),
        coveredTableIds: [table.id],
        coveredTableNames: [table.name],
        reservationScope: 'single-table',

        guestName: guestName.trim(),
        userId: auth.currentUser?.uid,
        date: todayStr,
        arrivalTime,
        duration,
        toleranceMinutes: TOLERANCE_MINUTES,
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt,
        source: 'map',
      });

      reserveTable(table.id, id, guestName.trim(), expiresAt);
      setSuccess(true);

      // Tutup modal setelah 1.5 detik
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan reservasi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="reservation-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-70 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          key="reservation-sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl"
        >
          {/* ── Header ── */}
          <div className="relative overflow-hidden bg-[#2a0838] px-5 pb-6 pt-4">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#4B135F]/40" />
            <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-[#D7851F]/10" />
            <div className="mb-3 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-white/20" />
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#D7851F]">
                  Pesan Meja Sekarang
                </p>
                <h3 className="text-xl font-extrabold text-white">{table.name}</h3>
                <p className="mt-0.5 text-xs text-white/50">
                  {todayStr.split('-').reverse().join('/')} · Khusus hari ini
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* ── Success state ── */}
          {success ? (
            <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-base font-bold text-neutral-900">Reservasi Berhasil!</p>
              <p className="text-sm text-neutral-500">
                Meja <span className="font-semibold text-[#4B135F]">{table.name}</span> sudah dipesan.
                Silakan datang tepat waktu.
              </p>
            </div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-4 px-5 pb-6 pt-5">

              {/* Nama */}
              <div>
                <label htmlFor="guest-name" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Nama Anda
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    id="guest-name"
                    type="text"
                    placeholder="Masukkan nama Anda"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-[#4B135F] focus:ring-1 focus:ring-[#4B135F]/30"
                  />
                </div>
              </div>

              {/* Jam Kedatangan */}
              <div>
                <label htmlFor="arrival-hour" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Jam Kedatangan
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <select
                      id="arrival-hour"
                      value={arrivalHour}
                      onChange={handleHourChange}
                      className="w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-[#4B135F]"
                    >
                      <option value="">-- Pilih Jam --</option>
                      {hourOptions.map((h) => (
                        <option key={h} value={h}>{h}:00 WIB</option>
                      ))}
                    </select>
                  </div>
                  <span className="font-bold text-neutral-400">:</span>
                  <select
                    value={arrivalMinute}
                    onChange={(e) => setArrivalMinute(e.target.value)}
                    disabled={!arrivalHour}
                    className="w-24 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none focus:border-[#4B135F] disabled:opacity-50"
                  >
                    {minuteOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-1.5 text-[11px] text-neutral-400">
                  Toleransi keterlambatan:{' '}
                  <span className="font-semibold text-[#D7851F]">30 menit</span>
                  {' '}— lewat batas, meja dibebaskan otomatis.
                </p>
              </div>

              {/* Durasi */}
              <div>
                <label htmlFor="duration" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                  Estimasi Durasi
                </label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setDuration(opt.value)}
                      className={`flex flex-1 flex-col items-center rounded-xl py-3 text-sm transition-all ${
                        duration === opt.value
                          ? 'bg-[#4B135F] text-white shadow-lg shadow-[#4B135F]/25'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      <span className="font-bold">{opt.label}</span>
                      <span className={`text-[10px] mt-0.5 ${duration === opt.value ? 'text-white/70' : 'text-neutral-400'}`}>
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs text-amber-700">
                <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Meja akan ditandai <strong>Reserved (kuning)</strong> di peta.
                  Jika tidak hadir dalam 30 menit dari jam yang dipilih, reservasi otomatis dibatalkan.
                </span>
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs font-medium text-red-500">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-[#4B135F] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#4B135F]/30 transition-all hover:bg-[#3a0f49] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Menyimpan...' : 'Konfirmasi Reservasi →'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
