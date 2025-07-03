"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

export default function ReservationPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [datetime, setDatetime] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("cart");
    if (raw) {
      const cart: Record<string, number> = JSON.parse(raw);
      // we don't have prices stored; assume backend will recount, otherwise price 0
      const mapped: CartItem[] = Object.entries(cart).map(([name, qty]) => ({ name, qty, price: 0 }));
      setItems(mapped);
    }
  }, []);

  const handleSubmit = async () => {
    if (!datetime) {
      setError("Veuillez sélectionner une date et une heure.");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          datetime,
          services: items.map((i) => ({ name: i.name, quantity: i.qty })),
        }),
      });
      if (!res.ok) throw new Error("Échec de la réservation");
      setSuccess(true);
      localStorage.removeItem("cart");
    } catch (e) {
      console.error(e);
      setError("Impossible d'envoyer la réservation");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <h1 className="text-2xl mb-4">Réservation envoyée ✅</h1>
        <p className="text-gray-400 mb-6">En attente de la confirmation d'un travailleur...</p>
        <button
          onClick={() => router.push("/")}
          className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md"
        >
          Retour à l'accueil
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Réservation
      </h1>

      {items.length === 0 ? (
        <p className="text-gray-400">Votre panier est vide.</p>
      ) : (
        <div className="space-y-4 mb-8">
          {items.map((it) => (
            <div key={it.name} className="flex justify-between bg-black/30 backdrop-blur-lg p-4 rounded-xl border border-white/10">
              <span>{it.qty}× {it.name}</span>
            </div>
          ))}
        </div>
      )}

      <label className="block mb-4">
        <span className="block mb-1 text-gray-300">Date & heure souhaitées</span>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </label>

      {error && <p className="text-red-400 mb-3">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || items.length === 0}
        className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md disabled:opacity-50"
      >
        {loading ? 'Envoi...' : 'Réserver'}
      </button>
    </main>
  );
}
