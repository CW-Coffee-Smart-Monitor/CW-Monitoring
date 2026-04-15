'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Bell,
  Coffee,
  HelpCircle,
} from 'lucide-react';

import ProfileCard from "@/components/profile/ProfileCard";
import ModeCard from "@/components/profile/ModeCard";
import MenuCard from "@/components/profile/MenuCard";

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="space-y-4 p-4 bg-white min-h-screen">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-700" strokeWidth={2.5} />
        </button>

        <h1 className="text-lg font-semibold text-neutral-800">
          Profil Saya
        </h1>
      </div>

      {/* Profile */}
      <ProfileCard
        name="Aditya"
        email="aditya.dev@example.com"
        imageUrl="https://i.pravatar.cc/150?img=3"
        membership="MEMBER PREMIUM"
      />

      {/* Mode */}
      <ModeCard
        mode="Meeting"
        description="Rekomendasi meja dan fitur IoT disesuaikan dengan profil vibe ini."
      />

      {/* Menu */}
      <MenuCard
        items={[
          {
            title: "Pengaturan Akun",
            subtitle: "Data diri dan kata sandi",
            icon: <Settings className="h-5 w-5" strokeWidth={2.5} />,
            href: "/profile/settings",
          },
          {
            title: "Notifikasi IoT",
            subtitle: "Sensor suhu, keramaian, & pesanan",
            icon: <Bell className="h-5 w-5" strokeWidth={2.5} />,
            href: "/profile/notifications",
          },
          {
            title: "Riwayat Booking",
            subtitle: "Cek riwayat kopi kamu",
            icon: <Coffee className="h-5 w-5" strokeWidth={2.5} />,
            href: "/profile/history",
          },
          {
            title: "Pusat Bantuan",
            subtitle: "Bantuan & keluhan",
            icon: <HelpCircle className="h-5 w-5" strokeWidth={2.5} />,
            href: "/profile/help",
          },
        ]}
      />
    </div>
  );
}