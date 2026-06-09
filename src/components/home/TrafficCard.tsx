'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { fetchReservationsByDate } from '@/lib/firestoreService';
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function TrafficCard() {
  const { t } = useLanguage();
  const tc = t.trafficCard;

  const [chartData, setChartData] = useState<{ time: string; traffic: number }[]>([]);

  // Tentukan format tanggal hari ini (Asia/Jakarta) -> YYYY-MM-DD
  const todayStr = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  }, []);

  // Ambil data reservasi real-time dari Firestore untuk hari ini
  useEffect(() => {
    let isMounted = true;

    async function loadTrafficData() {
      try {
        const reservations = await fetchReservationsByDate(todayStr);
        const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', '00:00'];

        const dynamicData = timeSlots.map((slot) => {
          const [slotHr, slotMin] = slot.split(':').map(Number);
          const slotVal = slotHr + slotMin / 60;

          let occupiedTables = 0;

          reservations.forEach((res) => {
            if (!res.arrivalTime) return;
            const [resHr, resMin] = res.arrivalTime.split(':').map(Number);
            const startVal = resHr + resMin / 60;

            // Tentukan durasi reservasi
            let durationHours = 2.0; // Default
            if (res.duration === '1jam') durationHours = 1.0;
            else if (res.duration === '2jam') durationHours = 2.0;
            else if (res.duration === 'bebas') durationHours = 4.0; // Dianggap 4 jam jika bebas

            const endVal = startVal + durationHours;

            // Jika slot jam ini masuk dalam range waktu reservasi
            if (slotVal >= startVal && slotVal < endVal) {
              occupiedTables += res.coveredTableIds?.length || 1;
            }
          });

          // Okupansi dari reservasi (dari total 32 meja)
          const reservationRate = Math.round((occupiedTables / 32) * 100);

          // Tambahkan baseline dinamis untuk pengunjung walk-in (tanpa reservasi) agar grafik realistis
          let walkInRate = 10;
          if (slotHr >= 12 && slotHr <= 14) walkInRate = 25; // Jam makan siang
          else if (slotHr >= 15 && slotHr <= 17) walkInRate = 35; // Puncak sore produktif
          else if (slotHr >= 19 && slotHr <= 21) walkInRate = 30; // Jam nongkrong malam

          const totalRate = Math.min(95, reservationRate + walkInRate);

          return { time: slot, traffic: totalRate };
        });

        if (isMounted) {
          setChartData(dynamicData);
        }
      } catch (error) {
        console.error('FAILED TO COMPUTE DYNAMIC TRAFFIC:', error);
      }
    }

    loadTrafficData();
    
    // Refresh data setiap 5 menit
    const interval = setInterval(loadTrafficData, 300_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [todayStr]);

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-bold text-neutral-800">{tc.title}</h3>
        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-semibold">
          {tc.today}
        </span>
      </div>

      <p className="text-xs text-neutral-500 mb-4">{tc.peakAt}</p>

      {/* Recharts Area Chart */}
      <div className="h-32 w-full -ml-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D07E20" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#D07E20" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '11px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              }}
              formatter={(value) => [`${value}% Busy`, 'Occupancy']}
              labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
            />
            <Area
              type="monotone"
              dataKey="traffic"
              stroke="#D07E20"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorTraffic)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 text-xs text-neutral-600 bg-neutral-50 border border-neutral-100 p-3 rounded-2xl">
        {tc.avoidHours}
      </div>
    </div>
  );
}