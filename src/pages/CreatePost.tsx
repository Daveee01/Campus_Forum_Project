// CreatePost page: form for authenticated users to create new posts.
// Fields: type, title, topic, content. On submit it calls `addPost` and redirects home.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPost, getCurrentUser, PostType } from '../lib/firebase';

const POST_TYPES = [
  { id: 'ask', label: 'Pertanyaan', color: 'blue' },
  { id: 'discussion', label: 'Diskusi', color: 'purple' },
  { id: 'project', label: 'Project', color: 'pink' }
];

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('General');
  const [postType, setPostType] = useState<PostType>('ask');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = getCurrentUser();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Silahkan login untuk membuat post</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    try {
      // Persiapkan data author dari sesi saat ini (bisa berasal dari Firebase atau localStorage)
      const authorId = user.uid || user.uid;
      const authorName = user.username || user.email || 'Anonymous';
      // Panggil helper addPost untuk menyimpan ke Firestore atau localStorage
      await addPost({ title, content, type: postType, topic, authorId, authorName });
      // Setelah sukses, kembalikan ke halaman utama
      navigate('/');
    } catch (err) {
      alert('Gagal membuat post');
    } finally {
      setLoading(false);
    }
  };

  const selectedPostType = POST_TYPES.find(t => t.id === postType);
  const colorClass = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/50',
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/50',
    pink: 'from-pink-500 to-pink-600 shadow-pink-500/50'
  }[selectedPostType?.color || 'blue'];

  return (
    <div>
      {user && (
        <div className="max-w-2xl">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-white mb-1">Buat Post Baru</h1>
            <p className="text-gray-400 text-sm mb-6">Bagikan pengetahuan, pertanyaan, atau project</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Jenis Post</label>
                <div className="grid grid-cols-3 gap-2">
                  {POST_TYPES.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setPostType(t.id as PostType)}
                      className={`p-3 rounded text-sm font-medium transition-colors ${
                        postType === t.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Judul</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Judul postingan..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-sm"
                >
                  <option>General</option>
                  <option>Programming</option>
                  <option>Design</option>
                  <option>Career</option>
                  <option>Life</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Konten</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
                  placeholder="Jelaskan detail postingan..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Memproses...' : 'Kirim'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
