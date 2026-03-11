import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { PublicLayout } from "./components/PublicLayout";
import { HomePage } from "./pages/HomePage";
import { BlogListingPage } from "./pages/BlogListingPage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { CategoryPage } from "./pages/CategoryPage";
import { TagPage } from "./pages/TagPage";
import { AuthorPage } from "./pages/AuthorPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminPostList } from "./pages/admin/AdminPostList";
import { AdminPostEditor } from "./pages/admin/AdminPostEditor";
import { AdminCategoryManager } from "./pages/admin/AdminCategoryManager";
import { AdminTagManager } from "./pages/admin/AdminTagManager";
import { AdminTeamManager } from "./pages/admin/AdminTeamManager";
import { AdminUserManager } from "./pages/admin/AdminUserManager";
import { AdminProfilePage } from "./pages/admin/AdminProfilePage";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500">Loading…</div>;
  return user ? <>{children}</> : <Navigate to="/admin/login" />;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500">Loading…</div>;
  if (!user || user.role !== "admin") return <Navigate to="/admin" />;
  return <>{children}</>;
}

const PublicWrap = ({ children }: { children: React.ReactNode }) => (
  <PublicLayout><>{children}</></PublicLayout>
);

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicWrap><HomePage /></PublicWrap>} />
            <Route path="/blog" element={<PublicWrap><BlogListingPage /></PublicWrap>} />
            <Route path="/blog/:slug" element={<PublicWrap><BlogDetailPage /></PublicWrap>} />
            <Route path="/category/:slug" element={<PublicWrap><CategoryPage /></PublicWrap>} />
            <Route path="/tag/:slug" element={<PublicWrap><TagPage /></PublicWrap>} />
            <Route path="/author/:username" element={<PublicWrap><AuthorPage /></PublicWrap>} />
            <Route path="/about" element={<PublicWrap><AboutPage /></PublicWrap>} />
            <Route path="/contact" element={<PublicWrap><ContactPage /></PublicWrap>} />

            {/* 404 - unknown routes */}
            <Route path="*" element={<PublicWrap><NotFoundPage /></PublicWrap>} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="posts" element={<AdminPostList />} />
            <Route path="posts/new" element={<AdminPostEditor />} />
            <Route path="posts/edit/:id" element={<AdminPostEditor />} />
            <Route path="categories" element={<AdminCategoryManager />} />
            <Route path="tags" element={<AdminTagManager />} />
            <Route path="teams" element={<RequireAdmin><AdminTeamManager /></RequireAdmin>} />
            <Route path="users" element={<RequireAdmin><AdminUserManager /></RequireAdmin>} />
            <Route path="profile" element={<AdminProfilePage />} />
          </Route>
        </Routes>
      </Router>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
