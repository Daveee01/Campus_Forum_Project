# KampusConnect — React + Firebase (Vite + TypeScript)
Quick start (PowerShell):
1. Install deps
```powershell
npm install
```
Run dev server
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
