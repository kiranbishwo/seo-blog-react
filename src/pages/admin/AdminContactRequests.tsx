import { useEffect, useState } from "react";
import { Inbox, Mail, Calendar } from "lucide-react";

const fetchOpts: RequestInit = { credentials: "include" };

interface ContactRequest {
  id: number;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { dateStyle: "medium" }) + " " + d.toLocaleTimeString(undefined, { timeStyle: "short" });
  } catch {
    return iso;
  }
}

export function AdminContactRequests() {
  const [list, setList] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/contact-requests", fetchOpts)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 401 ? "Not authenticated" : res.status === 403 ? "Forbidden" : `HTTP ${res.status}`);
        return res.json();
      })
      .then(setList)
      .catch((err) => setError(err?.message || "Failed to load contact requests"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">Contact requests</h1>
        <div className="text-zinc-500">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-zinc-900 mb-6">Contact requests</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Inbox size={28} className="text-[var(--site-primary)]" />
        <h1 className="text-2xl font-bold text-zinc-900">Contact requests</h1>
      </div>
      <p className="text-zinc-600 mb-6">Submissions from the public contact form at /contact.</p>

      {list.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-12 text-center text-zinc-500">
          <Mail size={48} className="mx-auto mb-3 opacity-50" />
          <p>No contact requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((req) => (
            <div
              key={req.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm hover:border-zinc-300 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div className="font-medium text-zinc-900">{req.name}</div>
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                  <Calendar size={14} />
                  {formatDate(req.createdAt)}
                </div>
              </div>
              <a href={`mailto:${req.email}`} className="text-sm text-[var(--site-primary)] hover:underline">
                {req.email}
              </a>
              <p className="mt-2 text-zinc-700 text-sm whitespace-pre-wrap">{req.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
