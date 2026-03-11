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
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminPostList } from "./pages/admin/AdminPostList";
import { AdminPostEditor } from "./pages/admin/AdminPostEditor";
import { AdminCategoryManager } from "./pages/admin/AdminCategoryManager";
import { AdminTagManager } from "./pages/admin/AdminTagManager";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { ThemeProvider } from "./hooks/useTheme";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
}

const PublicWrap = ({ children }: { children: React.ReactNode }) => (
  <PublicLayout><>{children}</></PublicLayout>
);

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
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
          </Route>
        </Routes>
      </Router>
      </ThemeProvider>
    </HelmetProvider>
  );
}
