'use client';

import { Clock } from 'lucide-react';

export default function VisitHistoryCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex justify-between items-center">
      
      <div>
        <p className="text-xs text-neutral-400">RIWAYAT KUNJUNGAN</p>
        <h4 className="font-semibold">3 hari lalu di Meja 05</h4>
        <p className="text-sm text-neutral-500">
          Vanilla Latte & Croissant
        </p>
      </div>

      <Clock className="text-neutral-400" />
    </div>
  );
}