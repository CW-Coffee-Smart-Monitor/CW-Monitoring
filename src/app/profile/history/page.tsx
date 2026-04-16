"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import BookingHistory from "@/components/booking/BookingHistory";
import type { BookingItem } from "@/types/booking";
import type { Reservation } from "@/types/reservation";
import {
  getFirestoreErrorMessage,
  subscribeToUserReservations,
} from "@/lib/firestoreService";
import { auth } from "@/lib/firebase";

export default function HistoryBookingPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setReservations([]);
      if (currentUser === null) {
        setErrorMessage("Masuk terlebih dahulu untuk melihat histori reservasi Anda.");
      }
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const unsubscribeReservations = subscribeToUserReservations(
      currentUser.uid,
      (items) => {
        setReservations(items);
        setLoading(false);
      },
      (error) => {
        console.error("LOAD USER RESERVATIONS ERROR:", error);
        setReservations([]);
        setErrorMessage(
          getFirestoreErrorMessage(error, "Histori reservasi tidak dapat dimuat saat ini.")
        );
        setLoading(false);
      }
    );

    return () => unsubscribeReservations();
  }, [currentUser]);

  const bookings = useMemo<BookingItem[]>(
    () =>
      reservations.map((reservation) => ({
        id: reservation.id,
        branch: reservation.branch ?? "CW Coffee",
        room: reservation.room ?? "-",
        date: reservation.date,
        tableId: reservation.tableId,
        tableName: reservation.tableName,
        time: reservation.arrivalTime,
        note: reservation.note ?? "",
        status: reservation.status === "cancelled" ? "cancelled" : reservation.status,
        createdAt: reservation.createdAt,
        paymentProof: null,
      })),
    [reservations]
  );

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
        {loading && (
          <p className="p-4 text-sm text-neutral-500">Memuat histori reservasi...</p>
        )}
        {!loading && errorMessage && (
          <p className="p-4 text-sm text-amber-700">{errorMessage}</p>
        )}
        {!loading && !errorMessage && (
          <BookingHistory bookings={bookings} />
        )}
      </div>
    </div>
  );
}

