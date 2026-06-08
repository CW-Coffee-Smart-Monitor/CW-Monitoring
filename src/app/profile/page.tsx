'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Coffee, HelpCircle } from 'lucide-react';
import ProfileCard from "@/components/profile/ProfileCard";
import MenuCard from "@/components/profile/MenuCard";
import { useLanguage } from "@/context/LanguageContext";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const p = t.profile;

  return (
    <div className="max-w-2xl mx-auto space-y-4 py-2">

      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm border border-neutral-200 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4 text-neutral-700" strokeWidth={2.5} />
        </button>
        <h1 className="text-lg font-semibold text-neutral-800">
          {p.title}
        </h1>
      </div>

      {/* Profile */}
      <ProfileCard />

      {/* Menu */}
      <MenuCard
        items={[
          {
            title: p.menu.settings.title,
            subtitle: p.menu.settings.subtitle,
            icon: <Settings className="h-5 w-5" strokeWidth={2.5} />,
            href: "/profile/settings",
          },
          {
            title: p.menu.history.title,
            subtitle: p.menu.history.subtitle,
            icon: <Coffee className="h-5 w-5" strokeWidth={2.5} />,
            href: "/profile/history",
          },
          {
            title: p.menu.help.title,
            subtitle: p.menu.help.subtitle,
            icon: <HelpCircle className="h-5 w-5" strokeWidth={2.5} />,
            href: "/profile/help",
          },
        ]}
      />
    </div>
  );
}