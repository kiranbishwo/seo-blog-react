import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";

const fetchOpts: RequestInit = { credentials: "include" };

interface Team {
  id: number;
  name: string;
  slug: string;
}

interface UserRow {
  id: number;
  email: string;
  name: string;
  team_id: number;
  team_name: string;
  role: "admin" | "member";
}

export function AdminUserManager() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    team_id: 0,
    role: "member" as "admin" | "member",
  });
  const [editForm, setEditForm] = useState({ name: "", team_id: 0, role: "member" as "admin" | "member", password: "" });

  const loadUsers = () =>
    fetch("/api/admin/users", fetchOpts)
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  const loadTeams = () =>
    fetch("/api/admin/teams", fetchOpts)
      .then((r) => r.json())
      .then((data) => {
        setTeams(data);
        return data as Team[];
      })
      .catch(() => []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadUsers(), loadTeams()])
      .then(([, teamList]) => {
        setError(null);
        if (Array.isArray(teamList) && teamList.length > 0) setForm((f) => ({ ...f, team_id: f.team_id || teamList[0].id }));
      })
      .catch((err) => setError(err?.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/users", {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        team_id: form.team_id,
        role: form.role,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setShowForm(false);
      setForm({ email: "", password: "", name: "", team_id: teams[0]?.id ?? 0, role: "member" });
      loadUsers();
    } else {
      setError(data?.error || "Failed to add user");
    }
  };

  const startEdit = (u: UserRow) => {
    setEditingId(u.id);
    setEditForm({ name: u.name || "", team_id: u.team_id, role: u.role, password: "" });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) return;
    setError(null);
    const body: { name?: string; team_id?: number; role?: string; password?: string } = {
      name: editForm.name,
      team_id: editForm.team_id,
      role: editForm.role,
    };
    if (editForm.password) body.password = editForm.password;
    const res = await fetch(`/api/admin/users/${editingId}`, {
      ...fetchOpts,
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setEditingId(null);
      loadUsers();
    } else {
      setError(data?.error || "Update failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { ...fetchOpts, method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) loadUsers();
    else setError(data?.error || "Delete failed");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Users</h1>
        <p className="text-zinc-500 text-sm">Manage users, teams, and roles (admin / member).</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-800 text-sm">
          {error}
        </div>
      )}

      {loading && <p className="text-zinc-500 text-sm">Loading…</p>}

      <div className="space-y-6">
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-lg font-medium"
          >
            <Plus size={18} />
            <span>Add User</span>
          </button>
        ) : (
          <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm space-y-4 max-w-md">
            <h3 className="font-bold text-zinc-900">New User</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Team</label>
              <select
                value={form.team_id}
                onChange={(e) => setForm((f) => ({ ...f, team_id: Number(e.target.value) }))}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-sm"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "admin" | "member" }))}
                className="w-full px-4 py-2 rounded-lg border border-zinc-200 text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary px-4 py-2 rounded-lg text-sm font-medium">
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-zinc-200 text-zinc-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-300">
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) =>
                editingId === u.id ? (
                  <tr key={u.id} className="bg-zinc-50">
                    <td colSpan={5} className="px-6 py-4">
                      <form onSubmit={handleEdit} className="flex flex-wrap gap-4 items-end">
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Name</label>
                          <input
                            value={editForm.name}
                            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                            className="px-3 py-1.5 rounded border border-zinc-200 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Team</label>
                          <select
                            value={editForm.team_id}
                            onChange={(e) => setEditForm((f) => ({ ...f, team_id: Number(e.target.value) }))}
                            className="px-3 py-1.5 rounded border border-zinc-200 text-sm"
                          >
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">Role</label>
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value as "admin" | "member" }))}
                            className="px-3 py-1.5 rounded border border-zinc-200 text-sm"
                          >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-zinc-500 mb-1">New password (optional)</label>
                          <input
                            type="password"
                            value={editForm.password}
                            onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                            className="px-3 py-1.5 rounded border border-zinc-200 text-sm"
                            placeholder="Leave blank to keep"
                          />
                        </div>
                        <button type="submit" className="btn-primary px-3 py-1.5 rounded text-sm">Save</button>
                        <button type="button" onClick={() => setEditingId(null)} className="bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded text-sm">Cancel</button>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={u.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-4 font-medium text-zinc-900">{u.email}</td>
                    <td className="px-6 py-4 text-zinc-600">{u.name || "—"}</td>
                    <td className="px-6 py-4 text-zinc-600">{u.team_name}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${u.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => startEdit(u)} className="p-2 text-zinc-400 hover:text-[var(--site-primary)] transition-colors">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
