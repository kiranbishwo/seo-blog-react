import { useEffect, useState } from "react";
import { Building2, Plus, Trash2 } from "lucide-react";

const fetchOpts: RequestInit = { credentials: "include" };

interface Team {
  id: number;
  name: string;
  slug: string;
}

export function AdminTeamManager() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/teams", fetchOpts)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Not authenticated" : res.status === 403 ? "Forbidden" : `HTTP ${res.status}`);
        return res.json();
      })
      .then(setTeams)
      .catch((err) => setError(err?.message || "Failed to load teams"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/teams", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, slug: newSlug }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setTeams([...teams, data]);
      setNewName("");
      setNewSlug("");
    } else {
      setError(data?.error || "Failed to add team");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? Remove all users from this team first.")) return;
    const res = await fetch(`/api/admin/teams/${id}`, { ...fetchOpts, method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setTeams(teams.filter((t) => t.id !== id));
    else setError(data?.error || "Failed to delete team");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Teams</h1>
        <p className="text-zinc-500 text-sm">Manage teams. Users belong to one team.</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-zinc-500 text-sm">Loading teams…</p>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-900 mb-2">Add New Team</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus-ring-primary outline-none transition-all text-sm"
                placeholder="e.g. Engineering"
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
                placeholder="engineering"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium"
            >
              <Plus size={18} />
              <span>Add Team</span>
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
                {teams.map((team) => (
                  <tr key={team.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-zinc-900">{team.name}</td>
                    <td className="px-6 py-4 text-sm text-zinc-500 font-mono">{team.slug}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(team.id)}
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
