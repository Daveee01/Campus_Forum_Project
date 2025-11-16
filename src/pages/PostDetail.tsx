// PostDetail page: shows a single post with full content and comments.
// - Loads the post by id and allows simple interactions like upvote
// - Renders `Comments` component below the post body
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostById, upvotePost } from '../lib/firebase';
import Comments from '../components/Comments';

const POST_TYPE_META: Record<string, { label: string }> = {
  ask: { label: 'Pertanyaan' },
  discussion: { label: 'Diskusi' },
  project: { label: 'Project' }
};

export default function PostDetail() {
  const { postId } = useParams();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    if (!postId) return;
    // Ambil data post berdasarkan postId. Jika menggunakan Firestore, helper akan fetch dari DB.
    fetchPostById(postId).then((p) => setPost(p)).finally(() => setLoading(false));
  }, [postId]);

  const handleUpvote = async () => {
    if (!postId || voted) return;
    try {
      await upvotePost(postId);
      // Sederhana: update state lokal agar UI segera berubah. Firestore sudah diupdate oleh helper.
      setPost({ ...post, upvotes: (post.upvotes || 0) + 1 });
      setVoted(true);
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  if (loading) return (
    <div className="text-center py-12">
      <div className="inline-block animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      <div className="text-gray-400 mt-4">Memuat...</div>
    </div>
  );

  if (!post) return (
    <div className="text-center py-12">
      <div className="text-3xl mb-2">Post tidak ditemukan</div>
      <Link to="/" className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors">
        Kembali
      </Link>
    </div>
  );

  const postTypeInfo = POST_TYPE_META[post.type || 'ask'] || POST_TYPE_META.ask;

  return (
    <div className="max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-6">
        ← Kembali
      </Link>

      {/* Post */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-blue-400">
              {postTypeInfo.label}
            </span>
            <span className="text-xs px-2 py-1 bg-slate-800 text-gray-400 rounded">
              {post.topic || 'General'}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
          <div className="text-sm text-gray-400">
            {post.authorName || 'Anonymous'} • {new Date(post.createdAt || Date.now()).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="text-gray-300 text-base whitespace-pre-wrap leading-relaxed mb-6 pb-6 border-b border-slate-700">
          {post.content}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleUpvote}
            disabled={voted}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              voted
                ? 'bg-green-600/20 text-green-400'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Upvote {post.upvotes || 0}
          </button>
          <span className="text-sm text-gray-500">{post.replies || 0} replies</span>
        </div>
      </div>

      {/* Comments */}
      {postId && <Comments postId={postId} />}
    </div>
  );
}

