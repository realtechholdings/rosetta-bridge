import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rosetta - Website Translation Made Simple",
  description: "Translate your website instantly with AI-powered accuracy. Embeddable widget, custom buttons, or full SDK integration.",
  keywords: ["website translation", "AI translation", "multilingual website", "translation widget"],
  openGraph: {
    title: "Rosetta - Website Translation Made Simple",
    description: "Translate your website instantly with AI-powered accuracy.",
    type: "website",
    locale: "en_US",
    siteName: "Rosetta",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rosetta - Website Translation Made Simple",
    description: "Translate your website instantly with AI-powered accuracy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">Rosetta</span>
                </Link>
                <div className="hidden md:flex items-center space-x-6">
                  <Link href="/translate" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Translate
                  </Link>
                  <Link href="/embed" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Embed
                  </Link>
                  <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </Link>
                  <Link href="/demo" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Demo
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/get-started"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="pt-16">
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-400 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="text-xl font-bold text-white">Rosetta</span>
                </div>
                <p className="text-sm">
                  AI-powered website translation that keeps your content in sync.
                </p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/translate" className="hover:text-white transition-colors">Translate</Link></li>
                  <li><Link href="/embed" className="hover:text-white transition-colors">Embed Widget</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Developer</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">SDK</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
              © 2025 Rosetta. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
