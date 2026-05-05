'use client';
import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ChevronLeft } from 'lucide-react';

type LogRow = {
  tableId: string;
  detected: string;
  detectedVariant: 'booked' | 'normal';
  physical: string;
  physicalVariant: 'occupied' | 'empty';
  timestamp: string;
};

const ANOMALY_LOGS: LogRow[] = [
  { tableId: 'W-12', detected: 'Booked',     detectedVariant: 'booked',  physical: 'Empty (25m)',  physicalVariant: 'empty',    timestamp: '10:42' },
  { tableId: 'S-04', detected: 'Available',   detectedVariant: 'normal',  physical: 'Occupied',     physicalVariant: 'occupied', timestamp: '10:38' },
  { tableId: 'W-07', detected: 'Booked',      detectedVariant: 'booked',  physical: 'Empty (40m)',  physicalVariant: 'empty',    timestamp: '10:15' },
  { tableId: 'B-02', detected: 'Available',   detectedVariant: 'normal',  physical: 'Occupied',     physicalVariant: 'occupied', timestamp: '09:58' },
  { tableId: 'S-11', detected: 'Booked',      detectedVariant: 'booked',  physical: 'Empty (12m)',  physicalVariant: 'empty',    timestamp: '09:47' },
  { tableId: 'B-05', detected: 'Available',   detectedVariant: 'normal',  physical: 'Occupied',     physicalVariant: 'occupied', timestamp: '09:33' },
  { tableId: 'W-03', detected: 'Booked',      detectedVariant: 'booked',  physical: 'Empty (55m)',  physicalVariant: 'empty',    timestamp: '09:20' },
  { tableId: 'S-09', detected: 'Available',   detectedVariant: 'normal',  physical: 'Occupied',     physicalVariant: 'occupied', timestamp: '09:05' },
  { tableId: 'B-08', detected: 'Available',   detectedVariant: 'normal',  physical: 'Occupied',     physicalVariant: 'occupied', timestamp: '08:51' },
  { tableId: 'W-15', detected: 'Booked',      detectedVariant: 'booked',  physical: 'Empty (18m)',  physicalVariant: 'empty',    timestamp: '08:39' },
  { tableId: 'S-06', detected: 'Available',   detectedVariant: 'normal',  physical: 'Occupied',     physicalVariant: 'occupied', timestamp: '08:22' },
  { tableId: 'B-01', detected: 'Booked',      detectedVariant: 'booked',  physical: 'Empty (30m)',  physicalVariant: 'empty',    timestamp: '08:10' },
];

export default function AnomalyLogsPage() {
  const [confirmRow, setConfirmRow] = useState<LogRow | null>(null);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400 hover:text-[#4B135F] transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Ghost Booking Alerts
        </Link>
      </div>

      {/* Page title */}
      <h1 className="text-3xl font-bold text-neutral-800">Anomaly Logs</h1>
      <p className="text-neutral-500 text-sm mt-1">Riwayat seluruh anomali ghost booking yang terdeteksi sistem.</p>

      {/* Table card */}
      <div className="mt-6 bg-white rounded-xl border border-neutral-200 p-5">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="font-semibold text-neutral-800">Ghost Booking Alerts</p>
          <span className="ml-auto text-xs text-neutral-400">{ANOMALY_LOGS.length} entri hari ini</span>
        </div>

        <table className="w-full table-fixed text-sm">
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '20%' }} />
          </colgroup>
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Time
              </th>
              <th className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Table<br />ID
              </th>
              <th className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Detected<br />Status
              </th>
              <th className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Physical<br />Status
              </th>
              <th className="pb-3 text-left text-[11px] font-semibold uppercase tracking-widest text-neutral-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {ANOMALY_LOGS.map((row) => (
              <tr key={`${row.tableId}-${row.timestamp}`}>
                <td className="py-4 text-neutral-400 text-xs font-mono">{row.timestamp}</td>
                <td className="py-4 font-semibold text-neutral-800">{row.tableId}</td>
                <td className="py-4">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-600 font-medium">
                    {row.detected}
                  </span>
                </td>
                <td className="py-4">
                  {row.physicalVariant === 'occupied' ? (
                    <span className="inline-block px-2.5 py-1 rounded-md bg-red-100 text-red-500 font-medium">
                      {row.physical}
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-500">
                      {row.physical}
                    </span>
                  )}
                </td>
                <td className="py-4">
                  <button
                    type="button"
                    onClick={() => setConfirmRow(row)}
                    className="text-[#4B135F] font-bold hover:underline leading-tight text-left text-sm"
                  >
                    Confirm<br />Check
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Confirm Check Modal */}
      {confirmRow !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <button
            type="button"
            aria-label="Tutup dialog"
            className="absolute inset-0 bg-black/30 cursor-default"
            onClick={() => setConfirmRow(null)}
          />
          <dialog
            open
            aria-labelledby="confirm-title-log"
            className="relative z-10 bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-7 m-0 border-0"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="shrink-0 w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h2 id="confirm-title-log" className="text-lg font-bold text-neutral-900 leading-snug">
                Verifikasi Kehadiran Fisik (Ghost Booking Alert)
              </h2>
            </div>
            <p className="text-sm text-neutral-600 mb-7 leading-relaxed">
              Sistem mendeteksi adanya anomali pada Meja {confirmRow.tableId}. Apakah pelanggan benar-benar tidak ada di lokasi atau sensor ultrasonik tidak berfungsi dengan baik?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmRow(null)}
                className="px-5 py-2.5 rounded-lg border border-neutral-300 text-neutral-700 text-sm font-semibold hover:bg-neutral-50 transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                onClick={() => setConfirmRow(null)}
                className="px-5 py-2.5 rounded-lg bg-[#4B135F] text-white text-sm font-semibold hover:bg-[#3a0f4a] transition-colors"
              >
                Konfirmasi &amp; Kosongkan Meja
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
