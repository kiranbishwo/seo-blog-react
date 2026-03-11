import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Save, Eye, Image as ImageIcon, Loader2, Check } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import { Category, Post } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

const AUTO_SAVE_DELAY_MS = 2500;
type SaveStatus = "idle" | "saving" | "saved" | "error";

export function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const hasUserEdited = useRef(false);
  const savedPostIdRef = useRef<number | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
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
      fetch(`/api/admin/posts`, { credentials: "include" })
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

  const performSave = async (): Promise<{ ok: boolean; id?: number }> => {
    const postId = id ? parseInt(id, 10) : savedPostIdRef.current;
    const isPut = !!(postId && !isNaN(postId));
    const url = isPut ? `/api/admin/posts/${postId}` : "/api/admin/posts";
    const method = isPut ? "PUT" : "POST";
    setSaveStatus("saving");
    try {
      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          category_id: formData.category_id ? parseInt(formData.category_id) : (categories[0]?.id ?? 0),
        }),
      });
      if (!res.ok) {
        setSaveStatus("error");
        return { ok: false };
      }
      const data = await res.json().catch(() => ({}));
      setSaveStatus("saved");
      if (method === "POST" && data.id != null) {
        savedPostIdRef.current = data.id;
        navigate(`/admin/posts/edit/${data.id}`, { replace: true });
        return { ok: true, id: data.id };
      }
      return { ok: true };
    } catch {
      setSaveStatus("error");
      return { ok: false };
    }
  };

  useEffect(() => {
    if (!hasUserEdited.current) return;
    const isNew = !id;
    if (isNew && !formData.title?.trim() && !formData.content?.trim()) return;
    if (isNew && !formData.category_id && categories.length > 0) return;
    const t = setTimeout(() => {
      performSave();
    }, AUTO_SAVE_DELAY_MS);
    return () => clearTimeout(t);
  }, [formData, id, categories.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await performSave();
    if (result.ok) {
      navigate("/admin/posts");
    } else {
      alert("Error saving post. Make sure the slug is unique.");
    }
  };

  const markEdited = () => {
    hasUserEdited.current = true;
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, slug }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        hasUserEdited.current = true;
        setFormData((prev) => ({ ...prev, featured_image: data.url }));
      } else {
        const msg = res.status === 404
          ? "Upload failed (404). Start the API with: npm run dev"
          : (data?.error || "Upload failed");
        alert(msg);
      }
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
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
          {saveStatus === "saving" && (
            <span className="flex items-center gap-1.5 text-sm text-zinc-500">
              <Loader2 size={16} className="animate-spin" />
              Saving…
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <Check size={16} />
              Saved
            </span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-600">Save failed</span>
          )}
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
                onChange={(e) => { markEdited(); setFormData((prev) => ({ ...prev, title: e.target.value })); }}
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
                onChange={(e) => { markEdited(); setFormData((prev) => ({ ...prev, slug: e.target.value })); }}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-mono"
                placeholder="post-slug-url"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Content (Markdown)</label>
              <div data-color-mode="light" className="rounded-lg overflow-hidden border border-zinc-200">
                <MDEditor
                  value={formData.content}
                  onChange={(val) => { markEdited(); setFormData((prev) => ({ ...prev, content: val ?? "" })); }}
                  height={400}
                  preview="live"
                  textareaProps={{ placeholder: "# Start writing your story..." }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Publishing</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Author <span className="text-red-500">*</span></label>
              <div className="w-full px-4 py-2 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-900 font-medium text-sm">
                {user?.name?.trim() || user?.email || "—"}
              </div>
              <p className="mt-1 text-xs text-zinc-500">This post will be published under your name (you are the author).</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.is_published}
                  onChange={(e) => { markEdited(); setFormData((prev) => ({ ...prev, is_published: e.target.checked })); }}
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
                onChange={(e) => { markEdited(); setFormData((prev) => ({ ...prev, category_id: e.target.value })); }}
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
                onChange={(e) => { markEdited(); setFormData((prev) => ({ ...prev, reading_time: parseInt(e.target.value) || 0 })); }}
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
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer flex items-center justify-center space-x-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <ImageIcon size={16} />
                <span>{uploadingImage ? "Uploading…" : "Upload image"}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploadingImage}
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-xs text-zinc-500">Or paste URL:</p>
            <input
              type="text"
              value={formData.featured_image}
              onChange={(e) => { markEdited(); setFormData((prev) => ({ ...prev, featured_image: e.target.value })); }}
              className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-xs font-mono"
              placeholder="https://..."
            />
          </div>

          <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 border-b border-zinc-100 pb-2">Excerpt</h3>
            <textarea
              value={formData.excerpt}
              onChange={(e) => { markEdited(); setFormData((prev) => ({ ...prev, excerpt: e.target.value })); }}
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
