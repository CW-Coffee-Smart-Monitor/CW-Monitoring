'use client';

import { Bell, HelpCircle, Search } from 'lucide-react';

export default function AdminTopBar() {
  return (
    <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search operations..."
          className="pl-9 pr-4 py-1.5 text-sm bg-neutral-100 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white transition-all"
        />
      </div>
      <div className="flex items-center gap-2 text-neutral-500">
        <button className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
          A
        </div>
      </div>
    </header>
  );
}
