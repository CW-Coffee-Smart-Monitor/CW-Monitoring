export default function MaintenancePage() {
  const features = [
    'Ticket & fault report management',
    'Sensor & device health monitoring',
    'Service desk assignment & tracking',
    'Maintenance schedule & history logs',
  ];

  return (
    <div className="min-h-[calc(100vh-96px)] flex items-center justify-center">
      <div className="w-full max-w-lg text-center px-6">

        {/* Icon container */}
        <div className="relative mx-auto mb-8 w-24 h-24">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-full bg-[#4B135F]/10 animate-ping" style={{ animationDuration: '3s' }} />
          <div className="relative w-24 h-24 rounded-full bg-[#EDE9F5] flex items-center justify-center border border-[#C9B8DC]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4B135F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4B135F]/10 border border-[#4B135F]/20 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4B135F] animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#4B135F]">Coming Soon</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-3 leading-tight">
          Maintenance &amp;<br />Service Desk
        </h1>
        <p className="text-neutral-500 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          We&apos;re building a powerful maintenance hub to keep your workspace running smoothly. Stay tuned!
        </p>

        {/* Feature list */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-5 text-left mb-8 space-y-3">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#EDE9F5] flex items-center justify-center shrink-0">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#4B135F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
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
            <span className="text-[#4B135F]">65%</span>
          </div>
          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full w-[65%] bg-[#4B135F] rounded-full" />
          </div>
        </div>

      </div>
    </div>
  );
}
