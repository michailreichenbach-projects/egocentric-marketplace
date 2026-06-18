import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Egocentric Marketplace",
  description: "POV video data for physical AI training",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">
            <span className="text-brand-500">ego</span>centric
          </span>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Browse</a>
            <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
