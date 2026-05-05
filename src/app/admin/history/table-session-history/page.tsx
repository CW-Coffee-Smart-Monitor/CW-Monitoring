'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Calendar, Table2, SlidersHorizontal, Download, ChevronLeft as Prev, ChevronRight as Next } from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────── */
type StatusVariant = 'Standard' | 'Loyal/Heavy User' | 'Brief';

type SessionRow = {
  cardId: string;
  tableId: string;
  tableZone: string;
  start: string;
  end: string;
  duration: string;
  status: StatusVariant;
};

/* ── Mock data (142 entries simulated, showing page 1) ─────── */
const ALL_SESSIONS: SessionRow[] = [
  { cardId: 'RFC-8821', tableId: 'T-12', tableZone: 'Atrium',     start: '08:10 AM', end: '11:30 AM', duration: '3h 15m', status: 'Standard'       },
  { cardId: 'RFC-9044', tableId: 'E-04', tableZone: 'Quiet',      start: '09:00 AM', end: '02:45 PM', duration: '5h 45m', status: 'Loyal/Heavy User' },
  { cardId: 'RFC-7710', tableId: 'T-08', tableZone: 'Atrium',     start: '10:30 AM', end: '11:10 AM', duration: '45m',    status: 'Brief'           },
  { cardId: 'RFC-8112', tableId: 'T-22', tableZone: 'Window',     start: '07:40 AM', end: '12:30 PM', duration: '4h 45m', status: 'Loyal/Heavy User' },
  { cardId: 'RFC-3321', tableId: 'T-05', tableZone: 'Communal',   start: '08:50 AM', end: '10:20 AM', duration: '1h 30m', status: 'Standard'        },
  { cardId: 'RFC-4492', tableId: 'T-17', tableZone: 'Quiet',      start: '09:15 AM', end: '03:00 PM', duration: '5h 45m', status: 'Loyal/Heavy User' },
  { cardId: 'RFC-6601', tableId: 'T-03', tableZone: 'Atrium',     start: '11:00 AM', end: '11:40 AM', duration: '40m',    status: 'Brief'           },
  { cardId: 'RFC-1190', tableId: 'T-09', tableZone: 'Window',     start: '07:00 AM', end: '09:30 AM', duration: '2h 30m', status: 'Standard'        },
  { cardId: 'RFC-2234', tableId: 'T-14', tableZone: 'Communal',   start: '10:00 AM', end: '01:00 PM', duration: '3h 00m', status: 'Standard'        },
  { cardId: 'RFC-5510', tableId: 'T-21', tableZone: 'Quiet',      start: '08:30 AM', end: '02:00 PM', duration: '5h 30m', status: 'Loyal/Heavy User' },
];

const STATUS_STYLE: Record<StatusVariant, string> = {
  'Standard':        'bg-neutral-100 text-neutral-500',
  'Loyal/Heavy User': 'bg-[#EDE9F5] text-[#4B135F]',
  'Brief':           'bg-neutral-100 text-neutral-400',
};

const TOTAL_ENTRIES = 142;
const PER_PAGE = 10;
const TOTAL_PAGES = Math.ceil(TOTAL_ENTRIES / PER_PAGE);

export default function TableSessionHistoryPage() {
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/history"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-[#4B135F] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Kembali ke halaman History
        </Link>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800">Table Session History</h1>
          <p className="text-neutral-500 text-sm mt-1">Comprehensive log of workspace utilization and member dwell time.</p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
        >
          <Calendar className="w-4 h-4 text-neutral-400" />
          Today, Oct 24
        </button>
        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
        >
          <Table2 className="w-4 h-4 text-neutral-400" />
          All Tables
          <svg className="w-3.5 h-3.5 text-neutral-400 ml-0.5" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="ml-auto">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-600 font-medium hover:bg-neutral-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 mb-4">
        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: '16%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '16%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Card ID</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Table ID</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Session Start</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Session End</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Total Duration</th>
              <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {ALL_SESSIONS.map((row) => (
              <tr key={`${row.cardId}-${row.start}`} className="hover:bg-neutral-50 transition-colors">
                <td className="px-5 py-4 text-neutral-500 font-mono text-sm">{row.cardId}</td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-semibold">
                    {row.tableId}<br />
                    <span className="text-neutral-400 font-normal ml-0.5">({row.tableZone})</span>
                  </span>
                </td>
                <td className="px-5 py-4 text-neutral-600">{row.start}</td>
                <td className="px-5 py-4 text-neutral-600">{row.end}</td>
                <td className="px-5 py-4">
                  <span className={row.status === 'Loyal/Heavy User' ? 'font-bold text-[#4B135F]' : 'text-neutral-700'}>
                    {row.duration}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[row.status]}`}>
                    {row.status === 'Loyal/Heavy User' && (
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M4 6l1.5 1.5L8 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {row.status !== 'Loyal/Heavy User' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
                    )}
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-neutral-100">
          <p className="text-sm text-neutral-400">
            Showing 1 to {PER_PAGE} of {TOTAL_ENTRIES} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
            >
              <Prev className="w-3.5 h-3.5" />
            </button>
            {[1, 2, 3].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
                  currentPage === p
                    ? 'bg-[#4B135F] text-white'
                    : 'border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="w-8 h-8 flex items-center justify-center text-neutral-400 text-sm">…</span>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(TOTAL_PAGES, p + 1))}
              disabled={currentPage === TOTAL_PAGES}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 transition-colors"
            >
              <Next className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
