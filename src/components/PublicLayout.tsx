import { Navbar, Footer } from "./Layout";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
