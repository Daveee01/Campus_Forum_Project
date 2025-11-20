import React from 'react';
export default function Footer() {
  return (
    <footer className="border-t border-slate-800 py-6 text-center text-sm text-gray-500 bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <p>© {new Date().getFullYear()} KampusConnect • Forum Diskusi Mahasiswa</p>
        <p className="text-xs mt-1 text-gray-600">Tempat berbagi ilmu, pertanyaan, dan kolaborasi</p>
      </div>
    </footer>
  );
}
