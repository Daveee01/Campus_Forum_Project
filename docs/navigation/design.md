# Panduan Desain — KampusConnect Forum

**Dokumentasi design system dan panduan visual untuk KampusConnect.**

---

## Design Philosophy

### Prinsip Desain

1. **Clarity (Kejelasan)**: UI harus jelas dan mudah dipahami mahasiswa tanpa perlu panduan panjang.
2. **Focus (Fokus)**: prioritaskan konten (post/komentar) dan minimalkan distraksi visual.
3. **Consistency (Konsistensi)**: gunakan pattern UI yang sama di seluruh aplikasi (button style, spacing, typography).
4. **Accessibility (Aksesibilitas)**: pastikan kontras warna memenuhi WCAG AA (minimal 4.5:1 untuk teks).
5. **Performance**: hindari animasi berat atau asset besar yang memperlambat loading.

### Target Audience

- **Mahasiswa**: usia 18-25 tahun, familiar dengan UI modern (Instagram, Twitter, Reddit).
- **Device**: mayoritas mobile (responsive design prioritas), tapi desktop juga penting untuk typing diskusi panjang.
- **Context**: digunakan untuk belajar, bertanya, dan diskusi — maka UI harus kondusif untuk fokus dan baca/tulis teks.

---

## Color Palette

### Primary Colors

- **Background Utama**: `#0f172a` (Slate 950) — hitam lembut, tidak pure black supaya tidak terlalu kontras.
- **Background Secondary**: `#1e293b` (Slate 900) — untuk card, modal, sidebar.
- **Accent Blue (Primary)**: `#2563eb` (Blue 600) — untuk CTA button, link, badge.
- **Accent Blue Hover**: `#1d4ed8` (Blue 700) — hover state untuk button/link.

### Text Colors

- **Teks Utama**: `#ffffff` (White) — judul, body post, nama user.
- **Teks Sekunder**: `#94a3b8` (Slate 400) — metadata (timestamp, kategori, hint text).
- **Teks Tersier**: `#64748b` (Slate 500) — placeholder, disabled text.

### Border & Divider

- **Border Utama**: `#334155` (Slate 700) — border card, input field.
- **Border Subtle**: `#1e293b` (Slate 800) — divider antar section.

### Semantic Colors

- **Success**: `#10b981` (Green 500) — notifikasi sukses, status online.
- **Warning**: `#f59e0b` (Amber 500) — peringatan, pending state.
- **Error**: `#ef4444` (Red 500) — error message, delete action.

### Gradients

- **Logo Gradient**: Linear dari `#0ea5e9` (Sky 500) ke `#2563eb` (Blue 600) — digunakan di logo KampusConnect.

---

## Typography

### Font Family

- **Primary**: System font stack (Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif) — cepat load, native feel.
- **Monospace** (untuk code): `ui-monospace, Menlo, Consolas, monospace`.

### Font Sizes

| Element               | Size (px) | Tailwind Class | Usage                          |
|-----------------------|-----------|----------------|--------------------------------|
| H1 (Page Title)       | 32        | `text-3xl`     | Halaman utama (jarang dipakai) |
| H2 (Section Title)    | 24        | `text-2xl`     | Judul section ("Komentar", "Data Mahasiswa") |
| H3 (Post Title)       | 18-20     | `text-lg`      | Judul post di feed & detail    |
| Body                  | 14        | `text-sm`      | Konten post, komentar, form    |
| Caption / Metadata    | 12        | `text-xs`      | Timestamp, kategori, hint      |
| Button Text           | 14        | `text-sm`      | Label tombol                   |

### Font Weights

- **Regular (400)**: body text, paragraph.
- **Medium (500)**: label, sub-heading.
- **Semibold (600)**: button, post author name.
- **Bold (700)**: page title, section heading.

### Line Height

- **Tight (`leading-tight`)**: untuk heading (1.25).
- **Normal (`leading-normal`)**: untuk body text (1.5).
- **Relaxed (`leading-relaxed`)**: untuk paragraph panjang di content post (1.625).

---

## Spacing & Layout

### Spacing Scale (Tailwind)

- **xs**: `gap-1` (4px) — spacing antar icon dan text dalam button.
- **sm**: `gap-2` (8px) — spacing antar elemen kecil (badge, tag).
- **md**: `gap-4` (16px) — spacing antar section dalam card.
- **lg**: `gap-6` (24px) — spacing antar card di feed.
- **xl**: `gap-8` (32px) — spacing antar major section (header, content, footer).

### Container Width

- **Max Width Feed**: `max-w-7xl` (1280px) — lebar maksimal container utama.
- **Max Width Modal**: `max-w-md` (448px) — lebar modal login/register.
- **Padding Horizontal**: `px-4` (16px) mobile, `px-6` (24px) desktop — padding kiri-kanan container.

### Grid Layout

- **Home Page**: `grid-cols-1 lg:grid-cols-4` — mobile 1 kolom, desktop 4 kolom (feed 3 kolom + sidebar 1 kolom).
- **Profile Data**: `grid-cols-2` — dua kolom untuk field data mahasiswa (responsive: 1 kolom di mobile jika perlu).

---

## Components

### 1. Header

**File**: `src/components/Header.tsx`

- **Background**: `bg-slate-950/95` dengan `backdrop-blur-sm` (semi-transparent blur).
- **Height**: `py-4` (~64px total dengan padding).
- **Border**: `border-b border-slate-800/50`.
- **Logo**: SVG inline, rounded square gradient dengan teks "KampusConnect" / "Forum Mahasiswa".
- **Buttons**:
  - Login: `bg-blue-600 hover:bg-blue-700`, `px-4 py-2`, rounded.
  - Buat Post: sama dengan Login, tambah icon `IconPlus`.
  - Avatar: `w-10 h-10`, circular, bg blue-600.

**Design Notes**:
- Sticky header (`sticky top-0 z-40`) agar selalu terlihat saat scroll.
- Shadow: `shadow-lg shadow-slate-950/20` untuk elevasi.

### 2. Post Card (Feed)

**File**: `src/components/PostList.tsx`

- **Background**: `bg-slate-900/50`, hover `bg-slate-900`.
- **Border**: `border border-slate-800/60`, hover `border-slate-700`.
- **Padding**: `p-5`.
- **Hover Effect**: `hover:shadow-lg hover:shadow-slate-900/50` (elevasi saat hover).
- **Layout**:
  - Vote sidebar kiri (desktop only, hidden di mobile): icon upvote/downvote + score.
  - Content kanan: badge tipe post (Pertanyaan/Diskusi/Project), badge kategori, judul post, preview konten (line-clamp-2), metadata footer.
- **Badge**:
  - Tipe post: `bg-blue-500/10 text-blue-400`, `px-2.5 py-1`, `text-xs`, rounded.
  - Kategori: `bg-slate-800/70 text-gray-300`, same size.

**Design Notes**:
- Judul post: `text-white font-semibold hover:text-blue-400` (interaktif).
- Preview konten: `text-gray-400 text-sm line-clamp-2` (truncate 2 lines).
- Footer: `border-t border-slate-800/50 pt-3` (divider subtle di atas metadata).

### 3. Auth Modal

**File**: `src/components/AuthModal.tsx`

- **Overlay**: `bg-black/80` (semi-transparent backdrop).
- **Modal Box**: `bg-slate-900 border border-slate-800 rounded-lg`, `max-w-md`.
- **Tab Buttons**: Login/Register — active tab `bg-blue-600 text-white`, inactive `bg-slate-800 text-gray-400`.
- **Form Inputs**:
  - Background: `bg-slate-800`.
  - Border: `border-slate-700`, focus `focus:border-blue-500`.
  - Text: `text-white`, placeholder `placeholder-gray-500`.
- **Submit Button**: `bg-blue-600 hover:bg-blue-700`, `w-full`, `py-2.5`.

**Design Notes**:
- Modal muncul dengan smooth fade-in animation (CSS `transition-opacity`).
- Close button (X) di pojok kanan atas: `text-gray-400 hover:text-white`.

### 4. Comments Section

**File**: `src/components/Comments.tsx`

- **Container**: `bg-slate-900 border border-slate-800 rounded-lg p-6`.
- **Comment Item**:
  - Avatar: `w-8 h-8`, circular, bg blue-600 dengan initial.
  - Author name: `text-white text-sm font-medium`.
  - Timestamp: `text-gray-500 text-xs`.
  - Content: `text-gray-300 text-sm`, `whitespace-pre-wrap` (preserve line breaks).
  - Divider: `border-b border-slate-700` kecuali comment terakhir.
- **Form Textarea**:
  - Background: `bg-slate-800`.
  - Border: `border-slate-700`, focus `focus:border-blue-500`.
  - Rows: 3.
  - Placeholder: "Bagikan pemikiran Anda...".

**Design Notes**:
- Jika belum login, tampilkan pesan di box: `bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-gray-400 text-center`.
- Button Kirim: `bg-blue-600 hover:bg-blue-700`, disabled state `opacity-50`.

### 5. Profile Page

**File**: `src/pages/Profile.tsx`

- **Avatar**: `w-24 h-24`, circular, `border-2 border-blue-600`.
- **Upload Button** (saat edit): `text-blue-400 hover:text-blue-300`, trigger file input (hidden).
- **Edit Mode**:
  - Input fields: same style dengan Auth Modal.
  - Save button: `bg-blue-600 hover:bg-blue-700`.
  - Cancel button: `bg-slate-700 hover:bg-slate-600`.
- **Data Grid**: 2 kolom, spacing `gap-4`.

**Design Notes**:
- Label field: `text-gray-400 text-sm`.
- Value field: `text-white font-medium`.

### 6. Buttons

**Primary Button (CTA)**:
```css
bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors px-4 py-2 text-sm
```

**Secondary Button**:
```css
bg-slate-700 hover:bg-slate-600 text-white font-medium rounded transition-colors px-4 py-2 text-sm
```

**Destructive Button** (untuk delete/logout):
```css
bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors px-4 py-2 text-sm
```

**Ghost Button** (link-like):
```css
text-blue-400 hover:text-blue-300 font-medium text-sm
```

### 7. Icons

**File**: `src/components/Icons.tsx`

- Semua icon adalah inline SVG (tidak pakai icon font atau library berat).
- Size default: `w-5 h-5` (20px).
- Warna: inherit dari parent (text color).
- Contoh icon: IconPlus, IconUser, IconLogin, IconLogout, IconUpvote, IconDownvote.

**Design Notes**:
- Jangan pakai emoji di UI (❌ 👍 ⬆️) — gunakan SVG icon yang lebih profesional dan konsisten.
- Icon harus simple, outline-based (bukan filled), agar cocok dengan dark theme.

### 8. Logo

**File**: `src/components/Logo.tsx`

- **Compact Variant**: hanya icon (rounded square gradient + 3 garis putih) — untuk mobile/space terbatas.
- **Full Variant**: icon + teks "KampusConnect" / "Forum Mahasiswa" — untuk desktop.
- Gradient: `#0ea5e9` → `#2563eb`.
- Teks: bold, putih untuk title, slate-400 untuk subtitle.

---

## Responsive Design

### Breakpoints (Tailwind)

- **sm**: 640px — tablet portrait.
- **md**: 768px — tablet landscape.
- **lg**: 1024px — desktop small.
- **xl**: 1280px — desktop large.

### Mobile First Approach

- Default style untuk mobile (320px+).
- Tambahkan `lg:` prefix untuk override desktop.

### Key Responsive Patterns

1. **Header**: logo kompak di mobile, full di desktop.
2. **Feed Layout**: 1 kolom mobile, 4 kolom (3+1 sidebar) desktop.
3. **Vote Sidebar**: hidden di mobile (`hidden sm:flex`), visible di desktop.
4. **Form**: full width mobile, max-width terbatas desktop.
5. **Modal**: full screen mobile (`inset-0`), centered box desktop.

---

## Animation & Transitions

### Prinsip Animasi

- **Subtle**: animasi harus halus dan tidak mengganggu.
- **Fast**: durasi 200-300ms (tidak terlalu lambat).
- **Purpose**: animasi hanya untuk feedback interaksi (hover, focus, modal open).

### Transitions

- **Button hover**: `transition-colors` (200ms default).
- **Card hover**: `transition-all duration-200` (border + shadow).
- **Modal open**: fade-in + zoom-in (`animate-in fade-in zoom-in-95 duration-200`).
- **Loading spinner**: `animate-spin` (CSS keyframe).

### Loading States

- **Spinner**: circular border animation, blue-600 dengan transparent top.
- **Skeleton**: tidak digunakan saat ini, tapi bisa ditambahkan untuk feed loading.

---

## Accessibility

### Contrast Ratio

- **Teks putih (#ffffff) di bg slate-900 (#1e293b)**: contrast ~15:1 ✅ (WCAG AAA).
- **Teks gray-400 (#94a3b8) di bg slate-900**: contrast ~5:1 ✅ (WCAG AA).
- **Button blue-600 (#2563eb) dengan teks putih**: contrast ~8:1 ✅.

### Keyboard Navigation

- Semua button/link bisa diakses via keyboard (Tab, Enter/Space).
- Focus state: `focus:outline-none focus:border-blue-500` (visual indicator).
- Modal: focus trap (user tidak bisa Tab keluar modal tanpa close).

### Screen Reader

- Button icon-only: tambahkan `aria-label` (contoh: `aria-label="User menu"`).
- Form input: label tersembunyi atau `aria-label` untuk accessibility.
- Loading state: tambahkan `aria-live="polite"` untuk announce perubahan.

---

## Design Assets

### Logo

- **Format**: SVG inline (sudah ada di `src/components/Logo.tsx`).
- **Export**: jika perlu PNG/JPG untuk marketing, export dari Figma/Illustrator dengan resolusi 2x (retina).

### Icons

- **Source**: custom SVG atau dari Heroicons (outline variant).
- **Size**: 20x20px atau 24x24px.
- **Stroke width**: 1.5-2px.

### Avatars

- **Placeholder**: Dicebear API (`https://api.dicebear.com/7.x/avataaars/svg?seed=...`).
- **User Upload**: convert ke data URL atau Firebase Storage URL.

---

## Figma / Design Handoff

### Component Library (Rekomendasi)

Buat Figma component library dengan:
- Button variants (primary, secondary, destructive, ghost).
- Input field (default, focus, error, disabled).
- Card layout (post card, comment card, profile card).
- Modal (auth, confirmation).
- Color palette tokens.
- Typography scale.

### Handoff ke Developer

- Export CSS dari Figma (atau gunakan Tailwind config matching).
- Berikan spacing/padding exact dalam px.
- Screenshot hover/focus states.
- Annotate responsive behavior (mobile vs desktop layout).

---

## Future Enhancements

- [ ] Light mode (toggle theme): tambahkan color palette versi light.
- [ ] Custom theme picker: user bisa pilih accent color (biru/hijau/ungu).
- [ ] Ilustrasi empty state: tambahkan SVG illustration saat feed kosong.
- [ ] Micro-interactions: ripple effect pada button click, toast notification slide-in.
- [ ] Advanced typography: code syntax highlighting untuk code block di post content.

---

## Kontak Design Team

Untuk feedback desain atau request perubahan visual, hubungi tim design atau buat issue dengan label `design` di repository.

---

**Keep it clean, keep it simple. 🎨**
