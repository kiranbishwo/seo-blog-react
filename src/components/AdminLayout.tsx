import { useState, useRef, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Layers, Tag, LogOut, ExternalLink, Users, Building2, ChevronDown, User } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../contexts/AuthContext";

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/admin/login");
  };

  const displayName = user?.name?.trim() || user?.email || "User";

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "All Posts", path: "/admin/posts", icon: FileText },
    { name: "Categories", path: "/admin/categories", icon: Layers },
    { name: "Tags", path: "/admin/tags", icon: Tag },
    ...(user?.role === "admin"
      ? [
          { name: "Teams", path: "/admin/teams", icon: Building2 },
          { name: "Users", path: "/admin/users", icon: Users },
        ]
      : []),
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white flex flex-col">
        <div className="flex h-16 items-center px-6 border-b border-zinc-100">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-zinc-900">Lumina Admin</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                )
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
          <Link
            to="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors mt-2"
          >
            <ExternalLink size={18} />
            <span>View Site</span>
          </Link>
        </nav>
      </aside>

      {/* Main: topbar + content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <header className="flex-shrink-0 h-16 px-6 flex items-center justify-between border-b border-zinc-200 bg-white">
          <div />
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-zinc-50 transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-medium">
                {user ? getInitials(user.name, user.email) : "?"}
              </div>
              <span className="text-sm font-medium text-zinc-900 max-w-[120px] truncate">{displayName}</span>
              <ChevronDown size={16} className={cn("text-zinc-500 transition-transform", dropdownOpen && "rotate-180")} />
            </button>
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-48 py-1 rounded-lg border border-zinc-200 bg-white shadow-lg z-10"
                role="menu"
              >
                <Link
                  to="/admin/profile"
                  role="menuitem"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content - full width */}
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
