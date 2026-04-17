'use client';

export default function AppFooter() {
  return (
    <footer className="border-t border-[#3a0f49] bg-[#4B135F]">
      <div className="mx-auto max-w-md px-5 py-4">
        <p className="text-[10px] text-white/30 text-center">
          © {new Date().getFullYear()} CW Coffee · Teknologi Berbasis Framework
        </p>
      </div>
    </footer>
  );
}

