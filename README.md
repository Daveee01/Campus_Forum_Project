# UVerse — Campus Forum (React + Firebase)

UVerse adalah aplikasi forum kampus sederhana berbasis React + Firebase. Proyek ini fokus pada alur posting, komentar, reaksi like/dislike, notifikasi real‑time, serta autentikasi pengguna.

## Fitur
- Autentikasi pengguna (Firebase Auth)
- Buat, edit, hapus post
- Komentar pada post (edit/hapus oleh penulis komentar)
- Like/Dislike post (saling eksklusif per pengguna)
- Notifikasi real‑time (mis. saat ada komentar baru di post Anda)
- Pencarian posting secara client‑side
- Fallback lokal: berjalan tanpa Firebase menggunakan `localStorage` untuk demo

## Teknologi
- React 18, TypeScript, Vite
- React Router v6
- Tailwind CSS
- Firebase Auth + Firestore

## Struktur Proyek (saat ini)
```
.
├─ backend/
│  ├─ firestore.rules        # Aturan Firestore (yang dipakai)
│  ├─ storage.rules          # Aturan Storage (yang dipakai)
│  └─ functions/             # Skeleton untuk Cloud Functions (opsional)
│     ├─ package.json
│     ├─ tsconfig.json
│     └─ src/index.ts
├─ public/
├─ src/
│  ├─ components/
│  ├─ lib/
│  ├─ pages/
│  └─ styles/
├─ index.html
├─ package.json              # name: uverse-forum
├─ vite.config.ts
├─ tailwind.config.cjs
├─ postcss.config.cjs
├─ tsconfig.json
├─ docs/
└─ .gitignore
```
Catatan: Duplikasi `firestore.rules` dan `storage.rules` masih ada di root untuk kompatibilitas lama, namun sudah di‑ignore melalui `.gitignore`. Gunakan berkas di `backend/` untuk deployment.

## Menjalankan Secara Lokal
Prasyarat:
- Node.js 18+
- NPM 9+

Langkah:
```powershell
# 1) Instal dependensi
npm install

# 2) Buat file env lokal
#    Ciptakan .env.local di root dan isi variabel berikut
#    (gunakan nilai dari Firebase Console)
#    VITE_FIREBASE_API_KEY=...
#    VITE_FIREBASE_AUTH_DOMAIN=...
#    VITE_FIREBASE_PROJECT_ID=...
#    VITE_FIREBASE_STORAGE_BUCKET=...
#    VITE_FIREBASE_MESSAGING_SENDER_ID=...
#    VITE_FIREBASE_APP_ID=...

# 3) Jalankan server dev
npm run dev
```
Tanpa konfigurasi Firebase, aplikasi akan fallback ke mode demo dengan `localStorage` (prefix kunci: `uverse_v1:*`). Kunjungi rute `/seed` untuk membuat data contoh.

Build dan preview produksi:
```powershell
npm run build
npm run preview
```

## Rute Utama
- `/` daftar post
- `/create` buat post
- `/t/:topic/:postId` detail post
- `/profile/:userId` profil pengguna
- `/seed` isi data contoh (mode lokal)

## Aturan Keamanan Firestore (ringkas)
Lokasi berkas: `backend/firestore.rules`
- Post: penulis boleh edit/hapus. Pengguna login mana pun boleh mengubah kolom reaksi (likes/dislikes dan daftar user terkait) secara terjaga.
- Comments: penulis komentar boleh edit/hapus. Baca sesuai post terkait.
- Notifications: hanya bisa dibaca pemiliknya; penulisan dilakukan oleh server/app saat event terjadi.
- Users: profil publik terbaca, update dibatasi ke pemilik.

Storage rules berada di `backend/storage.rules` dan saat ini default ketat. Sesuaikan bila Anda menambahkan upload avatar/dokumen.

## Deploy Rules (opsional)
Gunakan Firebase CLI bila ingin menerapkan aturan ke project Firebase Anda.
```powershell
# Login dan pilih project
firebase login
firebase use <YOUR_PROJECT_ID>

# Deploy Firestore + Storage rules
firebase deploy --only firestore:rules,storage:rules \
  --force
```
Pastikan `firebase.json` Anda mengarah ke berkas rules di `backend/`. Bila belum ada, buat konfigurasi sesuai struktur di atas.

## Catatan Implementasi
- Like/Dislike: bersifat saling eksklusif per pengguna. Implementasi memanfaatkan transaksi Firestore, dengan fallback `localStorage` saat kredensial Firebase absen.
- Inisialisasi post baru menyertakan counter `likes`/`dislikes` dan daftar user terkait agar konsisten dengan aturan.
- Notifikasi menggunakan listener real‑time agar ikon lonceng menampilkan jumlah belum dibaca.
