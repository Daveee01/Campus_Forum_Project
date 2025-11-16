# KampusConnect — React + Firebase (Vite + TypeScript)
Quick start (PowerShell):
1. Install deps
```powershell
npm install
```
2. Add Firebase env (create `.env.local`) with:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```
3. Run dev server
```powershell
npm run dev
```
Notes:
- If you don't configure Firebase, the app falls back to storing demo posts in `localStorage`.
- Use `/seed` route to populate demo posts.
- Routes:
  - `/` home list
  - `/create` create post
  - `/t/:topic/:postId` post detail
  - `/profile/:userId` profile
  - `/seed` seed demo data
