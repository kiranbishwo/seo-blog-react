import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, Image as ImageIcon } from "lucide-react";
import { Category, Post } from "../../types";

export function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featured_image: "https://picsum.photos/seed/blog/1200/630",
    category_id: "",
    is_published: false,
    reading_time: 5
  });

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(setCategories);

    if (isEdit) {
      fetch(`/api/admin/posts`)
        .then(res => res.json())
        .then(posts => {
          const post = posts.find((p: Post) => p.id === parseInt(id));
          if (post) {
            setFormData({
              title: post.title,
              slug: post.slug,
              content: post.content,
              excerpt: post.excerpt,
              featured_image: post.featured_image,
              category_id: post.category_id.toString(),
              is_published: !!post.is_published,
              reading_time: post.reading_time
            });
          }
        });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEdit ? `/api/admin/posts/${id}` : "/api/admin/posts";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        category_id: parseInt(formData.category_id)
      })
    });

    if (res.ok) {
      navigate("/admin/posts");
    } else {
      alert("Error saving post. Make sure the slug is unique.");
    }
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData({ ...formData, slug });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/admin/posts" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-zinc-900">
            {isEdit ? "Edit Post" : "Create New Post"}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900"
          >
            <Eye size={18} />
            <span>Preview</span>
          </button>
          <button 
            onClick={handleSubmit}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm font-medium"
          >
            <Save size={18} />
            <span>{isEdit ? "Update Post" : "Publish Post"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                onBlur={generateSlug}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-lg font-bold"
                placeholder="Enter post title..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-mono"
                placeholder="post-slug-url"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Content (Markdown)</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[400px] font-mono text-sm leading-relaxed"
                placeholder="# Start writing your story..."
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Publishing</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-3 text-sm font-medium text-zinc-700">
                  {formData.is_published ? "Published" : "Draft"}
                </span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Reading Time (min)</label>
              <input
                type="number"
                value={formData.reading_time}
                onChange={(e) => setFormData({ ...formData, reading_time: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Featured Image</h3>
            <div className="aspect-video bg-zinc-100 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-200 overflow-hidden relative group">
              {formData.featured_image ? (
                <img src={formData.featured_image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto text-zinc-400 mb-2" size={32} />
                  <span className="text-xs text-zinc-500">No image selected</span>
                </div>
              )}
            </div>
            <input
              type="text"
              value={formData.featured_image}
              onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-xs font-mono"
              placeholder="Image URL..."
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Excerpt</h3>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all min-h-[100px] text-sm leading-relaxed"
              placeholder="Brief summary of the post..."
              required
            />
          </div>
        </div>
      </form>
    </div>
  );
}
