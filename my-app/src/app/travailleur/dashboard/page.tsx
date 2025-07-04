"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowRight,
  FiHome,
  FiCalendar,
  FiClock,
  FiMapPin,
  FiLoader,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

interface ServiceItem {
  name: string;
  quantity: number;
}

interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

interface Reservation {
  _id: string;
  pickup?: string;
  delivery?: string;
  datetime?: string;
  pickupLocation?: GeoPoint;
  deliveryLocation?: GeoPoint;
  services: ServiceItem[];
  status: "pending" | "accepted" | "rejected" | "done";
  user?: { name?: string; email?: string };
}

// ------------------ Helpers ------------------
const StatusIndicator = ({ status }: { status: Reservation["status"] }) => {
  const cfg = {
    pending: { icon: FiLoader, color: "text-yellow-400", label: "En attente" },
    accepted: { icon: FiCheckCircle, color: "text-green-400", label: "Acceptée" },
    rejected: { icon: FiXCircle, color: "text-red-400", label: "Rejetée" },
    done: { icon: FiCheckCircle, color: "text-purple-400", label: "Terminée" },
  } as const;
  const { icon: Icon, color, label } = cfg[status];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-white/5 ${color}`}>
      {status === "pending" && <Icon className="animate-spin-slow" />}
      {status !== "pending" && <Icon />}
      {label}
    </span>
  );
};

// ------------------ Page ------------------
export default function WorkerDashboard() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("http://localhost:5001/api/worker/reservations", {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch reservations");
      const data = await res.json();
      setReservations(Array.isArray(data.reservations) ? data.reservations : []);
    } catch (err) {
      setError("Impossible de charger les réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (
    id: string,
    status: "accepted" | "rejected" | "done"
  ) => {
    try {
      setUpdatingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5001/api/worker/reservations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update reservation");
      await fetchReservations();
    } catch (err) {
      setError("Échec de mise à jour de la réservation");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600">
          Tableau de bord Travailleur
        </h1>

        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">{error}</div>}

        <div className="bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg">
          {reservations.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-2xl">
              <p className="text-2xl font-semibold text-gray-400">Aucune réservation trouvée.</p>
            </div>
          ) : (
            <div className="space-y-6 p-6">
              {reservations.map((r) => (
                <div
                  key={r._id}
                  className="bg-black/40 border border-white/10 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:border-sky-500/50 hover:shadow-sky-500/10"
                >
                  {/* Header */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">
                        Services: {r.services.map((s) => s.name).join(", ")}
                      </p>
                      <p className="text-sm text-gray-400">Client: {r.user?.name || "--"}</p>
                    </div>
                    <StatusIndicator status={r.status} />
                  </div>

                  {/* Pickup & Delivery */}
                  <div className="grid md:grid-cols-2 gap-6 border-t border-white/10 pt-4">
                    {/* Pickup */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sky-400 flex items-center gap-2">
                        <FiArrowRight /> Ramassage
                      </h4>
                      {r.pickup ? (
                        isNaN(Date.parse(r.pickup)) ? (
                          <p className="text-sm text-gray-400">--</p>
                        ) : (
                          <>
                            <p className="flex items-center gap-2 text-sm">
                              <FiCalendar />
                              {" "}
                              {new Date(r.pickup).toLocaleDateString("fr-FR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="flex items-center gap-2 text-sm">
                              <FiClock />
                              {" "}
                              {new Date(r.pickup).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </>
                        )
                      ) : (
                        <p className="text-sm text-gray-400">--</p>
                      )}
                      {r.pickupLocation && (
                        <a
                          href={`https://www.google.com/maps?q=${r.pickupLocation.coordinates[1]},${r.pickupLocation.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-emerald-400 hover:underline"
                        >
                          <FiMapPin /> Voir sur la carte
                        </a>
                      )}
                    </div>

                    {/* Delivery */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-400 flex items-center gap-2">
                        <FiHome /> Livraison
                      </h4>
                      {r.delivery ? (
                        isNaN(Date.parse(r.delivery)) ? (
                          <p className="text-sm text-gray-400">--</p>
                        ) : (
                          <>
                            <p className="flex items-center gap-2 text-sm">
                              <FiCalendar />
                              {" "}
                              {new Date(r.delivery).toLocaleDateString("fr-FR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                            <p className="flex items-center gap-2 text-sm">
                              <FiClock />
                              {" "}
                              {new Date(r.delivery).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </>
                        )
                      ) : (
                        <p className="text-sm text-gray-400">--</p>
                      )}
                      {r.deliveryLocation && (
                        <a
                          href={`https://www.google.com/maps?q=${r.deliveryLocation.coordinates[1]},${r.deliveryLocation.coordinates[0]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-emerald-400 hover:underline"
                        >
                          <FiMapPin /> Voir sur la carte
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(r._id, "accepted")}
                          disabled={updatingId === r._id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => updateStatus(r._id, "rejected")}
                          disabled={updatingId === r._id}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold disabled:opacity-50"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    {r.status === "accepted" && (
                      <button
                        onClick={() => updateStatus(r._id, "done")}
                        disabled={updatingId === r._id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold disabled:opacity-50"
                      >
                        Terminer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
