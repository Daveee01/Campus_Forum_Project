// PostDetail page: shows a single post with full content and comments.
// - Loads the post by id and allows simple interactions like upvote
// - Renders `Comments` component below the post body
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPostById, likePost, dislikePost, updatePost, deletePost, getCurrentUser, onAuthChange } from '../lib/firebase';
import Comments from '../components/Comments';
import { IconEdit, IconTrash } from '../components/Icons';

const POST_TYPE_META: Record<string, { label: string }> = {
  ask: { label: 'Pertanyaan' },
  discussion: { label: 'Diskusi' },
  project: { label: 'Project' }
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  // Track user's like/dislike status locally for immediate UI feedback
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [authUser, setAuthUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');   
  const [editContent, setEditContent] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editType, setEditType] = useState<'ask' | 'discussion' | 'project'>('ask');

  useEffect(() => {
    if (!postId) return;
    // Ambil data post berdasarkan postId. Jika menggunakan Firestore, helper akan fetch dari DB.
    fetchPostById(postId).then((p) => setPost(p)).finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    const current = getCurrentUser();
    setAuthUser(current);
    const unsub = onAuthChange((u) => setAuthUser(u));
    return () => unsub && unsub();
  }, []);

  // Initialize liked/disliked state when post loaded and user available
  useEffect(() => {
    if (post && authUser) {
      const likesArr: string[] = post.likesUserIds || [];
      const dislikesArr: string[] = post.dislikesUserIds || [];
      setLiked(likesArr.includes(authUser.uid));
      setDisliked(dislikesArr.includes(authUser.uid));
    }
  }, [post, authUser]);

  const handleLike = async () => {
    if (!postId || !authUser) return;
    const success = await likePost(postId, authUser.uid);
    // Optimistic UI update
    const likesArr: string[] = post.likesUserIds || [];
    const dislikesArr: string[] = post.dislikesUserIds || [];
    const hasLiked = likesArr.includes(authUser.uid);
    const hasDisliked = dislikesArr.includes(authUser.uid);
    let newLikes = likesArr;
    let newDislikes = dislikesArr;
    if (hasLiked) {
      newLikes = likesArr.filter(id => id !== authUser.uid);
      setLiked(false);
    } else {
      newLikes = [...likesArr, authUser.uid];
      setLiked(true);
      if (hasDisliked) {
        newDislikes = dislikesArr.filter(id => id !== authUser.uid);
        setDisliked(false);
      }
    }
    if (success) {
      setPost({ ...post, likesUserIds: newLikes, dislikesUserIds: newDislikes, likes: newLikes.length, dislikes: newDislikes.length });
    } else {
      alert('Gagal melakukan like. Cek koneksi atau rules Firestore.');
    }
  };

  const handleDislike = async () => {
    if (!postId || !authUser) return;
    const success = await dislikePost(postId, authUser.uid);
    const likesArr: string[] = post.likesUserIds || [];
    const dislikesArr: string[] = post.dislikesUserIds || [];
    const hasLiked = likesArr.includes(authUser.uid);
    const hasDisliked = dislikesArr.includes(authUser.uid);
    let newLikes = likesArr;
    let newDislikes = dislikesArr;
    if (hasDisliked) {
      newDislikes = dislikesArr.filter(id => id !== authUser.uid);
      setDisliked(false);
    } else {
      newDislikes = [...dislikesArr, authUser.uid];
      setDisliked(true);
      if (hasLiked) {
        newLikes = likesArr.filter(id => id !== authUser.uid);
        setLiked(false);
      }
    }
    if (success) {
      setPost({ ...post, likesUserIds: newLikes, dislikesUserIds: newDislikes, likes: newLikes.length, dislikes: newDislikes.length });
    } else {
      alert('Gagal melakukan dislike. Cek koneksi atau rules Firestore.');
    }
  };

  const startEdit = () => {
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditTopic(post.topic || 'General');
    setEditType(post.type || 'ask');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postId || !editTitle.trim() || !editContent.trim()) return;
    setLoading(true);
    try {
      await updatePost(postId, {
        title: editTitle,
        content: editContent,
        topic: editTopic,
        type: editType
      });
      setPost({ ...post, title: editTitle, content: editContent, topic: editTopic, type: editType });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating post:', err);
      alert('Gagal mengupdate post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!postId || !confirm('Yakin ingin menghapus post ini? Semua komentar juga akan terhapus.')) return;
    setLoading(true);
    try {
      await deletePost(postId);
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Gagal menghapus post');
      setLoading(false);
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

  const isOwner = authUser && post && authUser.uid === post.authorId;

  return (
    <div className="max-w-3xl">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-6">
        ← Kembali
      </Link>

      {/* Post */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 mb-6">
        {isEditing ? (
          <form onSubmit={handleUpdatePost}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Judul</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipe</label>
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as any)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white"
              >
                <option value="ask">Pertanyaan</option>
                <option value="discussion">Diskusi</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Topik</label>
              <select
                value={editTopic}
                onChange={(e) => setEditTopic(e.target.value)}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white"
              >
                <option value="General">General</option>
                <option value="Programming">Programming</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Mobile Dev">Mobile Dev</option>
                <option value="DevOps">DevOps</option>
                <option value="Career">Career</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">Konten</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                required
                rows={10}
                className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-blue-400">
                    {postTypeInfo.label}
                  </span>
                  <span className="text-xs px-2 py-1 bg-slate-800 text-gray-400 rounded">
                    {post.topic || 'General'}
                  </span>
                </div>
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startEdit}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                      title="Edit post"
                    >
                      <IconEdit size={18} />
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                      title="Hapus post"
                    >
                      <IconTrash size={18} />
                    </button>
                  </div>
                )}
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
                onClick={handleLike}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors ${liked ? 'bg-blue-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
              >
                👍 Like {post.likes || 0}
              </button>
              <button
                onClick={handleDislike}
                className={`px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors ${disliked ? 'bg-red-600 text-white' : 'bg-slate-800 text-gray-300 hover:bg-slate-700'}`}
              >
                👎 Dislike {post.dislikes || 0}
              </button>
              <span className="text-sm text-gray-500">{post.replies || 0} replies</span>
            </div>
          </>
        )}
      </div>

      {/* Comments */}
      {postId && <Comments postId={postId} />}
    </div>
  );
}

