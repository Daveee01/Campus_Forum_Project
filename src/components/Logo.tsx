import React from 'react';

// Simple open-source SVG logo component for the app.
// License: MIT-style (derived from simple shapes), safe to include directly.
// Usage: <Logo size={40} compact={false} />
export default function Logo({ size = 36, compact = false }: { size?: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {/* Logo mark: simple book + speech bubble motif */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect x="6" y="10" width="36" height="28" rx="3" fill="#0ea5e9" />
        <path d="M14 14h20v4H14z" fill="#ffffff" opacity="0.95" />
        <path d="M14 20h20v3H14z" fill="#ffffff" opacity="0.85" />
        <path d="M44 34l12 8v-28l-12 8" fill="#0f172a" opacity="0.9" />
      </svg>

      {!compact && (
        <div className="flex flex-col leading-none">
          <span className="text-white font-bold text-lg">KampusConnect</span>
          <span className="text-xs text-gray-400">Forum Mahasiswa</span>
        </div>
      )}
    </div>
  );
}
