"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

interface Reservation {
  _id: string;
  datetime: string;
  services: { name: string; quantity: number }[];
  status: string;
  createdAt: string;
}

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const cancelReservation = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5001/api/client/reservations/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      setReservations((prev) => prev.map((r) => r._id === id ? { ...r, status: 'canceled' } : r));
    } catch {
      alert('Annulation impossible');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:5001/api/client/reservations", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => {
        setReservations(Array.isArray(data.reservations) ? data.reservations : []);
      })
      .catch(() => setError("Impossible de charger les réservations"))
      .finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 p-6">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 p-2 rounded-full hover:bg-white/10 inline-flex"
        >
          <FiArrowLeft size={24} />
        </button>

        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Mes réservations
        </h1>

        {loading ? (
          <p>Chargement...</p>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : reservations.length === 0 ? (
          <p className="text-gray-400">Aucune réservation.</p>
        ) : (
          <div className="overflow-x-auto bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Créneau</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Services</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reservations.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(r.datetime).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(r.datetime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap">
                      {r.services.map((s) => `${s.quantity}× ${s.name}`).join("\n")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap capitalize">{r.status}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.status === 'pending' && (
                        <button onClick={() => cancelReservation(r._id)} className="text-red-400 hover:text-red-500 underline text-sm">Annuler</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
