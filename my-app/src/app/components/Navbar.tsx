'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiShoppingCart } from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  name?: string;
  email?: string;
  role?: string;
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const isWorkerDashboard = pathname.startsWith('/travailleur/dashboard');
  const isUserDashboard = pathname === '/dashboard';

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      setIsLoggedIn(!!token);
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Error parsing user data', e);
        }
      }
    };

    checkLoginStatus();
    updateCartCount();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        checkLoginStatus();
      } else if (event.key === 'panier') {
        updateCartCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for cart updates within the same tab
    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const updateCartCount = () => {
    const cart = localStorage.getItem('panier');
    if (cart) {
      try {
        const parsedCart = JSON.parse(cart);
        const count = Array.isArray(parsedCart) 
          ? parsedCart.reduce((total, item) => total + (item.quantity || 0), 0)
          : 0;
        setCartItemsCount(count);
      } catch (e) {
        setCartItemsCount(0);
      }
    } else {
      setCartItemsCount(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowDropdown(false);
    router.push('/');
  };

  if (isWorkerDashboard || isUserDashboard) {
    const isWorker = isWorkerDashboard;
    const dashboardTitle = isWorker ? 'Tableau de bord Travailleur' : 'Mon Tableau de bord';
    const dashboardLink = isWorker ? '/travailleur/dashboard' : '/dashboard';
    const defaultInitial = isWorker ? 'T' : 'U';
    const defaultName = isWorker ? 'Travailleur' : 'Utilisateur';

    return (
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-20 py-4 bg-black/30 backdrop-blur-lg border-b border-white/10"
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href={dashboardLink} className="text-white font-bold text-xl">
            {dashboardTitle}
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-4">
                <Link 
                  href="/profil" 
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : defaultInitial}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name || defaultName}</span>
                    {user.email && (
                      <span className="text-xs text-white/60">{user.email}</span>
                    )}
                  </div>
                </Link>
              </div>
            )}
            <div className="h-8 w-px bg-white/20"></div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-md transition-colors duration-200 flex items-center gap-2"
              title="Déconnexion"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed top-0 left-0 right-0 z-20 py-4 bg-black/20 backdrop-blur-lg border-b border-white/10"
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center" aria-label="Accueil YallaClean">
          <Image
            src="/Yalla.png"
            alt="Logo YallaClean"
            width={100}
            height={100}
            priority
           className="h-20 w-auto object-contain drop-shadow-lg"
          />
        </Link>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <div className="flex items-center gap-4">
                <Link href="/panier" className="relative text-white/80 hover:text-white transition-all duration-300">
                  <FiShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                </Link>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-medium">{user?.name || 'Utilisateur'}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden z-30">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm font-medium text-white">{user?.name || 'Utilisateur'}</p>
                        <p className="text-xs text-gray-300 truncate">{user?.email || ''}</p>
                      </div>
                      <div className="py-1">
                        <Link 
                          href="/profil" 
                          className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 transition-colors duration-200"
                          onClick={() => setShowDropdown(false)}
                        >
                          Mon profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-6 py-2 rounded-full font-semibold hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
