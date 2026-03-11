import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Navbar, Footer } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { BlogListingPage } from "./pages/BlogListingPage";
import { BlogDetailPage } from "./pages/BlogDetailPage";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminPostList } from "./pages/admin/AdminPostList";
import { AdminPostEditor } from "./pages/admin/AdminPostEditor";
import { AdminCategoryManager } from "./pages/admin/AdminCategoryManager";
import { AdminTagManager } from "./pages/admin/AdminTagManager";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return isAdmin ? <>{children}</> : <Navigate to="/admin/login" />;
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <div className="min-h-screen flex flex-col bg-white selection:bg-emerald-100 selection:text-emerald-900">
              <Navbar />
              <main className="flex-grow"><HomePage /></main>
              <Footer />
            </div>
          } />
          <Route path="/blog" element={
            <div className="min-h-screen flex flex-col bg-white selection:bg-emerald-100 selection:text-emerald-900">
              <Navbar />
              <main className="flex-grow"><BlogListingPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/blog/:slug" element={
            <div className="min-h-screen flex flex-col bg-white selection:bg-emerald-100 selection:text-emerald-900">
              <Navbar />
              <main className="flex-grow"><BlogDetailPage /></main>
              <Footer />
            </div>
          } />
          <Route path="/about" element={
            <div className="min-h-screen flex flex-col bg-white selection:bg-emerald-100 selection:text-emerald-900">
              <Navbar />
              <main className="flex-grow"><div className="py-24 text-center">About Page Coming Soon</div></main>
              <Footer />
            </div>
          } />
          <Route path="/contact" element={
            <div className="min-h-screen flex flex-col bg-white selection:bg-emerald-100 selection:text-emerald-900">
              <Navbar />
              <main className="flex-grow"><div className="py-24 text-center">Contact Page Coming Soon</div></main>
              <Footer />
            </div>
          } />

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
    </HelmetProvider>
  );
}
