// Comments component: displays and posts comments for a given post id.
// - Requires authentication to post a comment (uses `getCurrentUser`)
// - Uses `addComment` and `fetchComments` from the firebase wrapper
import { useState, useEffect } from 'react';
import { getCurrentUser, addComment, fetchComments } from '../lib/firebase';

type CommentsProps = {
  postId: string;
};

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const user = getCurrentUser();

  useEffect(() => {
    fetchComments(postId).then(c => {
      setComments(c);
      setFetching(false);
    });
  }, [postId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      // Buat komentar baru dengan info author dari session saat ini
      const comment = await addComment(postId, {
        content: newComment,
        authorId: user.uid,
        authorName: user.username || user.fullname || user.email?.split('@')[0] || 'Anonymous',
        authorAvatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
      });
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (err) {
      alert('Gagal menambah komentar');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-6">Komentar ({comments.length})</h2>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm">
              {user.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
              rows={3}
              className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm resize-none"
              placeholder="Bagikan pemikiran Anda..."
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Memproses...' : 'Kirim'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 text-sm text-gray-400 text-center">
          Silahkan login untuk menambah komentar
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-sm">Belum ada komentar</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-4 border-b border-slate-700 last:border-b-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-xs">
                {comment.authorName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white text-sm">{comment.authorName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
