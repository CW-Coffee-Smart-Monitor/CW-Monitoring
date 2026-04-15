"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import BookingHistory from "@/components/booking/BookingHistory";
import type { BookingItem } from "@/types/booking";

export default function HistoryBookingPage() {
  const router = useRouter();

  const bookings: BookingItem[] = [
    {
      id: "BK-001",
      branch: "CW Coffee Pusat",
      room: "Sofa",
      date: "2026-01-10",
      tableId: 1,
      tableName: "Meja 1",
      time: "19:00",
      note: "Dekat colokan",
      status: "completed",
      createdAt: "2026-01-08 14:30",
      paymentProof: null,
    },
  ];

  return (
    <div className="min-h-screen bg-white p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50">
          <ArrowLeft className="h-4 w-4 text-neutral-700" strokeWidth={5} />
        </button>

        <h1 className="text-lg font-semibold text-neutral-900">History Reservasi Saya</h1>
      </div>

      {/* Card Wrapper */}
      <div className="rounded-2xl bg-white p-3 shadow-sm border border-neutral-200">
        <BookingHistory bookings={bookings} />
      </div>
    </div>
  );
}
