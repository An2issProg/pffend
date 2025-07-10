  "use client";

import { useEffect, useState, JSX } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { FiLayers, FiRefreshCw, FiMap, FiAward, FiDroplet, FiActivity, FiPlus } from "react-icons/fi";

// Icons for each category
const categoryIcons: Record<string, JSX.Element> = {
  nettoyage: <FiRefreshCw size={24} />,
  repassage: <FiLayers size={24} />,
  tapis: <FiMap size={24} />,
  rideaux: <FiAward size={24} />,
  teinture: <FiDroplet size={24} />,
  sport: <FiActivity size={24} />,
  extra: <FiPlus size={24} />
};

// Animation variants
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.98
  }
};

const pageVariants: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
  exit: { opacity: 0, y: -20 }
};

interface Category {
  name: string;
  count: number;
}

export default function ServicesAdminHome() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5001/api/services", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const grouped: Record<string, number> = {};
        (data.services || []).forEach((s: any) => {
          grouped[s.category] = (grouped[s.category] || 0) + 1;
        });
        // ensure all service categories appear
        ["nettoyage", "repassage", "tapis", "rideaux", "teinture", "sport", "extra"].forEach((cat) => {
          if (!(cat in grouped)) grouped[cat] = 0;
        });
        setCategories(Object.entries(grouped).map(([name, count]) => ({ name, count })));
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les catégories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <motion.main 
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6"
      initial="initial"
      animate="animate"
      variants={pageVariants}
    >
      <motion.h1 
        className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Services – Administration
      </motion.h1>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            className="flex items-center justify-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="animate-pulse flex space-x-2">
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </motion.div>
        ) : error ? (
          <motion.p 
            className="text-red-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {error}
          </motion.p>
        ) : categories.length === 0 ? (
          <motion.p 
            className="text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Aucune catégorie trouvée.
          </motion.p>
        ) : (
          <motion.div 
            className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {categories.map((c) => (
              <motion.div
                key={c.name}
                variants={item}
                whileHover="hover"
                whileTap="tap"
              >
                <Link
                  href={`/admin/services/${c.name}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 bg-black/30 backdrop-blur-lg p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors h-full">
                    <motion.div 
                      className="p-3 bg-pink-500/10 rounded-lg"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <div className="text-pink-400">
                        {categoryIcons[c.name] || <FiLayers size={24} />}
                      </div>
                    </motion.div>
                    <div>
                      <p className="font-medium capitalize text-gray-200">{c.name}</p>
                      <p className="text-sm text-gray-400">{c.count} {c.count === 1 ? 'service' : 'services'}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.main>
  );
}
