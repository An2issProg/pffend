"use client";

import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit } from "react-icons/fi";
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
    _id: null as string | null,
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
    try {
      const token = localStorage.getItem("token");
      const isUpdating = !!form._id;
      const url = isUpdating
        ? `http://localhost:5001/api/admin/services/${form._id}`
        : "http://localhost:5001/api/admin/services";
      const method = isUpdating ? "PUT" : "POST";

      const body = {
        category: "teinture",
        subcategory: form.subcategory,
        name: form.name || form.subcategory,
        price: Number(form.price),
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to ${isUpdating ? 'update' : 'create'} service`);
      }

      setModalOpen(false);
      setForm({ _id: null, subcategory: "noir", name: "", price: "" }); // Reset form
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/api/admin/services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete service");
      }
      
      fetchData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Impossible de supprimer le service");
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
                  <button onClick={() => { setForm({ ...s, price: String(s.price), _id: s._id }); setModalOpen(true); }} className="text-blue-400 hover:text-blue-300"><FiEdit size={18} /></button>
                  <button onClick={() => handleDelete(s._id)} className="text-red-400 hover:text-red-300"><FiTrash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button
        onClick={() => { setForm({ _id: null, subcategory: "noir", name: "", price: "" }); setModalOpen(true); }}
        className="mt-6 flex items-center gap-2 bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md shadow"
      >
        <FiPlus /> Ajouter
      </button>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-80">
            <h2 className="text-xl mb-4">{form._id ? "Modifier le service" : "Nouveau service"}</h2>
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
                {form._id ? "Mettre à jour" : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
