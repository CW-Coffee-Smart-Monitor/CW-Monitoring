'use client';

/**
 * ZoomControls — Floating zoom in/out and fullscreen buttons.
 */

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  const btnClass =
    'flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50';

  return (
    <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
      <button onClick={onZoomIn} className={btnClass} aria-label="Zoom in">
        <ZoomIn className="h-4 w-4" />
      </button>
      <button onClick={onZoomOut} className={btnClass} aria-label="Zoom out">
        <ZoomOut className="h-4 w-4" />
      </button>
      <button onClick={onReset} className={btnClass} aria-label="Reset view">
        <Maximize2 className="h-4 w-4" />
      </button>
    </div>
  );
}
