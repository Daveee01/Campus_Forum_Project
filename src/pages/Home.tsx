// Home page: main feed and category sidebar.
// Responsible for fetching posts (optionally filtered by type) and client-side category filtering.
import { useEffect, useState } from 'react';
import PostList from '../components/PostList';
import { fetchPosts, subscribePosts, PostType } from '../lib/firebase';

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
    setLoading(true);
    const unsub = subscribePosts((p: any[]) => {
      // Apply client-side filters (type and category)
      let items = p;
      if (selectedFilter !== 'all') items = items.filter((post: any) => post.type === selectedFilter);
      if (selectedCategory) items = items.filter((post: any) => post.topic === selectedCategory);
      setPosts(items);
      setLoading(false);
    });
    return () => unsub && unsub();
  }, [selectedFilter, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3">
          {/* Filter Buttons */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-3 border-b border-slate-800">
            {FILTER_TYPES.map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id as any)}
                className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap transition-all ${
                  selectedFilter === f.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-slate-800/50 text-gray-300 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <div className="text-gray-400 mt-4 text-sm">Memuat postingan...</div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-lg">
            <div className="text-gray-400 text-lg font-medium">Belum ada postingan</div>
            <div className="text-gray-500 text-sm mt-2">Mulai diskusi dengan membuat postingan baru</div>
          </div>
        ) : (
          <PostList posts={posts} />
        )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-6">
          {/* Categories */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5 sticky top-24">
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Kategori</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`block w-full text-left px-3 py-2 rounded text-sm transition-all ${
                  selectedCategory === ''
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-gray-300 hover:bg-slate-800'
                }`}
              >
                Semua
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`block w-full text-left px-3 py-2 rounded text-sm transition-all ${
                    selectedCategory === cat.name
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : 'text-gray-300 hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
            <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-wider">Tentang Forum</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Forum diskusi untuk mahasiswa berbagi ilmu, pertanyaan, dan project. Mari kolaborasi dan belajar bersama!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
