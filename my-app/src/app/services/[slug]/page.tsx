"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { FiArrowLeft, FiUser, FiUserCheck, FiSmile, FiHome, FiArchive, FiRefreshCw, FiPlus, FiMinus, FiDroplet, FiActivity } from "react-icons/fi";
import React from "react";

interface Item {
  name: string;
  price: number;
}

type Subcategory = { key: string; label: string; icon: React.ReactElement };
const allSubcategories: Record<string, Subcategory[]> = {
  nettoyage: [
    { key: "homme", label: "Homme", icon: <FiUser size={24} /> },
    { key: "femme", label: "Femme", icon: <FiUserCheck size={24} /> },
    { key: "enfants", label: "Enfants", icon: <FiSmile size={24} /> },
    { key: "linge", label: "Linge maison", icon: <FiHome size={24} /> },
    { key: "traditionnels", label: "Traditionnels", icon: <FiArchive size={24} /> },
  ],
  repassage: [
    { key: "homme", label: "Homme", icon: <FiUser size={24} /> },
    { key: "femme", label: "Femme", icon: <FiUserCheck size={24} /> },
    { key: "linge", label: "Linge maison", icon: <FiHome size={24} /> },
  ],
  tapis: [
    { key: "tapis_synthetique", label: "Tapis synthétique", icon: <FiArchive size={24} /> },
    { key: "tapis_laine", label: "Tapis laine", icon: <FiArchive size={24} /> },
    { key: "tapis_berbere", label: "Tapis berbere", icon: <FiArchive size={24} /> },
    { key: "tapis_couloir", label: "Tapis couloir", icon: <FiArchive size={24} /> },
    { key: "descente_lit", label: "Descente de lit", icon: <FiArchive size={24} /> },
  ],
  rideaux: [
    { key: "panneau_simple", label: "Panneau simple", icon: <FiArchive size={24} /> },
    { key: "panneau_double", label: "Panneau double", icon: <FiArchive size={24} /> },
    { key: "repassage_rideaux", label: "Repassage", icon: <FiArchive size={24} /> },
  ],
  teinture: [
    { key: "noir", label: "Noir", icon: <FiDroplet size={24} /> },
    { key: "bleu", label: "Bleu", icon: <FiDroplet size={24} /> },
    { key: "maron", label: "Maron", icon: <FiDroplet size={24} /> },
  ],
  sport: [
    { key: "sport", label: "Sport", icon: <FiActivity size={24} /> },
  ],
  extra: [
    { key: "extra", label: "Extra", icon: <FiPlus size={24} /> },
  ]
};






 


export default function CategoryDetails() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();

  // fetched data state
  const [data, setData] = useState<Record<string, Item[]>>({});

  useEffect(() => {
    fetch(`http://localhost:5001/api/services?category=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const grouped: Record<string, Item[]> = {};
        (d.services || []).forEach((s: any) => {
          if (!grouped[s.subcategory]) grouped[s.subcategory] = [];
          grouped[s.subcategory].push({ name: s.name, price: s.price });
        });
        setData(grouped);
      })
      .catch((e) => console.error(e));
  }, [slug]);

  // compute subcategories for current slug
  const subcategories = useMemo(() => {
    return allSubcategories[slug] || allSubcategories["nettoyage"];
  }, [slug]);

  const [active, setActive] = useState<string>(subcategories[0]?.key || "");

  // Reset active subcategory when the main category (slug) changes
  useEffect(() => {
    if (subcategories.length > 0) {
      setActive(subcategories[0].key);
    }
  }, [subcategories]);
  const [cart, setCart] = useState<Record<string, number>>({});

  const addItem = (name: string) => {
    setCart((c) => ({ ...c, [name]: (c[name] || 0) + 1 }));
  };

  const removeItem = (name: string) => {
    setCart((c) => {
      const qty = (c[name] || 0) - 1;
      const updated = { ...c };
      if (qty <= 0) delete updated[name]; else updated[name] = qty;
      return updated;
    });
  };

  const total = Object.entries(cart).reduce((sum, [n, q]) => {
    // find price in data
    const item = (Object.values(data).flat()).find((i) => i.name === n);
    return sum + (item ? item.price * q : 0);
  }, 0);

  const handleNext = () => {
    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/reservation");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-6 pb-20 px-4">
      <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-pink-400 hover:text-pink-500">
        <FiArrowLeft /> Retour
      </button>

      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center gap-3">
        <FiRefreshCw /> {slug.charAt(0).toUpperCase() + slug.slice(1)}
      </h1>

      {/* Subcategory tabs */}
      <div className="flex overflow-x-auto gap-4 mb-6 pb-2 border-b border-white/10">
        {subcategories.map((sc) => (
          <button
            key={sc.key}
            onClick={() => setActive(sc.key)}
            className={`flex flex-col items-center shrink-0 min-w-[90px] px-4 py-3 rounded-xl border transition-colors ${
              active === sc.key
                ? "bg-pink-500/20 border-pink-400 text-pink-300"
                : "bg-black/30 border-white/10 text-gray-300 hover:bg-white/5"
            }`}
          >
            {sc.icon}
            <span className="mt-1 text-xs font-medium">{sc.label}</span>
          </button>
        ))}
      </div>

      {/* Items for active subcategory */}
      <div className="space-y-4">
        {(data[active] || []).map((item) => (
          <div key={item.name} className="flex items-center justify-between bg-black/30 backdrop-blur-lg p-4 rounded-xl border border-white/10">
            <span className="font-medium text-gray-200">{item.name}</span>
            <div className="flex items-center gap-3">
              <button onClick={() => removeItem(item.name)} className="p-1 hover:text-pink-400">
                <FiMinus />
              </button>
              <span className="w-6 text-center">{cart[item.name] || 0}</span>
              <button onClick={() => addItem(item.name)} className="p-1 hover:text-pink-400">
                <FiPlus />
              </button>
              <span className="text-sm text-gray-400 w-16 text-right">{item.price} dt</span>
            </div>
          </div>
        )) || <p className="text-gray-400">Pas d'articles.</p>}
      </div>

      {total > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg p-4 border-t border-white/10 flex items-center justify-between">
          <span className="font-medium">{Object.values(cart).reduce((a,b)=>a+b,0)} Article{Object.values(cart).reduce((a,b)=>a+b,0)>1?'s':''} – {total.toFixed(3)} dt</span>
          <button onClick={handleNext} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md">Suivant</button>
        </div>
      )}
    </main>
  );
}

