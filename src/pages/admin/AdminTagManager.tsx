import { useEffect, useState } from "react";
import { Tag as TagIcon, Plus, Trash2 } from "lucide-react";
import { Tag } from "../../types";

export function AdminTagManager() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");

  useEffect(() => {
    fetch("/api/tags").then(res => res.json()).then(setTags);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, slug: newSlug })
    });
    if (res.ok) {
      const tag = await res.json();
      setTags([...tags, tag]);
      setNewName("");
      setNewSlug("");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    setTags(tags.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Tags</h1>
        <p className="text-zinc-500 text-sm">Manage keywords for your blog posts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 mb-2">Add New Tag</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/ /g, "-"));
                }}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus-ring-primary outline-none transition-all text-sm"
                placeholder="e.g. React"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Slug</label>
              <input
                type="text"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus-ring-primary outline-none transition-all text-sm font-mono"
                placeholder="react"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={18} />
              <span>Add Tag</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {tags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{tag.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500 font-mono">{tag.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(tag.id)}
                        className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
