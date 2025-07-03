"use client";

import Link from "next/link";
import { JSX } from "react";
import { FiLayers, FiRefreshCw, FiMap, FiAward, FiDroplet, FiActivity, FiPlus, FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface Category {
  name: string;
  slug: string;
  icon: JSX.Element;
}

const categories: Category[] = [
  { name: "Nettoyage", slug: "nettoyage", icon: <FiRefreshCw size={32} /> },
  { name: "Repassage", slug: "repassage", icon: <FiLayers size={32} /> },
  { name: "Tapis", slug: "tapis", icon: <FiMap size={32} /> },
  { name: "Rideaux", slug: "rideaux", icon: <FiAward size={32} /> },
  { name: "Teinture", slug: "teinture", icon: <FiDroplet size={32} /> },
  { name: "Sport", slug: "sport", icon: <FiActivity size={32} /> },
  { name: "Extra", slug: "extra", icon: <FiPlus size={32} /> },
];

export default function ServicesPage() {
  const router = useRouter();
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10">
            <FiArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Catégories
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/services/${cat.slug}`}
              className="flex flex-col items-center justify-center bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/5 transition-colors"
            >
              <div className="text-white mb-3">
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-gray-300 text-center">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
