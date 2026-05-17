'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ArrowLeft, CreditCard, Moon, Globe, Eye, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function SettingsPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [darkMode, setDarkMode] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
  };

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
        <h1 className="text-lg font-semibold text-neutral-900">
          {t.settings.title}
        </h1>
      </div>

      {/* RFID */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-200 space-y-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-neutral-500" strokeWidth={2.5} />
          <h2 className="text-sm font-semibold text-neutral-700">
            {t.settings.rfid.title}
          </h2>
        </div>
        <p className="text-sm text-neutral-600">
          {t.settings.rfid.id}: <span className="font-medium">RFID-123456</span>
        </p>
        <button className="w-full rounded-xl bg-neutral-900 py-2 text-sm text-white hover:opacity-90">
          {t.settings.rfid.connect}
        </button>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-200 space-y-4">
        <div className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-neutral-500" strokeWidth={2.5} />
          <h2 className="text-sm font-semibold text-neutral-700">
            {t.settings.preferences.title}
          </h2>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-neutral-400" />
            <p className="text-sm text-neutral-700">{t.settings.preferences.darkMode}</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`h-6 w-11 rounded-full transition ${darkMode ? 'bg-emerald-500' : 'bg-neutral-300'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white shadow transform transition ${darkMode ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-neutral-400" />
            <p className="text-sm text-neutral-700">{t.settings.preferences.language}</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
            className="rounded-lg border border-neutral-200 p-1 text-sm"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-neutral-400" />
            <p className="text-sm text-neutral-700">{t.settings.preferences.mapStatus}</p>
          </div>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`h-6 w-11 rounded-full transition ${isPublic ? 'bg-emerald-500' : 'bg-neutral-300'}`}
          >
            <div className={`h-5 w-5 rounded-full bg-white shadow transform transition ${isPublic ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-500 py-3 text-sm font-semibold text-white hover:opacity-90"
      >
        <LogOut className="h-4 w-4" strokeWidth={2.5} />
        {t.settings.logout}
      </button>
    </div>
  );
}