"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { useRouter } from "next/navigation";

interface Service {
  _id: string;
  subcategory: string;
  name: string;
  price: number;
}

export default function TeintureAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ 
    subcategory: "noir", 
    name: "", 
    price: "" 
  });
  const router = useRouter();

  const subcategories = ["noir", "bleu", "maron"];

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/services?category=teinture", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServices(data.services || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:5001/api/admin/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        category: "teinture", 
        ...form, 
        price: Number(form.price),
        name: form.name || form.subcategory
      }),
    });
    setModalOpen(false);
    setForm({ subcategory: "noir", name: "", price: "" });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      const token = localStorage.getItem("token");
      await fetch(`http://localhost:5001/api/admin/services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchData();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Services – Teinture
      </h1>

      {loading ? (
        <p>Chargement...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <table className="min-w-full divide-y divide-white/10 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg">
          <thead className="bg-white/10">
            <tr>
              <th className="px-4 py-2 text-left text-sm">Couleur</th>
              <th className="px-4 py-2 text-left text-sm">Nom</th>
              <th className="px-4 py-2 text-left text-sm">Prix</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {services.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-2 text-gray-300 capitalize">
                  {s.subcategory}
                </td>
                <td className="px-4 py-2 text-gray-200">{s.name}</td>
                <td className="px-4 py-2 text-gray-200">{s.price} dt</td>
                <td className="px-4 py-2 flex gap-3">
                  <button className="text-yellow-400"><FiEdit2 /></button>
                  <button 
                    onClick={() => handleDelete(s._id)}
                    className="text-red-500"
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="mt-6 flex items-center gap-2 bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md shadow"
      >
        <FiPlus /> Ajouter
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-80">
            <h2 className="text-xl mb-4">Nouveau service</h2>
            <select
              value={form.subcategory}
              onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
            >
              {subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub.charAt(0).toUpperCase() + sub.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nom (optionnel)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full mb-3 p-2 rounded bg-gray-700 text-white"
            />
            <input
              type="number"
              placeholder="Prix"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-md"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
