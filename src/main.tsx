import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// --- TAMBAHKAN KODE INI UNTUK DEBUGGING ---
console.log("Membaca VITE_FIREBASE_PROJECT_ID:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
console.log("Membaca VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
// --------------------------------------------

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);