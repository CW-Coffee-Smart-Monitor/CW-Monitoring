'use client';

export default function TrafficCard() {
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm">
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Prediksi Puncak</h3>
        <span className="text-xs text-neutral-400">Hari ini</span>
      </div>

      <p className="text-sm text-neutral-500 mb-4">
        Puncak keramaian pukul 14:00
      </p>

      {/* Fake Chart */}
      <div className="h-24 bg-gradient-to-t from-orange-200 to-transparent rounded-xl" />

      <div className="mt-4 text-xs text-neutral-500 bg-neutral-100 p-3 rounded-xl">
        Hindari jam sibuk 14:00 - 16:00
      </div>
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import { useTableContext } from '@/context/TableContext';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   Tooltip,
//   ResponsiveContainer,
// } from 'recharts';

// export default function TrafficCard() {
//   const { history } = useTableContext(); // ambil data real-time
//   const [chartData, setChartData] = useState<any[]>([]);
//   const [peakHour, setPeakHour] = useState<string>('00');

//   useEffect(() => {
//     if (!history || history.length === 0) return;

//     const grouped: Record<number, number[]> = {};

//     history.forEach((item: any) => {
//       const hour = new Date(item.timestamp).getHours();

//       if (!grouped[hour]) {
//         grouped[hour] = [];
//       }

//       grouped[hour].push(item.filled); // jumlah meja terisi
//     });

//     const result = Object.keys(grouped).map((hour) => {
//       const values = grouped[Number(hour)];
//       const avg =
//         values.reduce((a, b) => a + b, 0) / values.length;

//       return {
//         hour: hour.padStart(2, '0'),
//         value: Math.round(avg),
//       };
//     });

//     result.sort((a, b) => Number(a.hour) - Number(b.hour));

//     setChartData(result);

//     const peak = result.reduce((max, item) =>
//       item.value > max.value ? item : max
//     );

//     setPeakHour(peak.hour);
//   }, [history]);

//   return (
//     <div className="bg-white rounded-3xl p-5 shadow-sm">
      
//       <div className="flex justify-between items-center mb-3">
//         <h3 className="font-semibold">Prediksi Puncak</h3>
//         <span className="text-xs text-neutral-400">Hari ini</span>
//       </div>

//       <p className="text-sm text-neutral-500 mb-4">
//         Puncak keramaian pukul {peakHour}:00
//       </p>

//       {/* Chart REAL (tanpa ubah style utama) */}
//       <div className="h-24">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={chartData}>
//             <XAxis dataKey="hour" />
//             <Tooltip />
//             <Line
//               type="monotone"
//               dataKey="value"
//               stroke="#f97316" 
//               strokeWidth={2}
//               dot={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       <div className="mt-4 text-xs text-neutral-500 bg-neutral-100 p-3 rounded-xl">
//         Hindari jam sibuk {peakHour}:00 - {Number(peakHour) + 2}:00
//       </div>
//     </div>
//   );
// }