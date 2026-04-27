export default function AdminDashboardPage() {
  const stats = [
    { label: 'Total Meja',      value: '32' },
    { label: 'Meja Aktif',      value: '—'  },
    { label: 'Kartu Beredar',   value: '—'  },
    { label: 'Shift Hari Ini',  value: '—'  },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-800">Dashboard</h1>
      <p className="text-neutral-500 text-sm mt-1">Ringkasan operasional CW Coffee.</p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-5">
            <p className="text-xs text-neutral-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-3xl font-bold text-neutral-800 mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-white rounded-xl border border-neutral-200 p-8 text-center text-neutral-400 text-sm">
        Konten dashboard akan ditampilkan di sini.
      </div>
    </div>
  );
}
