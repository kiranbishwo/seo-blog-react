import { useEffect, useState } from "react";
import { FileText, Layers, Tag, TrendingUp, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const [stats, setStats] = useState({ posts: 0, categories: 0, tags: 0 });

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(setStats);
  }, []);

  const cards = [
    { name: "Total Posts", value: stats.posts, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "Categories", value: stats.categories, icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Tags", value: stats.tags, icon: Tag, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Total Views", value: "1.2k", icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Dashboard Overview</h1>
        <Link 
          to="/admin/posts/new"
          className="flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-500 transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          <span>New Post</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.name} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-2 rounded-lg`}>
                <card.icon className={card.color} size={24} />
              </div>
            </div>
            <div className="text-2xl font-bold text-zinc-900">{card.value}</div>
            <div className="text-sm text-zinc-500">{card.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 text-sm">
                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500">
                  {i}
                </div>
                <div>
                  <p className="text-zinc-900 font-medium">New post published: "Building SEO Apps"</p>
                  <p className="text-zinc-500 text-xs">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
          <h3 className="font-bold text-zinc-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/categories" className="p-4 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors text-center">
              <Layers className="mx-auto mb-2 text-emerald-600" size={20} />
              <span className="text-sm font-medium">Add Category</span>
            </Link>
            <Link to="/admin/tags" className="p-4 rounded-lg border border-zinc-100 hover:bg-zinc-50 transition-colors text-center">
              <Tag className="mx-auto mb-2 text-purple-600" size={20} />
              <span className="text-sm font-medium">Add Tag</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
