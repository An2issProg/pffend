'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FiUsers, FiHome, FiMenu, FiX, FiUserCheck, FiLogOut, FiSettings, FiMoon, FiSun } from 'react-icons/fi'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [darkMode, setDarkMode] = useState<boolean>(typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false)
  const toggleDark = () => {
    const html = document.documentElement
    if (html.classList.contains('dark')) {
      html.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setDarkMode(false)
    } else {
      html.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setDarkMode(true)
    }
  }
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
    { href: '/admin/travailleurs', label: 'Travailleurs', icon: FiUsers },
    { href: '/admin/clients', label: 'Clients', icon: FiUserCheck },
    { href: '/admin/products', label: 'Nos Produits', icon: FiSettings },
    { href: '/admin/settings', label: 'Paramètres', icon: FiSettings },
  ]

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 border-r border-gray-200 shadow-lg`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <span className="text-xl font-bold text-white">Yalla Clean</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
        
        {/* Updated profile section with better styling */}
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">A</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Admin</h3>
              <p className="text-xs text-gray-500">admin@pff.com</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-auto"></div>
                )}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200"
          >
            <FiLogOut className="h-5 w-5 text-gray-400" />
            <span className="font-medium">Se déconnecter</span>
          </button>
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white/60 dark:bg-slate-900/60 backdrop-blur border-b border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-2 bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200"
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <button onClick={toggleDark} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                {darkMode ? <FiSun className="h-5 w-5 text-yellow-400" /> : <FiMoon className="h-5 w-5 text-gray-600" />}
              </button>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
