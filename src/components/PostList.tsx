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
  if (!posts?.length) return (
    <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-lg">
      <div className="text-gray-400 text-lg">Belum ada postingan</div>
      <div className="text-gray-500 text-sm mt-2">Mulai diskusi dengan membuat postingan baru</div>
    </div>
  );

  return (
    <div className="space-y-3">
      {posts.map(post => {
        const postTypeInfo = POST_TYPE_META[post.type || 'ask'];

        return (
          <li key={post.id} className="list-none">
            <Link to={`/post/${post.id}`} className="block">
              <div className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg p-4 transition-colors cursor-pointer">
                <div className="flex gap-3">
                  {/* Vote sidebar (like Reddit) */}
                  <div className="hidden sm:flex flex-col items-center gap-1 text-gray-500 text-xs min-w-max">
                    {/* Tombol upvote/downvote sederhana — bisa diganti dengan logic upvote nyata */}
                    <button className="hover:text-blue-400 transition-colors">▲</button>
                    <span className="font-medium">{post.upvotes || 0}</span>
                    <button className="hover:text-blue-400 transition-colors">▼</button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Type & Category */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-medium text-blue-400">
                        {postTypeInfo.label}
                      </span>
                      <span className="text-xs px-2 py-1 bg-slate-800 text-gray-400 rounded">
                        {post.topic || 'General'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-semibold hover:text-blue-400 transition-colors text-base mb-2 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Preview */}
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{post.content}</p>

                    {/* Footer */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{post.authorName || 'Anonymous'}</span>
                      {post.replies ? <span>{post.replies} replies</span> : null}
                      <time>{new Date(post.createdAt || Date.now()).toLocaleDateString('id-ID')}</time>
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
