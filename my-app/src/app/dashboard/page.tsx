"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  name?: string;
  email: string;
}

interface Reservation {
  _id: string;
  service: string;
  date: string;
  status: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsedUser: User = JSON.parse(storedUser);
    setUser(parsedUser);

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
        if (!res.ok) {
          throw new Error("Failed to fetch reservations");
        }
        return res.json();
      })
      .then((data) => {
        const list = Array.isArray(data.reservations)
          ? data.reservations
          : [];
        setReservations(list);
      })
      .catch(() => setError("Impossible de charger les réservations"))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Bonjour, {user?.name || user?.email}
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link
            href="/services"
            className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/5 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Réserver un service</h2>
            <p>Planifiez un nettoyage rapidement.</p>
          </Link>
          <Link
            href="/products"
            className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/5 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Acheter des produits</h2>
            <p>Découvrez nos produits d'entretien.</p>
          </Link>
          <Link
            href="/dashboard/reservations"
            className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/5 transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">Mes réservations</h2>
            <p>Consultez l'historique et le statut.</p>
          </Link>
        </div>

        {/* Latest reservations */}
        <h2 className="text-2xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Dernières réservations
        </h2>
        {reservations.length === 0 ? (
          <p className="text-gray-600">Aucune réservation trouvée.</p>
        ) : (
          <div className="overflow-x-auto bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reservations.slice(0, 5).map((res) => (
                  <tr key={res._id}>
                    <td className="px-6 py-4 whitespace-nowrap">{res.service}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(res.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{res.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </main>
    </>
  );
}
