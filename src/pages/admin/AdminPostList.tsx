import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Edit, Trash2, Eye, PlusCircle } from "lucide-react";
import { Post } from "../../types";
import { formatDate } from "../../lib/utils";

export function AdminPostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/posts", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE", credentials: "include" });
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">All Posts</h1>
          <p className="text-zinc-500 text-sm">Manage your blog articles and drafts.</p>
        </div>
        <Link 
          to="/admin/posts/new"
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          <span>New Post</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">Loading posts...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No posts found. Create your first post!</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900">{post.title}</div>
                    <div className="text-xs text-zinc-500">/{post.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{post.author_name ?? post.author_username ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.is_published 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-zinc-100 text-zinc-800"
                    }`}>
                      {post.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{post.category_name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-600">{formatDate(post.published_at)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link 
                      to={`/blog/${post.slug}`} 
                      target="_blank"
                      className="inline-flex p-2 text-zinc-400 hover:text-emerald-600 transition-colors"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link 
                      to={`/admin/posts/edit/${post.id}`}
                      className="inline-flex p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit size={18} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="inline-flex p-2 text-zinc-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
