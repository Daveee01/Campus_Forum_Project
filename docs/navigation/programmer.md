# Panduan Navigasi — Programmer

Tujuan: panduan cepat untuk tim pengembang / programmer.

- Struktur aplikasi:
  - `src/` — semua kode React + TS
  - `src/lib/firebase.ts` — wrapper auth/post/comment + fallback localStorage
  - `src/components/` — komponen UI (Header, AuthModal, PostList, Comments)
  - `src/pages/` — halaman aplikasi (Home, CreatePost, Profile, PostDetail)

- Alur kerja cepat:
  1. Jalankan dev server: `npm run dev`
  2. Periksa console untuk error TypeScript / runtime.
  3. Untuk fitur auth, periksa `src/lib/firebase.ts` — app mendukung Firestore jika env diisi, jika tidak pake localStorage.

- Catatan teknis:
  - Untuk menambahkan field ke profil: update `UserProfile` di `src/lib/firebase.ts` dan sinkronkan UI.
  - Untuk mengaktifkan Firebase Production: siapkan env `VITE_FIREBASE_*` dan atur rules Firestore/Storage.

Kontak tim: gunakan issue pada repo untuk perubahan besar.
