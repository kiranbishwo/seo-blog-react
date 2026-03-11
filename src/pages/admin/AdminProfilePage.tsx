import { useAuth } from "../../contexts/AuthContext";

export function AdminProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Profile</h1>
        <p className="text-zinc-500 text-sm">Your account details.</p>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden max-w-xl">
        <dl className="divide-y divide-zinc-100">
          <div className="px-6 py-4">
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</dt>
            <dd className="mt-1 text-zinc-900">{user.name || "—"}</dd>
          </div>
          <div className="px-6 py-4">
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Email</dt>
            <dd className="mt-1 text-zinc-900">{user.email}</dd>
          </div>
          <div className="px-6 py-4">
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Team</dt>
            <dd className="mt-1 text-zinc-900">{user.team_name}</dd>
          </div>
          <div className="px-6 py-4">
            <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</dt>
            <dd className="mt-1">
              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${user.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-zinc-100 text-zinc-700"}`}>
                {user.role}
              </span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
