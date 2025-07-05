"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiCalendar, FiShoppingCart, FiList, FiArrowRight, FiCheckCircle, FiLoader, FiRefreshCw, FiXCircle } from "react-icons/fi";
import AuroraBackground from "../components/AuroraBackground";

// Updated Interfaces
interface User {
  name?: string;
  email: string;
}

interface Service {
  name: string;
  quantity: number;
  price: number;
  serviceId: string;
}

interface Reservation {
  _id: string;
  services: Service[];
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'done' | 'canceled';
  createdAt: string;
}

// Helper Component for status display
const StatusIndicator = ({ status }: { status: string }) => {
  const config = {
    pending: { icon: FiLoader, color: "text-yellow-300", label: 'En attente', bgColor: "bg-yellow-900/50" },
    accepted: { icon: FiCheckCircle, color: "text-green-300", label: 'Acceptée', bgColor: "bg-green-900/50" },
    done: { icon: FiCheckCircle, color: "text-sky-300", label: 'Terminée', bgColor: "bg-sky-900/50" },
    canceled: { icon: FiXCircle, color: "text-red-400", label: 'Annulée', bgColor: "bg-red-900/50" },
    rejected: { icon: FiXCircle, color: "text-red-400", label: 'Rejetée', bgColor: "bg-red-900/50" },
  };
  const { icon: Icon, color, label, bgColor } = config[status as keyof typeof config] || config.pending;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${color} ${bgColor}`}>
      <Icon className={status === 'pending' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
};

export default function ClientDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        router.push("/login");
        return;
      }

      setUser(JSON.parse(storedUser));

      try {
        const response = await fetch("http://localhost:5001/api/client/reservations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch reservations");
        }

        const data = await response.json();
        const list: Reservation[] = (Array.isArray(data) ? data : Array.isArray(data.reservations) ? data.reservations : [])
            .sort((a: Reservation, b: Reservation) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReservations(list);

      } catch (err) {
        setError("Impossible de charger les réservations");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <AuroraBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400" />
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <main className="min-h-screen pt-24 p-6 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">
              Bonjour, {user?.name || user?.email}
            </h1>
          </div>

          {error && (
            <div className="mb-4 bg-red-900/50 border border-red-400/50 p-4 text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {/* Quick actions */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Link href="/services" className="group bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <FiCalendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Réserver un service</h2>
              <p className="text-white/60">Planifiez un nettoyage rapidement.</p>
            </Link>
            <Link href="/products" className="group bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <FiShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Acheter des produits</h2>
              <p className="text-white/60">Découvrez nos produits d'entretien.</p>
            </Link>
            <Link href="/dashboard/reservations" className="group bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <FiList className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Mes réservations</h2>
              <p className="text-white/60">Consultez l'historique et le statut.</p>
            </Link>
          </div>

          {/* Latest reservations */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">
              Dernières réservations
            </h2>
            <Link href="/dashboard/reservations" className="text-sky-400 hover:text-sky-300 flex items-center gap-2 transition-colors">
              Voir tout <FiArrowRight />
            </Link>
          </div>

          {reservations.length === 0 ? (
            <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-white/70">Aucune réservation trouvée.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.slice(0, 3).map((res) => (
                <Link href={`/dashboard/reservations`} key={res._id} className="block bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg transition-all duration-300 hover:border-sky-500/50 hover:shadow-sky-500/10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div>
                            <p className="font-semibold">{res.services.map(s => `${s.quantity}x ${s.name}`).join(', ')}</p>
                            <p className="text-sm text-white/60">
                                {new Date(res.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-emerald-300">{typeof res.totalPrice === 'number' ? `${res.totalPrice.toFixed(2)} €` : '--'}</p>
                        <StatusIndicator status={res.status} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </AuroraBackground>
  );
}
