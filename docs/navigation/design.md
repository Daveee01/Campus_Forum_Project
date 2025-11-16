# Panduan Navigasi — Design

Tujuan: panduan singkat untuk tim desain.

- Tema: dark mode utama (hitam/slate dengan aksen biru `#2563eb`).
- Tip visual:
  - Gunakan card sederhana untuk feed (kontras tinggi, ruang putih/gelap seimbang).
  - Hindari emoji di UI — gunakan icon SVG (komponen `src/components/Icons.tsx`).
  - Ukuran font: judul post ~18-20px, body ~14px untuk kenyamanan baca.

- Komponen yang bisa di-tweak:
  - Header (`src/components/Header.tsx`) — ruang untuk search / shortcuts.
  - Post card (`src/components/PostList.tsx`) — vote sidebar, label topik, CTA "Komentar".
  - Auth modal (`src/components/AuthModal.tsx`) — sederhana dan fokus input.

Contoh warna:
- Background utama: `bg-slate-900` / `#0f172a`
- Accent blue: `#2563eb`
- Teks utama: `#FFFFFF`
- Teks sekunder: `#94a3b8`

Catatan: minta tim developer untuk membuat per-variant style tokens jika perlu tema dinamis.
