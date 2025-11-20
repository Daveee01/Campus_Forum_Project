# Panduan Programmer — KampusConnect Forum

**Dokumentasi teknis untuk developer yang mengembangkan dan maintain KampusConnect.**

---

## Arsitektur Aplikasi

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (dark theme dengan aksen biru)
- **Routing**: React Router v6
- **Backend**: Firebase (Authentication + Firestore) dengan fallback localStorage untuk development lokal
- **State Management**: React Hooks (useState, useEffect) — tidak pakai Redux/Context global kecuali diperlukan

### Struktur Folder

```
src/
├── App.tsx              # Root component, routing utama
├── main.tsx             # Entry point, render ke DOM
├── vite-env.d.ts        # Type declarations Vite
├── components/          # Komponen UI reusable
│   ├── AuthModal.tsx    # Modal login/register
│   ├── Comments.tsx     # Komponen daftar & form komentar
│   ├── Footer.tsx       # Footer aplikasi
│   ├── Header.tsx       # Navigation bar + auth state
│   ├── Icons.tsx        # Inline SVG icons
│   ├── Logo.tsx         # Logo aplikasi (SVG)
│   └── PostList.tsx     # Render list posting
├── lib/
│   └── firebase.ts      # Wrapper Firebase: auth, CRUD, realtime listeners
├── pages/               # Halaman aplikasi (routes)
│   ├── Home.tsx         # Feed utama + filter/kategori
│   ├── CreatePost.tsx   # Form buat post baru
│   ├── PostDetail.tsx   # Halaman detail post + comments
│   ├── Profile.tsx      # Halaman profil user (view/edit)
│   ├── Login.tsx        # (deprecated, gunakan AuthModal)
│   ├── Register.tsx     # (deprecated, gunakan AuthModal)
│   └── Seed.tsx         # Script seed data demo (opsional)
└── styles/
    └── index.css        # Global styles + Tailwind imports

public/
├── index.html           # HTML template
└── assets/
    └── logos/           # Folder untuk logo lokal (user upload)

docs/
└── navigation/          # Dokumentasi markdown
    ├── user.md          # Panduan user
    ├── programmer.md    # Panduan programmer (file ini)
    └── design.md        # Panduan desain
```

---

## Setup & Development

### 1. Clone & Install

```bash
git clone <repo-url>
cd "REACT + FIREBASE"
npm install
```

### 2. Konfigurasi Environment

Buat file `.env` di root project:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

**Catatan**: Jika `.env` tidak ada atau nilai kosong, aplikasi akan otomatis fallback ke localStorage (mode development lokal tanpa Firebase).

### 3. Run Dev Server

```bash
npm run dev
```

Buka browser di `http://localhost:5173` (atau port lain jika 5173 sudah terpakai).

### 4. Build Production

```bash
npm run build
npm run preview  # Preview build lokal
```

File hasil build ada di folder `dist/`.

---

## Firebase Helpers (`src/lib/firebase.ts`)

### Fitur Utama

File ini adalah **wrapper tunggal** untuk semua operasi backend:
- **Authentication**: register, login, logout, onAuthChange
- **Posts**: addPost, fetchPosts, subscribePosts (realtime), fetchPostById, upvotePost
- **Comments**: addComment, fetchComments, subscribeComments (realtime)
- **Users**: fetchUserById, updateUserProfile

### Mode Operasi

- **Firebase Mode**: jika `VITE_FIREBASE_API_KEY` ada, aplikasi menggunakan Firebase Auth + Firestore.
- **LocalStorage Mode**: jika env tidak ada, aplikasi fallback ke localStorage dengan key prefix `kampusconnect_v2`.

### Interface Penting

```typescript
export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  fullname?: string;
  major?: string;
  university?: string;
  year?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  createdAt?: string;
  followers?: number;
  following?: number;
  password?: string; // hanya untuk localStorage fallback
}

export type PostType = 'ask' | 'discussion' | 'project';
```

### Realtime Listeners

- `subscribePosts(callback)`: subscribe ke semua posts, panggil callback saat ada perubahan (Firebase onSnapshot atau localStorage read sekali).
- `subscribeComments(postId, callback)`: subscribe ke komentar suatu post.

**Penting**: listener ini mengembalikan fungsi unsubscribe. Pastikan dipanggil di `useEffect` dan cleanup di return:

```tsx
useEffect(() => {
  const unsub = subscribePosts(setPosts);
  return () => unsub();
}, []);
```

### Timestamp Normalization

Firestore `serverTimestamp()` menghasilkan Firestore Timestamp object. Wrapper kita otomatis konversi ke ISO string saat fetch/subscribe, jadi komponen bisa langsung pakai `new Date(item.createdAt)`.

---

## Komponen Utama

### Header (`src/components/Header.tsx`)

- Navigation bar dengan logo, tombol Login (jika belum login), atau avatar + menu (jika sudah login).
- Menggunakan `onAuthChange` untuk subscribe state auth secara realtime.
- Tombol "Buat Post" hanya muncul untuk user yang login.

### AuthModal (`src/components/AuthModal.tsx`)

- Single modal dengan tab Login/Register.
- Form registrasi menangkap semua data mahasiswa (fullname, major, university, year, phone).
- Memanggil `registerUser()` atau `loginUser()` dan menutup modal saat sukses.

### PostList (`src/components/PostList.tsx`)

- Render array posts sebagai card.
- Setiap card menampilkan: tipe post (badge), topik, judul, preview konten, author, upvotes, replies, timestamp.
- Sidebar vote (upvote/downvote) — fitur voting belum sepenuhnya aktif.

### Comments (`src/components/Comments.tsx`)

- Menampilkan list komentar untuk suatu post.
- Form tambah komentar (hanya untuk user login).
- Menggunakan `subscribeComments(postId, ...)` untuk realtime updates.
- Fallback: jika user profile tidak ditemukan di Firestore, komponen akan membuat lightweight profile dari auth user supaya tetap bisa berkomentar.

### Profile (`src/pages/Profile.tsx`)

- Halaman profil user: tampilkan data mahasiswa, avatar, bio, stats (posts/followers/following).
- Mode edit: user bisa ubah bio, data mahasiswa, dan foto profil.
- Upload foto: file dikonversi ke data URL (base64) dan disimpan di Firestore/localStorage. **Untuk produksi**, ganti dengan Firebase Storage upload.

---

## Firestore Schema

### Collection: `users`

```typescript
{
  uid: string,            // user ID dari Firebase Auth
  email: string,
  username: string,
  fullname: string,
  major: string,
  university: string,
  year: string,
  phone: string,
  avatar: string,         // URL atau data URL
  bio: string,
  createdAt: Timestamp,
  followers: number,
  following: number
}
```

### Collection: `posts`

```typescript
{
  title: string,
  content: string,
  type: 'ask' | 'discussion' | 'project',
  topic: string,          // kategori: General, Programming, dll.
  authorId: string,
  authorName: string,
  createdAt: Timestamp,
  upvotes: number,
  downvotes: number,
  replies: number,
  views: number
}
```

### Collection: `comments`

```typescript
{
  postId: string,
  content: string,
  authorId: string,
  authorName: string,
  authorAvatar: string,
  createdAt: Timestamp,
  upvotes: number
}
```

---

## Security Rules (Firestore)

Contoh minimal rules untuk development:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.uid;
    }

    match /posts/{postId} {
      allow read: if true;  // semua orang bisa baca
      allow create: if request.auth != null && request.resource.data.authorId == request.auth.uid;
      allow update: if request.auth != null && request.auth.uid == resource.data.authorId;
      allow delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }

    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null && request.resource.data.authorId == request.auth.uid;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.authorId;
    }
  }
}
```

**Untuk production**, tambahkan validasi field (contoh: panjang string, tipe data) dan rate limiting via Firebase App Check.

---

## Workflow Development

### Menambahkan Field Baru ke User Profile

1. Update interface `UserProfile` di `src/lib/firebase.ts`.
2. Update form registrasi di `src/components/AuthModal.tsx`.
3. Update halaman profil di `src/pages/Profile.tsx` (tampilan + form edit).
4. Update fungsi `registerUser()` dan `updateUserProfile()` di `src/lib/firebase.ts`.
5. Test di dev server, pastikan data tersimpan di Firestore/localStorage.

### Menambahkan Fitur Baru (contoh: Follow User)

1. Tambahkan fungsi helper di `src/lib/firebase.ts`: `followUser(targetUid)`, `unfollowUser(targetUid)`.
2. Update Firestore rules untuk allow write ke subcollection `followers`.
3. Tambahkan button Follow di `src/pages/Profile.tsx`.
4. Update state `user.followers` dan `user.following` setelah action.
5. (Opsional) buat listener realtime untuk follower count.

### Debugging

- **Console log**: cek DevTools Console untuk error/warning.
- **Firestore Console**: buka Firebase Console → Firestore untuk melihat dokumen dan query.
- **Network tab**: periksa request Firebase (auth, Firestore) untuk melihat status code dan payload.
- **LocalStorage fallback**: buka DevTools → Application → Local Storage untuk melihat key `kampusconnect_v2:*`.

### Testing

- **Manual testing**: registrasi user, buat post, tambah komentar, edit profil.
- **Multi-device**: buka aplikasi di 2 tab/browser berbeda, login sebagai user berbeda, test realtime updates.
- **Edge cases**: coba login dengan email salah, registrasi email duplikat, post tanpa isi, dll.

---

## Roadmap & TODO

- [ ] Implementasi Firebase Storage untuk upload foto profil (ganti data URL).
- [ ] Fitur search post (search bar di header).
- [ ] Fitur edit & delete post/comment.
- [ ] Fitur voting (upvote/downvote) dengan Firestore transaction.
- [ ] Pagination untuk feed post (infinite scroll atau numbered pages).
- [ ] Notifikasi (komentar baru, reply, dll.) via Firestore listeners.
- [ ] Follow/unfollow user.
- [ ] Private messages (DM).
- [ ] Moderasi: admin dashboard untuk hapus konten spam.
- [ ] Analytics: tracking views, engagement.
- [ ] SEO: meta tags, Open Graph untuk share link.

---

## Kontak & Kontribusi

Untuk perubahan besar atau fitur baru:
1. Buat issue di repository dengan deskripsi lengkap.
2. Fork repo, buat branch baru (`feature/nama-fitur`).
3. Develop & test di local.
4. Buat pull request dengan deskripsi dan screenshot.

Tim akan review dan merge jika sesuai standar.

---

**Happy coding! 🚀**
