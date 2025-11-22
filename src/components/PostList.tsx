// PostList: renders a list of posts in the feed
// - Each post shows type, category, title, preview and stats
// - Designed to be simple and easy to read for students
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCurrentUser, onAuthChange, deletePost, likePost, dislikePost } from '../lib/firebase';
import { IconEdit, IconTrash } from './Icons';

type Post = {
  id: string;
  title: string;
  topic?: string;
  content?: string;
  createdAt?: string;
  type?: 'ask' | 'discussion' | 'project';
  authorName?: string;
  upvotes?: number;
  replies?: number;
  likes?: number;
  dislikes?: number;
  likesUserIds?: string[];
  dislikesUserIds?: string[];
};

const POST_TYPE_META: Record<string, { label: string }> = {
  ask: { label: 'Pertanyaan' },
  discussion: { label: 'Diskusi' },
  project: { label: 'Project' }
};

export default function PostList({ posts, onPostDeleted }: { posts: Post[]; onPostDeleted?: (postId: string) => void }) {
  const [authUser, setAuthUser] = useState<any>(null);

  useEffect(() => {
    const current = getCurrentUser();
    setAuthUser(current);
    const unsub = onAuthChange((u) => setAuthUser(u));
    return () => unsub && unsub();
  }, []);

  const handleDelete = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Yakin ingin menghapus post ini? Semua komentar juga akan terhapus.')) return;
    try {
      await deletePost(postId);
      if (onPostDeleted) onPostDeleted(postId);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Gagal menghapus post');
    }
  };

  return (
    <div className="space-y-4">
      {posts.map(post => {
        const postTypeInfo = POST_TYPE_META[post.type || 'ask'];
        const isOwner = authUser && (post as any).authorId === authUser.uid;

        return (
          <li key={post.id} className="list-none">
            <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 rounded-lg p-5 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50 relative group">
              <Link to={`/post/${post.id}`} className="block">
                <div className="flex flex-col">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Type & Category */}
                    <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                          {postTypeInfo.label}
                        </span>
                        <span className="inline-block text-xs px-2.5 py-1 bg-slate-800/70 text-gray-300 rounded">
                          {post.topic || 'General'}
                        </span>
                      </div>
                      {isOwner && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.location.href = `/post/${post.id}`;
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                            title="Edit"
                          >
                            <IconEdit size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, post.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                            title="Hapus"
                          >
                            <IconTrash size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-semibold hover:text-blue-400 transition-colors text-base mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Preview */}
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{post.content}</p>

                    {/* Footer */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t border-slate-800/50 pt-3">
                      <Link 
                        to={`/profile/${(post as any).authorId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-medium text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {post.authorName || 'Anonymous'}
                      </Link>
                      {post.replies ? <span className="text-gray-500">{post.replies} balasan</span> : null}
                      <span className="text-gray-500">👍 {post.likes || 0} / 👎 {post.dislikes || 0}</span>
                      <time className="text-gray-600">{new Date(post.createdAt || Date.now()).toLocaleDateString('id-ID')}</time>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </li>
        );
      })}
    </div>
  );
}
