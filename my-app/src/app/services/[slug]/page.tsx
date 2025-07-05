"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { FiArrowLeft, FiUser, FiUserCheck, FiSmile, FiHome, FiArchive, FiRefreshCw, FiPlus, FiMinus, FiDroplet, FiActivity } from "react-icons/fi";
import React from "react";
import { CartItem } from "../../../types";

interface Item {
  _id: string;
  name: string;
  price: number;
  categorie: string;
  quantiteStock: number;
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

  const [data, setData] = useState<Record<string, Item[]>>({});
  const [cart, setCart] = useState<Record<string, number>>({});
  const [globalCartSummary, setGlobalCartSummary] = useState({ totalItems: 0, totalPrice: 0 });

  // Effect to fetch page-specific data and initialize local cart quantities
  useEffect(() => {
    const existingCartRaw = localStorage.getItem('panier');
    const existingCart: CartItem[] = existingCartRaw ? JSON.parse(existingCartRaw) : [];
    const initialQuantities: Record<string, number> = {};
    existingCart.forEach(item => {
      initialQuantities[item.nomProduit] = item.quantity;
    });
    setCart(initialQuantities);

    fetch(`http://localhost:5001/api/services?category=${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const grouped: Record<string, Item[]> = {};
        (d.services || []).forEach((s: any) => {
          if (!grouped[s.subcategory]) grouped[s.subcategory] = [];
          grouped[s.subcategory].push({ 
            _id: s._id, 
            name: s.name, 
            price: s.price,
            categorie: s.categorie, 
            quantiteStock: s.quantiteStock || 0
          });
        });
        setData(grouped);
      })
      .catch((e) => console.error(e));
  }, [slug]);

  // Effect to calculate and sync the global cart summary for the bottom bar
  useEffect(() => {
    const calculateGlobalCart = () => {
      const existingCartRaw = localStorage.getItem('panier');
      const existingCart: CartItem[] = existingCartRaw ? JSON.parse(existingCartRaw) : [];
      
      const totalItems = existingCart.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = existingCart.reduce((sum, item) => sum + (item.prix * item.quantity), 0);

      setGlobalCartSummary({ totalItems, totalPrice });
    };

    calculateGlobalCart(); // Initial calculation
    window.addEventListener('cartUpdated', calculateGlobalCart); // Listen for our custom event
    window.addEventListener('storage', (e) => { // Listen for changes from other tabs
      if (e.key === 'panier') calculateGlobalCart();
    });

    return () => {
      window.removeEventListener('cartUpdated', calculateGlobalCart);
      window.removeEventListener('storage', (e) => {
        if (e.key === 'panier') calculateGlobalCart();
      });
    };
  }, []);

  const subcategories = useMemo(() => {
    return allSubcategories[slug] || allSubcategories["nettoyage"];
  }, [slug]);

  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (subcategories.length > 0 && !active) {
      setActive(subcategories[0].key);
    }
  }, [subcategories, active]);

  const updateGlobalCart = (itemName: string, newQuantity: number) => {
    const allPageItems = Object.values(data).flat();
    const itemData = allPageItems.find(i => i.name === itemName);
    if (!itemData) return;

    const existingCartRaw = localStorage.getItem('panier');
    const cartMap = new Map<string, CartItem>(existingCartRaw ? JSON.parse(existingCartRaw).map((i: CartItem) => [i._id, i]) : []);

    if (newQuantity > 0) {
      cartMap.set(itemData._id, {
        _id: itemData._id,
        nomProduit: itemData.name,
        prix: itemData.price,
        quantity: newQuantity,
        categorie: itemData.categorie,
        quantiteStock: itemData.quantiteStock,
      });
    } else {
      cartMap.delete(itemData._id);
    }

    const finalCart = Array.from(cartMap.values());
    localStorage.setItem('panier', JSON.stringify(finalCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const addItem = (name: string) => {
    const newQuantity = (cart[name] || 0) + 1;
    setCart(prevCart => ({ ...prevCart, [name]: newQuantity }));
    updateGlobalCart(name, newQuantity);
  };

  const removeItem = (name: string) => {
    const newQuantity = (cart[name] || 0) - 1;
    if (newQuantity < 0) return;

    setCart(prevCart => {
      const updated = { ...prevCart };
      if (newQuantity === 0) {
        delete updated[name];
      } else {
        updated[name] = newQuantity;
      }
      return updated;
    });
    updateGlobalCart(name, newQuantity);
  };

  const handleNext = () => {
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
              <span className="text-sm text-gray-400 w-16 text-right">{item.price.toFixed(3)} dt</span>
            </div>
          </div>
        )) || <p className="text-gray-400">Pas d'articles.</p>}
      </div>

      {globalCartSummary.totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg p-4 border-t border-white/10 flex items-center justify-between">
          <span className="font-medium">{globalCartSummary.totalItems} Article{globalCartSummary.totalItems > 1 ? 's' : ''} – {globalCartSummary.totalPrice.toFixed(3)} dt</span>
          <button onClick={handleNext} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md">Suivant</button>
        </div>
      )}
    </main>
  );
}

