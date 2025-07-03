'use client';

import AdminProtectedRoute from '@/components/auth/AdminProtectedRoute';
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiUsers, FiBox, FiUserPlus, FiSettings, FiLogOut } from 'react-icons/fi';
import AuroraBackground from '@/app/components/AuroraBackground';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminRootLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
    { href: '/admin/products', label: 'Produits', icon: FiBox },
    { href: '/admin/services', label: 'Services', icon: FiSettings },
    { href: '/admin/clients', label: 'Clients', icon: FiUsers },
    { href: '/admin/travailleurs', label: 'Travailleurs', icon: FiUserPlus },
  ];

  return (
    <AdminProtectedRoute>
      <AuroraBackground>
        <div className="flex min-h-screen">
          <aside className="w-64 bg-black/30 backdrop-blur-lg p-6 flex-shrink-0 border-r border-white/10">
            <div className="mb-12 text-center">
              <Link href="/" className="inline-block">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Admin Panel</span>
              </Link>
            </div>
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                    pathname.startsWith(item.href)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-6">
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
                className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
              >
                <FiLogOut className="w-5 h-5 mr-3" />
                <span>Déconnexion</span>
              </button>
            </div>
          </aside>
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </AuroraBackground>
    </AdminProtectedRoute>
  );
}
