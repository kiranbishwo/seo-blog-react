import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  Tag, 
  LogOut, 
  ExternalLink,
  PlusCircle
} from "lucide-react";
import { cn } from "../lib/utils";

export function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "All Posts", path: "/admin/posts", icon: FileText },
    { name: "Categories", path: "/admin/categories", icon: Layers },
    { name: "Tags", path: "/admin/tags", icon: Tag },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white">
        <div className="flex h-16 items-center px-6 border-b border-zinc-100">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="font-bold text-zinc-900">Lumina Admin</span>
          </Link>
        </div>
        
        <nav className="p-4 space-y-1">
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
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-100">
          <Link 
            to="/" 
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors mb-2"
          >
            <ExternalLink size={18} />
            <span>View Site</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
