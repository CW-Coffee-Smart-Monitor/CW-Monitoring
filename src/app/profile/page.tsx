import ProfileCard from "@/components/profile/ProfileCard";
import ModeCard from "@/components/profile/ModeCard";
import MenuCard from "@/components/profile/MenuCard";

export default function ProfilePage() {
  return (
    <div className="space-y-4 p-4 bg-white min-h-screen">
      <h1 className="text-lg font-semibold text-neutral-800">Profil Saya</h1>

      {/* Profile */}
      <ProfileCard name="Aditya" email="aditya.dev@example.com" imageUrl="https://i.pravatar.cc/150?img=3" membership="MEMBER PREMIUM" />

      {/* Mode */}
      <ModeCard mode="Meeting" description="Rekomendasi meja dan fitur IoT disesuaikan dengan profil vibe ini." />

      {/* Menu */}
      <MenuCard
        items={[
          {
            title: "Pengaturan Akun",
            subtitle: "Data diri dan kata sandi",
            icon: "⚙️",
            href: "/profile/settings",
          },
          {
            title: "Notifikasi IoT",
            subtitle: "Sensor suhu, keramaian, & pesanan",
            icon: "🔔",
            href: "/profile/notifications",
          },
          {
            title: "Riwayat Booking",
            subtitle: "Cek riwayat kopi kamu",
            icon: "☕",
            href: "/profile/history",
          },
            {
            title: "Pusat Bantuan",
            subtitle: "Bantuan & keluhan",
            icon: "❓",
            href: "/profile/help",
          },
        ]}
      />
    </div>
  );
}
