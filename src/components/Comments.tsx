// Comments component: displays and posts comments for a given post id.
// - Requires authentication to post a comment (uses `getCurrentUser`)
// - Uses `addComment` and `fetchComments` from the firebase wrapper
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// 1. Impor 'fetchUserById' dan 'UserProfile'
import {
  getCurrentUser,
  addComment,
  updateComment,
  deleteComment,
  fetchUserById,
  subscribeComments,
  onAuthChange,
  hasFirebase,
  type UserProfile
} from '../lib/firebase';
import { IconEdit, IconTrash } from './Icons';

type CommentsProps = {
  postId: string;
};

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // useEffect: subscribe ke komentar secara realtime (atau fallback local)
  useEffect(() => {
    setFetching(true);
    const unsub = subscribeComments(postId, (c) => {
      setComments(c);
      setFetching(false);
    });
    return () => unsub();
  }, [postId]);

  // Auth listener: update authUser saat berubah dan load initial
  useEffect(() => {
    // Load current user immediately
    const current = getCurrentUser();
    console.log('Initial user:', current);
    setAuthUser(current);
    
    // Listen for auth changes
    const unsub = onAuthChange((u) => {
      console.log('Auth changed:', u);
      setAuthUser(u);
    });
    return () => unsub && unsub();
  }, []);

  // 3. useEffect BARU untuk mengambil data profil dari Firestore
  useEffect(() => {
    if (authUser) {
      // Create immediate fallback profile so user can comment right away
      const createFallback = () => ({
        uid: authUser.uid,
        email: authUser.email || '',
        username: authUser.displayName || (authUser.email ? authUser.email.split('@')[0] : `user${String(authUser.uid).slice(-4)}`),
        fullname: authUser.displayName || '',
        avatar: authUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}`,
      } as UserProfile);
      
      // Set fallback immediately
      setUserProfile(createFallback());
      
      // Then try to fetch real profile in background
      fetchUserById(authUser.uid)
        .then(profile => {
          if (profile) {
            setUserProfile(profile as UserProfile);
          }
        })
        .catch(err => {
          console.warn('Could not fetch user profile, using fallback:', err);
        });
    } else {
      setUserProfile(null); // Pastikan profil kosong jika logout
    }
  }, [authUser]); // Dijalankan setiap kali 'authUser' berubah

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authUser) return;

    setLoading(true);
    try {
      // Use userProfile if available, otherwise fallback to authUser data
      const authorName = userProfile?.username || userProfile?.fullname || authUser.email?.split('@')[0] || 'Anonymous';
      const authorAvatar = userProfile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.uid}`;
      
      console.log('Adding comment:', { postId, authorId: authUser.uid, authorName });
      
      const comment = await addComment(postId, {
        content: newComment,
        authorId: authUser.uid,
        authorName,
        authorAvatar
      });
      
      console.log('Comment added successfully:', comment);
      
      // If using Firebase, the realtime listener will update comments; for local fallback, update state immediately
      if (!hasFirebase) setComments([comment, ...comments]);
      setNewComment('');
    } catch (err: any) {
      console.error('Error adding comment:', err);
      const errorMsg = err?.message || err?.code || 'Gagal menambah komentar';
      alert(`Gagal menambah komentar: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      await updateComment(commentId, editContent);
      setEditingCommentId(null);
      setEditContent('');
      // Realtime listener will update, or for localStorage update state
      if (!hasFirebase) {
        setComments(comments.map(c => c.id === commentId ? { ...c, content: editContent } : c));
      }
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Gagal mengupdate komentar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Yakin ingin menghapus komentar ini?')) return;
    setLoading(true);
    try {
      await deleteComment(commentId, postId);
      // Realtime listener will update, or for localStorage update state
      if (!hasFirebase) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Gagal menghapus komentar');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditContent('');
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

      {/* Add Comment Form - ALWAYS show */}
      <div className="mb-6">
        {authUser ? (
          <form onSubmit={handleAddComment}>
            <div className="flex gap-3 mb-4">
              {userProfile?.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.username || 'User'} 
                  className="w-10 h-10 rounded-full flex-shrink-0 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-sm ${userProfile?.avatar ? 'hidden' : ''}`}>
                {userProfile?.username?.[0]?.toUpperCase() || authUser.email?.[0]?.toUpperCase() || 'U'}
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
          // Show login message if not logged in
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-sm text-center">
            <p className="text-gray-400 mb-3">Silahkan login untuk menambah komentar</p>
            <a href="/login" className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors">
              Login Sekarang
            </a>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center py-8 text-gray-500 text-sm">Belum ada komentar</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 pb-4 border-b border-slate-700 last:border-b-0">
              {comment.authorAvatar ? (
                <img 
                  src={comment.authorAvatar} 
                  alt={comment.authorName || 'User'} 
                  className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 text-xs ${comment.authorAvatar ? 'hidden' : ''}`}>
                {comment.authorName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${comment.authorId}`}
                      className="font-medium text-blue-400 hover:text-blue-300 hover:underline text-sm"
                      onClick={e => e.stopPropagation()}
                    >
                      {comment.authorName || 'Anonymous'}
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  {authUser && comment.authorId === authUser.uid && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(comment)}
                        className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        title="Edit"
                      >
                        <IconEdit size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                        title="Hapus"
                      >
                        <IconTrash size={14} />
                      </button>
                    </div>
                  )}
                </div>
                {editingCommentId === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-white text-sm resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        disabled={loading || !editContent.trim()}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors disabled:opacity-50"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}