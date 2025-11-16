import { useState } from 'react';
import { addPost, hasFirebase } from '../lib/firebase';

export default function Seed() {
  const [done, setDone] = useState(false);
  const [seeding, setSeeding] = useState(false);

  async function runSeed() {
    setSeeding(true);
    const demoPosts = [
      {
        title: 'Selamat datang di KampusConnect!',
        topic: 'General',
        content: 'Ini adalah demo forum diskusi mahasiswa. Silahkan eksplorasi fitur-fitur menarik dan bergabung dengan komunitas kami!',
        type: 'discussion' as const,
        authorId: 'system',
        authorName: 'KampusConnect Team'
      },
      {
        title: 'Bagaimana cara setup React dengan TypeScript?',
        topic: 'Programming',
        content: 'Saya ingin belajar React dengan TypeScript. Ada yang bisa kasih tutorial lengkap atau resources yang bagus? Makasih sebelumnya!',
        type: 'ask' as const,
        authorId: 'user1',
        authorName: 'AhmadDev'
      },
      {
        title: 'Diskusi: Best Practices untuk State Management di React',
        topic: 'Programming',
        content: 'Mari kita bahas berbagai cara mengelola state di React. Dari useState, useContext, Redux, hingga Zustand. Mana yang menurut kalian paling bagus?',
        type: 'discussion' as const,
        authorId: 'user2',
        authorName: 'SitiDeveloper'
      },
      {
        title: 'Project: Blog Platform dengan Next.js dan Notion API',
        topic: 'Project',
        content: 'Saya buat blog platform yang bisa fetch content dari Notion. Fiturnya: dark mode, search, categories, dan fast loading. Cek di GitHub saya!',
        type: 'project' as const,
        authorId: 'user3',
        authorName: 'BudiCreator'
      },
      {
        title: 'Gimana cara deal dengan imposter syndrome saat belajar coding?',
        topic: 'Career',
        content: 'Setiap kali belajar hal baru, saya merasa tidak cukup pintar dan kuatir tidak bisa. Ada tips gimana cara mindsetnya?',
        type: 'ask' as const,
        authorId: 'user4',
        authorName: 'RatnaStudent'
      },
      {
        title: 'Portfolio Review: Feedback untuk project saya?',
        topic: 'Career',
        content: 'Saya sudah buat beberapa project untuk portfolio. Minta review dan saran dari teman-teman di sini untuk improvement ke depannya.',
        type: 'discussion' as const,
        authorId: 'user5',
        authorName: 'IkranDev'
      },
      {
        title: 'Project: Mobile App Edukasi untuk Anak-Anak',
        topic: 'Project',
        content: 'Saya develop mobile app yang gamified learning untuk anak SD. Pakai React Native, ada animasi, reward system, dan parental control.',
        type: 'project' as const,
        authorId: 'user6',
        authorName: 'InnaInnovator'
      },
      {
        title: 'Tips interview di startup tech: apa saja yang ditanya?',
        topic: 'Career',
        content: 'Ada yang baru saja interview di startup tech? Share dong pengalaman dan pertanyaan yang ditanya. Helpful untuk persiapan teman-teman lain!',
        type: 'ask' as const,
        authorId: 'user7',
        authorName: 'FadiCoder'
      }
    ];

    for (const p of demoPosts) {
      try {
        await addPost(p);
        await new Promise(r => setTimeout(r, 300)); // Slight delay
      } catch (err) {
        console.error('Failed to seed post:', err);
      }
    }
    setSeeding(false);
    setDone(true);
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="backdrop-blur-md bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-4">Seed Demo Data</h1>
        
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6 text-blue-200 text-sm">
          {hasFirebase 
            ? 'Firebase connected — demo data akan disimpan ke Firestore' 
            : 'Firebase not configured — demo data akan disimpan ke localStorage'}
        </div>

        <div className="space-y-3 mb-6 text-gray-300">
          <p>Klik tombol di bawah untuk membuat 8 demo posts dengan berbagai post types:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Ask</strong> — Pertanyaan dari komunitas</li>
            <li><strong>Discussion</strong> — Diskusi open-ended</li>
            <li><strong>Project</strong> — Share project showcase</li>
          </ul>
        </div>

        <button
          onClick={runSeed}
          disabled={done || seeding}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-all text-white ${
            done
              ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
              : seeding
              ? 'bg-blue-500/50 animate-pulse'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-500/50'
          }`}
        >
          {done ? 'Seeding Complete!' : seeding ? 'Seeding...' : 'Run Seed'}
        </button>

        {done && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              Demo data berhasil dibuat! Refresh halaman untuk melihat posts baru di home feed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
