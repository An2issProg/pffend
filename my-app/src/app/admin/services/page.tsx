"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiFolder } from "react-icons/fi";

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
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Services – Administration
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-400">Aucune catégorie trouvée.</p>
      ) : (
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`/admin/services/${c.name}`}
              className="flex items-center gap-3 bg-black/30 backdrop-blur-lg p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors"
            >
              <FiFolder size={24} className="text-pink-400" />
              <div>
                <p className="font-medium capitalize text-gray-200">{c.name}</p>
                <p className="text-sm text-gray-400">{c.count} services</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
