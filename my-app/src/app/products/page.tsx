'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingCart, FiArrowRight, FiWind, FiBox, FiDroplet, FiScissors, FiSun, FiZap, FiMoreHorizontal, FiImage } from 'react-icons/fi';
import AuroraBackground from '../components/AuroraBackground';
import { Product } from '../../types';



const CategoryIcon = ({ name }: { name: string }) => {
  const icons: { [key: string]: React.ElementType } = {
    "Nettoyage": FiWind,
    "Repassage": FiBox,
    "Tapis": FiDroplet,
    "Rideaux": FiSun,
    "Teinture": FiScissors,
    "Sport": FiZap,
    "Extra": FiMoreHorizontal
  };
  const IconComponent = icons[name] || FiMoreHorizontal;
  return <IconComponent className="w-8 h-8 mb-2" />;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // Mettre à jour le compteur du panier
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('panier') || '[]');
    const count = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    setCartItemsCount(count);
  };

  useEffect(() => {
    updateCartCount();
    // Écouter les changements du panier
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'panier') {
        updateCartCount();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5001/api/products");
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = ["Tout", ...new Set(products.map(p => p.categorie))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nomProduit.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Tout" || product.categorie === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-center">
      <div>
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-500 mx-auto"></div>
        <h2 className="text-2xl font-semibold text-white mt-4">Chargement...</h2>
        <p className="text-white/60">Nous préparons les produits pour vous.</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center text-center">
      <div className="bg-black/30 p-8 rounded-2xl border border-red-500/50">
        <h2 className="text-2xl font-semibold text-red-400">Oops! Une erreur est survenue.</h2>
        <p className="text-white/60 mt-2">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-6 bg-red-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-400 transition-all duration-300">
          Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <AuroraBackground>
      <main className="relative z-10 container mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent drop-shadow-xl">
              Découvrez Nos Produits
            </h1>
            <Link 
              href="/panier" 
              className="relative px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-full text-white font-medium flex items-center gap-2 transition-all duration-300 border border-white/20 hover:border-sky-400/50"
            >
              <FiShoppingCart className="w-5 h-5" />
              Voir le panier
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">Des solutions de nettoyage professionnelles pour un quotidien impeccable.</p>
        </div>

        <div className="mb-10">
          <div className="relative max-w-lg mx-auto mb-6">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/30 border-2 border-white/20 rounded-full py-3 pl-12 pr-4 text-white placeholder-white/50 focus:outline-none focus:border-sky-500 transition-colors"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${selectedCategory === category ? 'bg-sky-500 text-white shadow-lg' : 'bg-black/30 text-white/60 hover:bg-white/10'}`}>
                {category}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
        >
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Link href={`/products/${product._id}`} key={product._id} className="block h-full">
                <motion.div
                  variants={itemVariants}
                  className="group bg-black/30 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-1 flex flex-col h-full cursor-pointer"
                >
                  <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={product.imageUrl || '/placeholder.png'}
                      alt={product.nomProduit}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {product.quantiteStock === 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        Indisponible
                      </div>
                    )}
                  </div>
                  <div className="flex-grow flex flex-col">
                    <span className="inline-block bg-sky-500/10 text-sky-400 text-xs px-2 py-1 rounded-full mb-2 self-start">
                      {product.categorie}
                    </span>
                    <h2 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.nomProduit}</h2>
                    <p className="text-white/60 text-xs mb-3 line-clamp-2 flex-grow">{product.description}</p>
                    <div className="mt-auto pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
                          {product.prix.toFixed(2)} DT
                        </span>
                      </div>
                      <button
                        disabled={product.quantiteStock === 0}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const cart = JSON.parse(localStorage.getItem('panier') || '[]');
                          const existingProduct = cart.find((item: Product) => item._id === product._id);
                          if (existingProduct) {
                            existingProduct.quantity += 1;
                          } else {
                            cart.push({ ...product, quantity: 1 });
                          }
                          localStorage.setItem('panier', JSON.stringify(cart));
                          setToast({ message: `${product.nomProduit} a été ajouté au panier!`, visible: true });
                          setCartItemsCount(prev => prev + 1);
                          // Déclencher un événement personnalisé pour mettre à jour le compteur
                          window.dispatchEvent(new Event('cartUpdated'));
                          setTimeout(() => setToast({ message: '', visible: false }), 3000);
                        }}
                        className={`w-full py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${product.quantiteStock === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white hover:from-sky-400 hover:to-emerald-400 transform hover:scale-105 shadow-lg'
                          }`}
                      >
                        <FiShoppingCart />
                        {product.quantiteStock === 0 ? 'Indisponible' : 'Ajouter au panier'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-black/20 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-semibold text-white">Aucun produit trouvé</h3>
              <p className="text-white/60 mt-2">Essayez d'ajuster vos filtres de recherche.</p>
            </div>
          )}
        </motion.div>
      </main>
      {toast.visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg z-50"
        >
          {toast.message}
        </motion.div>
      )}
    </AuroraBackground>
  );
}