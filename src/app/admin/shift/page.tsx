'use client';
import { useState } from 'react';
import {
  Clock,
  TrendingUp,
  Minus,
  AlertTriangle,
  AlertCircle,
  BookX,
  Unlock,
  ChevronRight,
  Plus,
} from 'lucide-react';

/* ── Faulty table item type ─────────────────────────────────── */
type FaultItem = {
  id: string;
  label: string;
  title: string;
  reportedAt: string;
  labelBg: string;
  labelText: string;
};

const FAULTS: FaultItem[] = [
  { id: 'T4', label: 'T4', title: 'Power socket loose', reportedAt: '16:45', labelBg: 'bg-red-100',    labelText: 'text-red-600'    },
  { id: 'A2', label: 'A2', title: 'Monitor arm stuck',  reportedAt: '19:10', labelBg: 'bg-yellow-100', labelText: 'text-yellow-700' },
];

export default function ShiftSummaryPage() {
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Shift Summary</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Closing Report for{' '}
            <span className="font-semibold text-[#4B135F]">Evening Shift</span>
            {' '}• Oct 24, 2023
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-700 shrink-0">
          <Clock className="w-4 h-4 text-neutral-400" />
          14:00 – 22:30
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Sessions */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 relative overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Total Sessions</p>
          <p className="text-5xl font-bold text-neutral-800 leading-none mb-3">142</p>
          <div className="flex items-center gap-1.5 text-green-500 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            +12% vs yesterday
          </div>
          <div className="absolute right-4 top-4 opacity-10">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#4B135F]">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
        </div>

        {/* Average Stay Duration */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 relative overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Average Stay Duration</p>
          <p className="text-5xl font-bold text-neutral-800 leading-none mb-3">2h 15m</p>
          <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-semibold">
            <Minus className="w-3.5 h-3.5" />
            Stable average
          </div>
          <div className="absolute right-4 top-4 opacity-10">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#4B135F]">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>

        {/* Peak Occupancy Time */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 relative overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Peak Occupancy Time</p>
          <p className="text-5xl font-bold text-neutral-800 leading-none mb-3">18:30</p>
          <div className="flex items-center gap-1.5 text-amber-500 text-xs font-semibold">
            <AlertTriangle className="w-3.5 h-3.5" />
            85% capacity reached
          </div>
          <div className="absolute right-4 top-4 opacity-10">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#4B135F]">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6"  y1="20" x2="6"  y2="14"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── RFID Audit + Efficiency Recap ──────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        {/* RFID Card Audit — 2/3 width */}
        <div className="col-span-2 bg-white rounded-2xl border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-neutral-800">RFID Card Audit</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-[#4B135F] border border-purple-200">
              Pending Verification
            </span>
          </div>

          {/* Stock row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Opening Stock',    value: 200 },
              { label: 'Returned',         value: 196 },
              { label: 'Closing Expected', value: 200 },
            ].map(({ label, value }) => (
              <div key={label} className="bg-neutral-50 rounded-xl p-4 text-center border border-neutral-100">
                <p className="text-xs text-neutral-400 mb-1">{label}</p>
                <p className="text-3xl font-bold text-neutral-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Missing + Damaged */}
          <div className="grid grid-cols-2 gap-4">
            {/* Missing Cards */}
            <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-sm font-semibold text-red-600">Missing Cards (2)</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: 'ID-4092A', seen: 'Table 12' },
                  { id: 'ID-88138', seen: 'Lounge'   },
                ].map(({ id, seen }) => (
                  <div key={id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-red-100">
                    <span className="text-sm font-mono font-semibold text-neutral-700">{id}</span>
                    <span className="text-xs text-neutral-400">Last seen: {seen}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Damaged Cards */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-neutral-500 shrink-0" />
                <span className="text-sm font-semibold text-neutral-600">Damaged Cards</span>
              </div>
              <p className="text-4xl font-bold text-neutral-800 mb-1">2</p>
              <p className="text-xs text-neutral-400 leading-snug">
                Marked for replacement. Added to maintenance log.
              </p>
            </div>
          </div>
        </div>

        {/* Efficiency Recap — 1/3 width */}
        <div className="col-span-1 bg-white rounded-2xl border border-neutral-200 p-6 flex flex-col">
          <h2 className="text-base font-bold text-neutral-800 mb-5">Efficiency Recap</h2>

          {/* Score circle */}
          <div className="flex justify-center mb-6">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#EDE9F5" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="#4B135F" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 42 * 0.92} ${2 * Math.PI * 42}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-neutral-800 leading-none">92%</span>
                <span className="text-[10px] font-semibold text-neutral-400 tracking-widest uppercase">Score</span>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <BookX className="w-4 h-4 text-neutral-400 shrink-0" />
                Ghost Bookings Detected
              </div>
              <span className="text-sm font-bold text-neutral-800">4</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-neutral-50 border border-neutral-100">
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Unlock className="w-4 h-4 text-neutral-400 shrink-0" />
                Manual Releases
              </div>
              <span className="text-sm font-bold text-neutral-800">7</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Maintenance Handover ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4B135F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          <h2 className="text-base font-bold text-neutral-800">Maintenance Handover</h2>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Faulty Tables */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Faulty Tables</p>
            <div className="space-y-2">
              {FAULTS.map((fault) => (
                <button
                  key={fault.id}
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors text-left"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${fault.labelBg} ${fault.labelText}`}>
                    {fault.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">{fault.title}</p>
                    <p className="text-xs text-neutral-400">Reported at {fault.reportedAt}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />
                </button>
              ))}
            </div>
            <button
              type="button"
              className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#4B135F] hover:text-[#3a0f4a] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add fault report
            </button>
          </div>

          {/* Technical Notes */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">Technical Notes for Next Shift</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes here..."
              rows={7}
              className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#4B135F]/30"
            />
          </div>
        </div>
      </div>

      {/* ── Ready to close shift ────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center">
        <h2 className="text-lg font-bold text-neutral-800 mb-2">Ready to close shift?</h2>
        <p className="text-sm text-neutral-500 max-w-md mx-auto mb-6">
          Review all metrics above. By finalizing, you confirm the accuracy of the asset reconciliation and handover notes.
        </p>
        <label className="inline-flex items-center gap-2.5 text-sm text-neutral-600 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-300 accent-[#4B135F] cursor-pointer"
          />{' '}
          I confirm all closing procedures are complete.
        </label>
        <div>
          <button
            type="button"
            disabled={!confirmed}
            className="px-8 py-3.5 rounded-xl bg-[#4B135F] text-white text-sm font-bold hover:bg-[#3a0f4a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Finalize &amp; Close Shift
          </button>
        </div>
      </div>
    </div>
  );
}
