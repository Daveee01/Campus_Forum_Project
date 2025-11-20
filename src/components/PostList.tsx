// PostList: renders a list of posts in the feed
// - Each post shows type, category, title, preview and stats
// - Designed to be simple and easy to read for students
import { Link } from 'react-router-dom';

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
};

const POST_TYPE_META: Record<string, { label: string }> = {
  ask: { label: 'Pertanyaan' },
  discussion: { label: 'Diskusi' },
  project: { label: 'Project' }
};

export default function PostList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4">
      {posts.map(post => {
        const postTypeInfo = POST_TYPE_META[post.type || 'ask'];

        return (
          <li key={post.id} className="list-none">
              <Link to={`/post/${post.id}`} className="block">
              <div className="bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 hover:border-slate-700 rounded-lg p-5 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/50 cursor-pointer">
                <div className="flex gap-4">
                  {/* Vote sidebar (like Reddit) */}
                  <div className="hidden sm:flex flex-col items-center gap-2 text-gray-500 text-xs min-w-fit pt-1">
                    {/* Tombol upvote/downvote sederhana — bisa diganti dengan logic upvote nyata */}
                    <button className="hover:text-blue-400 transition-colors hover:scale-110">▲</button>
                    <span className="font-semibold text-gray-400 w-6 text-center">{post.upvotes || 0}</span>
                    <button className="hover:text-blue-400 transition-colors hover:scale-110">▼</button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Type & Category */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="inline-block text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                        {postTypeInfo.label}
                      </span>
                      <span className="inline-block text-xs px-2.5 py-1 bg-slate-800/70 text-gray-300 rounded">
                        {post.topic || 'General'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-semibold hover:text-blue-400 transition-colors text-base mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Preview */}
                    <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{post.content}</p>

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-slate-800/50 pt-3">
                      <span className="font-medium text-gray-400">{post.authorName || 'Anonymous'}</span>
                      {post.replies ? <span className="text-gray-500">{post.replies} balasan</span> : null}
                      <time className="text-gray-600">{new Date(post.createdAt || Date.now()).toLocaleDateString('id-ID')}</time>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </div>
  );
}
