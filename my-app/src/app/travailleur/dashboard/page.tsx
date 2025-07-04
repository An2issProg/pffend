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

interface Product {
  _id: string;
  nomProduit: string;
  prix: number;
}

interface Service {
  _id: string;
  name: string;
  price: number;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  type: 'product' | 'service';
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
  const [isCaisseOpen, setIsCaisseOpen] = useState(false);
    const [caisseTotal, setCaisseTotal] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
  const [lastSaleTotal, setLastSaleTotal] = useState<number | null>(null);

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
    fetchProductsAndServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProductsAndServices = async () => {
    try {
      const [productsRes, servicesRes] = await Promise.all([
        fetch("http://localhost:5001/api/products"),
        fetch("http://localhost:5001/api/services"),
      ]);
      if (!productsRes.ok || !servicesRes.ok) {
        throw new Error("Failed to fetch products or services");
      }
      const productsData = await productsRes.json();
      const servicesData = await servicesRes.json();
      setProducts(Array.isArray(productsData) ? productsData : []);
      setServices(Array.isArray(servicesData.services) ? servicesData.services : []);
    } catch (err) {
      setError("Impossible de charger les produits et services");
    }
  };

  const addToCart = (item: Product | Service, type: 'product' | 'service') => {
    const cartItem: CartItem = {
      id: item._id,
      name: type === 'product' ? (item as Product).nomProduit : (item as Service).name,
      price: type === 'product' ? (item as Product).prix : (item as Service).price,
      type,
    };
    setCart([...cart, cartItem]);
  };

    useEffect(() => {
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    setCaisseTotal(total);
  }, [cart]);

  const handleCloseDay = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/worker/close-day", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cart, total: caisseTotal }),
      });

      if (!res.ok) throw new Error("Failed to close day");

      const data = await res.json();
      setLastSaleTotal(data.sale.total);
      setIsCaisseOpen(false);
      setCart([]);
    } catch (err) {
      setError("Impossible de fermer la journée");
    }
  };

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
                <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600">
            Tableau de bord Travailleur
          </h1>
          <div>
            {!isCaisseOpen ? (
              <button
                onClick={() => setIsCaisseOpen(true)}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white shadow-lg transition-transform transform hover:scale-105"
              >
                Ouvrir la journée
              </button>
            ) : (
              <button
                onClick={handleCloseDay}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-white shadow-lg transition-transform transform hover:scale-105"
              >
                Fermer la journée
              </button>
            )}
          </div>
        </div>

                        {error && <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">{error}</div>}

        {lastSaleTotal !== null && (
          <div className="mb-8 bg-green-900/30 border border-green-700 rounded-2xl p-6 text-center">
            <h2 className="text-2xl font-bold text-green-400">Dernière clôture de journée</h2>
            <p className="text-4xl font-bold mt-2">{lastSaleTotal.toFixed(2)}€</p>
          </div>
        )}


        {isCaisseOpen && (
          <div className="mb-8 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Caisse</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-sky-400">Services</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {services.map((service) => (
                    <div key={service._id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                      <span>{service.name} - {service.price.toFixed(2)}€</span>
                      <button onClick={() => addToCart(service, 'service')} className="px-3 py-1 bg-sky-600 hover:bg-sky-700 rounded-md text-sm">Ajouter</button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-4 text-purple-400">Produits</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {products.map((product) => (
                    <div key={product._id} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                      <span>{product.nomProduit} - {product.prix.toFixed(2)}€</span>
                      <button onClick={() => addToCart(product, 'product')} className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-md text-sm">Ajouter</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-400">Panier</h3>
              <div className="space-y-2 bg-black/20 p-4 rounded-lg max-h-60 overflow-y-auto pr-2">
                {cart.length === 0 ? (
                  <p className="text-gray-400">Le panier est vide.</p>
                ) : (
                  cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <span>{item.price.toFixed(2)}€</span>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="text-right text-xl font-bold">Total: {caisseTotal.toFixed(2)}€</div>
          </div>
        )}


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
