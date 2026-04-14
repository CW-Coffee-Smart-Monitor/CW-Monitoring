'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('id');
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-100 p-4 space-y-4">
      <h1 className="text-lg font-semibold text-neutral-900">
        Pengaturan
      </h1>

      {/* RFID */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-200 space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">
          RFID Card
        </h2>

        <p className="text-sm text-neutral-600">
          ID Kartu: <span className="font-medium">RFID-123456</span>
        </p>

        <button className="w-full rounded-xl bg-neutral-900 py-2 text-sm text-white">
          Hubungkan Kartu Baru
        </button>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl bg-white p-4 shadow-sm border border-neutral-200 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-700">
          Preferensi
        </h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-700">Dark Mode</p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`h-6 w-11 rounded-full transition ${
              darkMode ? 'bg-emerald-500' : 'bg-neutral-300'
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow transform transition ${
                darkMode ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-700">Bahasa</p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-lg border border-neutral-200 p-1 text-sm"
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-700">Status di Peta</p>
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`h-6 w-11 rounded-full transition ${
              isPublic ? 'bg-emerald-500' : 'bg-neutral-300'
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-white shadow transform transition ${
                isPublic ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Logout */}
      <button className="w-full rounded-2xl bg-rose-500 py-3 text-sm font-semibold text-white">
        Keluar
      </button>
    </div>
  );
}