// Home page: main feed and category sidebar.
// Responsible for fetching posts (optionally filtered by type) and client-side category filtering.
import { useEffect, useState } from 'react';
import PostList from '../components/PostList';
import { fetchPosts, PostType } from '../lib/firebase';

const FILTER_TYPES = [
  { id: 'all', label: 'Semua' },
  { id: 'ask', label: 'Pertanyaan' },
  { id: 'discussion', label: 'Diskusi' },
  { id: 'project', label: 'Project' }
];

const CATEGORIES = [
  { name: 'General' },
  { name: 'Programming' },
  { name: 'Design' },
  { name: 'Career' },
  { name: 'Life' }
];

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | PostType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    const type = selectedFilter === 'all' ? undefined : (selectedFilter as PostType);
    fetchPosts(type).then((p: any[]) => {
      if (mounted) {
        // Filter by category if selected
        if (selectedCategory) {
          // Filter di client berdasarkan topic/kategori yang dipilih
          p = p.filter((post: any) => post.topic === selectedCategory);
        }
        setPosts(p);
      }
    }).finally(() => setLoading(false));
    return () => { mounted = false; };
  }, [selectedFilter, selectedCategory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Feed */}
      <div className="lg:col-span-3">
        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {FILTER_TYPES.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id as any)}
              className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === f.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <div className="text-gray-400 mt-4">Memuat postingan...</div>
          </div>
        ) : (
          <PostList posts={posts} />
        )}
      </div>

      {/* Sidebar */}
      <div className="hidden lg:block">
        {/* Categories */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
          <h3 className="text-white font-bold mb-3">📂 Kategori</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-slate-800'
              }`}
            >
              Semua
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`block w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
          <h3 className="text-white font-bold mb-2">ℹ️ Tentang</h3>
          <p className="text-gray-400 text-sm">
            Forum diskusi untuk mahasiswa berbagi ilmu, pertanyaan, dan project. Mari kolaborasi dan belajar bersama!
          </p>
        </div>
      </div>
    </div>
  );
}
