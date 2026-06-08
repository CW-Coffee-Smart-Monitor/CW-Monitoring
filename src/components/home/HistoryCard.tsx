"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { subscribeToUserReservations } from "@/lib/firestoreService";
import type { Reservation } from "@/types/reservation";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const STATUS_STYLE: Record<"confirmed" | "pending" | "cancelled", { className: string }> = {
  confirmed: { className: "bg-green-100 text-green-600" },
  pending: { className: "bg-yellow-100 text-yellow-600" },
  cancelled: { className: "bg-red-100 text-red-600" },
};

export default function HistoryCard() {
  const { t } = useLanguage();
  const hc = t.historyCard;
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [latestReservation, setLatestReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(hc.loading);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      Promise.resolve().then(() => setCurrentUser(user));
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      Promise.resolve().then(() => {
        setLatestReservation(null);
        setLoading(false);
        setMessage(hc.loginRequired);
      });
      return;
    }

    Promise.resolve().then(() => setLoading(true));

    const unsubscribeReservations = subscribeToUserReservations(
      currentUser.uid,
      (reservations) => {
        const latest = reservations[0] ?? null;
        setLatestReservation(latest);
        setLoading(false);
        setMessage(latest ? "" : hc.noHistory);
      },
      (error) => {
        console.error("LOAD USER RESERVATIONS ERROR:", error);
        setLatestReservation(null);
        setLoading(false);
        setMessage(hc.loadError);
      },
    );

    return () => unsubscribeReservations();
  }, [currentUser, hc.loginRequired, hc.noHistory, hc.loadError]);

  const content = useMemo(() => {
    if (loading) {
      return { title: hc.loading, subtitle: hc.loadingSubtitle };
    }

    if (!latestReservation) {
      return { title: hc.noHistory, subtitle: message };
    }

    const date = new Date(`${latestReservation.date}T${latestReservation.arrivalTime}:00`);

    // ✅ locale dari JSON — id-ID atau en-US sesuai bahasa
    const formattedDate = date.toLocaleDateString(hc.dateLocale, {
      day: "2-digit",
      month: "short",
    });

    const statusKey = latestReservation.status as keyof typeof STATUS_STYLE;
    const statusLabel = hc.status[statusKey]?.label ?? latestReservation.status;
    const statusStyle = STATUS_STYLE[statusKey] ?? { className: "bg-neutral-100 text-neutral-600" };

    return {
      title: `${formattedDate} · ${latestReservation.arrivalTime} ${hc.atLocation} ${latestReservation.tableName}`,
      subtitle: latestReservation.guestName,
      status: { label: statusLabel, className: statusStyle.className },
    };
  }, [latestReservation, loading, message, hc]);

  return (
    <div onClick={() => router.push("/booking")} className="rounded-2xl p-4 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition">
      <div className={loading ? "w-full rounded-2xl border border-amber-200 bg-amber-50 p-4" : "bg-white w-full rounded-2xl p-4"}>
        <p className="text-xs text-neutral-400">{hc.sectionLabel}</p>
        <h4 className="mt-1 font-semibold text-neutral-900">{content.title}</h4>
        <p className="text-sm text-neutral-500 mt-1">{content.subtitle}</p>
        {content.status && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${content.status.className}`}>{content.status.label}</span>}
      </div>
      <Clock className="text-neutral-400 ml-4" />
    </div>
  );
}
