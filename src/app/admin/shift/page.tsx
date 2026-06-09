import { Clock } from "lucide-react";

export default function MaintenancePage() {
  const features = ["Daily & weekly shift summary reports", "Peak hour & occupancy trend analysis", "Revenue summary per shift period", "Staff & table performance overview"];

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center">
      <div className="w-full max-w-lg text-center px-6">
        {/* Icon container */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full bg-[#4B135F]/10 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="relative w-24 h-24 rounded-full bg-[#EDE9F5] flex items-center justify-center border border-[#C9B8DC]">
            <Clock size={40} color="#4B135F" strokeWidth={1.8} />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4B135F]/10 border border-[#4B135F]/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4B135F] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#4B135F]">Coming Soon</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-3 leading-tight">Shift Summary</h1>
        <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">We&apos;re building a powerful shift summary feature. Stay tuned!</p>

        {/* Feature list */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-left mb-8 space-y-3">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#EDE9F5] flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#4B135F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-sm text-neutral-600">{f}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="text-left mb-2">
          <div className="flex justify-between text-xs font-semibold text-neutral-400 mb-2">
            <span>Development progress</span>
            <span className="text-[#4B135F]">30%</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full w-[30%] bg-[#4B135F] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
