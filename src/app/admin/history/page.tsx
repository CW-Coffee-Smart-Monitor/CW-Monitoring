'use client';
import Link from 'next/link';
import { BarChart2, Calendar, SlidersHorizontal, Table2, Download } from 'lucide-react';

/* ── Mock data ─────────────────────────────────────────────── */

const PENDING_APPROVALS = [
  {
    initials: 'ER',
    name: 'Elena Rodriguez',
    tier: 'PREMIUM MEMBER',
    resource: 'Meeting Room B',
    time: 'Tomorrow, 2:00 PM – 4:00 PM',
    avatarBg: 'bg-neutral-700',
  },
  {
    initials: 'JS',
    name: 'Julian Smith',
    tier: 'STANDARD MEMBER',
    resource: 'Desk T-15 (Window)',
    time: 'Wed, 09:00 AM – 5:00 PM',
    avatarBg: 'bg-purple-500',
  },
  {
    initials: 'MK',
    name: 'Marcus King',
    tier: 'CORPORATE ACCOUNT',
    resource: 'Lounge Suite 1',
    time: 'Today, 5:00 PM – 7:00 PM',
    avatarBg: 'bg-amber-700',
  },
];

const SESSION_HISTORY = [
  { cardId: 'RFC-8821', tableId: 'T-12 (Atrium)', start: '08:15 AM', end: '11:30 AM', duration: '3h 15m', heavy: false },
  { cardId: 'RFC-4490', tableId: 'T-04 (Window)', start: '09:00 AM', end: '02:45 PM', duration: '5h 45m', heavy: true },
  { cardId: 'RFC-1102', tableId: 'T-08 (Communal)', start: '10:20 AM', end: '12:00 PM', duration: '1h 40m', heavy: false },
  { cardId: 'RFC-9934', tableId: 'T-18 (Quiet Zone)', start: '07:30 AM', end: '12:45 PM', duration: '5h 15m', heavy: true },
];

const BOOKING_HISTORY: { initials: string; name: string; dateTime: string; resource: string; status: 'COMPLETED' | 'NO SHOW' }[] = [
  { initials: 'JD', name: 'Jane Doe', dateTime: 'Oct 24, 09:00 AM – 11:00 AM', resource: 'Meeting Room A', status: 'COMPLETED' },
  { initials: 'RB', name: 'Robert Brown', dateTime: 'Oct 23, 02:00 PM – 05:00 PM', resource: 'Desk T-09', status: 'NO SHOW' },
  { initials: 'SL', name: 'Sarah Lee', dateTime: 'Oct 23, 10:00 AM – 12:00 PM', resource: 'Lounge Space', status: 'COMPLETED' },
];

const ESP_DEVICES = [
  { id: 'ESP-T12', status: 'ONLINE', downtime: '0m', reboots: 1 },
  { id: 'ESP-T08', status: 'ONLINE', downtime: '5m', reboots: 2 },
  { id: 'ESP-T18', status: 'DEGRADED', downtime: '14m', reboots: 1 },
  { id: 'ESP-T18', status: 'DEGRADED', downtime: '14m', reboots: 1 },
];

export default function HistoryPage() {
  return (
    <div className="space-y-8">

      {/* ── BOOKING APPROVALS ─────────────────────────────── */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Booking Approvals</h2>
            <p className="text-neutral-500 text-sm mt-0.5">Review and manage pending reservation requests from members.</p>
          </div>
          <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-[#4B135F] text-white text-xs font-semibold">
            {PENDING_APPROVALS.length} Pending
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {PENDING_APPROVALS.map((a) => (
            <div key={`${a.name}-${a.resource}`} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`${a.avatarBg} w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                  {a.initials}
                </div>
                <div>
                  <p className="font-semibold text-neutral-800 text-sm">{a.name}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">{a.tier}</p>
                </div>
              </div>
              <div className="text-xs text-neutral-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Resource:</span>
                  <span className="font-semibold text-neutral-700">{a.resource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Time:</span>
                  <span className="text-neutral-600 text-right">{a.time}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-2 rounded-lg bg-[#4B135F] text-white text-xs font-semibold hover:bg-[#3a0f4a] transition-colors"
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="flex-1 py-2 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/admin/history/booking-approvals"
          className="block w-full py-3 rounded-xl bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors text-center"
        >
          See All Booking
        </Link>
      </section>

      {/* ── DAILY & WEEKLY EXPORT ─────────────────────────── */}
      <section className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-5 h-5 text-[#4B135F]" />
              <h3 className="font-bold text-neutral-800">
                Daily &amp; Weekly Export{' '}
                <span className="text-amber-600">(Big Data Ready)</span>
              </h3>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Generate high-fidelity datasets optimized for advanced analytics and automated workflows.
              Available in <strong>CSV</strong> and <strong>JSON</strong> formats for seamless ingestion
              into Python-based clustering algorithms, ML optimization models, and executive dashboards.
            </p>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDE9F5] text-[#4B135F] text-[10px] font-semibold uppercase tracking-wide">
                ● Python Ready
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EDE9F5] text-[#4B135F] text-[10px] font-semibold uppercase tracking-wide">
                ● Clustering Optimized
              </span>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>
      </section>

      {/* ── TABLE SESSION HISTORY ─────────────────────────── */}
      <section>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">Table Session History</h2>
            <p className="text-neutral-500 text-sm mt-0.5">Comprehensive log of workspace utilization and member dwell time.</p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 transition-colors">
              <Calendar className="w-3.5 h-3.5" />
              Date Range
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 transition-colors">
              <Table2 className="w-3.5 h-3.5" />
              Table No.
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-600 text-xs font-medium hover:bg-neutral-50 transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>
        </div>

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
              {SESSION_HISTORY.map((row) => (
                <tr key={`${row.cardId}-${row.start}`}>
                  <td className="px-5 py-4 text-neutral-500 text-sm font-mono">{row.cardId}</td>
                  <td className="px-5 py-4 font-semibold text-neutral-800">{row.tableId}</td>
                  <td className="px-5 py-4 text-neutral-600">{row.start}</td>
                  <td className="px-5 py-4 text-neutral-600">{row.end}</td>
                  <td className="px-5 py-4">
                    <span className={row.heavy ? 'font-bold text-[#4B135F]' : 'text-neutral-700'}>
                      {row.duration}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {row.heavy ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDE9F5] text-[#4B135F] text-xs font-semibold">
                        🔒 Loyal/Heavy User
                      </span>
                    ) : (
                      <span className="text-neutral-300">–</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link
          href="/admin/history/table-session-history"
          className="block w-full py-3 rounded-xl bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors text-center"
        >
          See All Table Sessions
        </Link>
      </section>

      {/* ── BOOKING HISTORY ───────────────────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-neutral-800">Booking History</h2>
          <p className="text-neutral-500 text-sm mt-0.5">Historical record of all resource reservations and their fulfillment status.</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 mb-4">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '32%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">User Name</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Date &amp; Time</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Resource</th>
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {BOOKING_HISTORY.map((row) => (
                <tr key={`${row.name}-${row.dateTime}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-bold shrink-0">
                        {row.initials}
                      </div>
                      <span className="font-semibold text-neutral-800">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-neutral-600">{row.dateTime}</td>
                  <td className="px-5 py-4 text-neutral-700">{row.resource}</td>
                  <td className="px-5 py-4">
                    {row.status === 'COMPLETED' ? (
                      <span className="text-green-600 font-bold text-xs uppercase tracking-wide">Completed</span>
                    ) : (
                      <span className="text-red-500 font-bold text-xs uppercase tracking-wide">No Show</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Link
          href="/admin/history/booking-history"
          className="block w-full py-3 rounded-xl bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors text-center"
        >
          See All Booking History
        </Link>
      </section>

      {/* ── MAINTENANCE & HARDWARE LOGS ───────────────────── */}
      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-neutral-800">Maintenance &amp; Hardware Logs</h2>
          <p className="text-neutral-500 text-sm mt-0.5">Technical status matrix for deployed ESP32 sensory hardware.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ESP_DEVICES.map((dev, i) => (
            <div key={`${dev.id}-${i}`} className="bg-white rounded-xl border border-neutral-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-800 text-sm">{dev.id}</span>
                {dev.status === 'ONLINE' ? (
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                    Online
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-600 text-[10px] font-bold uppercase tracking-wide">
                    Degraded
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-500 space-y-1.5">
                <div className="flex justify-between">
                  <span>Downtime:</span>
                  <span className="font-semibold text-neutral-700">{dev.downtime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reboots (24h):</span>
                  <span className="font-semibold text-neutral-700">{dev.reboots}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

