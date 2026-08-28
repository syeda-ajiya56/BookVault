import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookVault",
  description: "A modern digital library for discovering your next great read.",
};

const navigation = [
  { href: "/", label: "Home" },
  { href: "/books", label: "Books" },
  { href: "/favorites", label: "Favorites" },
  { href: "/reading-list", label: "Reading List" },
  { href: "/ask-ai", label: "Ask AI" },
  { href: "/about", label: "About" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-10 gap-y-4 px-5 py-5 lg:px-8">
            <Link href="/" className="text-2xl font-semibold tracking-tight text-primary">
              BookVault
            </Link>
            <nav aria-label="Main navigation" className="order-3 w-full lg:order-2 lg:w-auto">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <span className="ml-auto text-xs uppercase tracking-[0.18em] text-accent">A reading life, well kept</span>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-5 py-10 lg:px-8">{children}</main>
        <footer className="border-t border-border bg-card">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <span>BookVault</span>
            <span>Stories worth keeping close.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
