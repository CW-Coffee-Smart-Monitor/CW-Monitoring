'use client';

export default function AppFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-md px-5 py-4">
        <p className="text-[10px] text-neutral-400 text-center">
          © {new Date().getFullYear()} CW Coffee · Teknologi Berbasis Framework
        </p>
      </div>
    </footer>
  );
}

