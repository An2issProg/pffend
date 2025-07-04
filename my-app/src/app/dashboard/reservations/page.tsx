"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiPackage, FiCalendar, FiClock, FiMapPin, FiArrowRight, FiRefreshCw, FiAlertCircle, FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

// Corrected interfaces to match backend data structure
interface Location {
  lat: number;
  lng: number;
}

interface TimeSlot {
  date: string;
  time: string;
  location: Location;
}

interface Service {
  name: string;
  quantity: number;
  price: number;
  serviceId: string;
}

type PickupLegacy = TimeSlot;

interface GeoPoint { type: 'Point'; coordinates: [number, number]; }

interface Reservation {
  _id: string;
  pickup: PickupLegacy | string; // legacy nested or ISO
  delivery: PickupLegacy | string;
  pickupLocation?: GeoPoint;
  deliveryLocation?: GeoPoint;
  services: Service[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'canceled';
  createdAt: string;
}

const StatusIndicator = ({ status }: { status: string }) => {
  const statusConfig = {
    pending: { icon: FiLoader, color: 'text-yellow-400', label: 'En attente' },
    confirmed: { icon: FiCheckCircle, color: 'text-green-400', label: 'Confirmée' },
    in_progress: { icon: FiRefreshCw, color: 'text-blue-400', label: 'En cours' },
    completed: { icon: FiCheckCircle, color: 'text-purple-400', label: 'Terminée' },
    canceled: { icon: FiXCircle, color: 'text-red-400', label: 'Annulée' },
  };

  const { icon: Icon, color, label } = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-white/5 ${color}`}>
      <Icon className={`animate-spin-slow ${status !== 'pending' && 'hidden'}`} />
      {label}
    </span>
  );
};

export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('http://localhost:5001/api/client/reservations', {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch reservations');
        }

        const json = await response.json();
        const list: Reservation[] = Array.isArray(json) ? json : Array.isArray(json.reservations) ? json.reservations : [];
        // Sort reservations by creation date, newest first
        setReservations(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [router]);

  const cancelReservation = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      try {
        const response = await fetch(`http://localhost:5001/api/reservations/${id}/cancel`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to cancel reservation');
        }

        setReservations(prev => prev.map(r => r._id === id ? { ...r, status: 'canceled' } : r));
      } catch (err: any) {
        alert(`Erreur: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <FiLoader className="animate-spin text-4xl text-sky-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center p-8 bg-red-900/20 rounded-lg">
          <FiAlertCircle className="mx-auto text-5xl text-red-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Erreur de chargement</h2>
          <p className="text-red-300">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">
            Mes Réservations
          </h1>
          <button onClick={() => router.push('/products')} className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105">
            <FiPackage />
            Nouvelle Réservation
          </button>
        </div>

        {reservations.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl">
            <FiCalendar className="mx-auto text-6xl text-gray-500 mb-4" />
            <h3 className="text-2xl font-semibold">Aucune réservation trouvée</h3>
            <p className="text-gray-400 mt-2">Il est temps de planifier votre prochain service !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map(res => (
              <div key={res._id} className="bg-black/40 border border-white/10 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:border-sky-500/50 hover:shadow-sky-500/10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Réservation #{res._id.slice(-6)}</p>
                    <p className="text-lg font-bold">Total: {typeof res.totalPrice === 'number' ? res.totalPrice.toFixed(2) : '--'} DT</p>
                  </div>
                  <StatusIndicator status={res.status} />
                </div>

                <div className="grid md:grid-cols-2 gap-6 border-t border-white/10 pt-4">
                  {/* Pickup Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sky-400 flex items-center gap-2"><FiArrowRight /> Ramassage</h4>
                    {typeof res.pickup === 'string' ? (
                      isNaN(Date.parse(res.pickup)) ? (
                        <p className="text-sm text-gray-400">--</p>
                      ) : (
                        <div>
                          <p className="flex items-center gap-2 text-sm"><FiCalendar /> {new Date(res.pickup).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="flex items-center gap-2 text-sm"><FiClock /> {new Date(res.pickup).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )
                    ) : (
                      <div>
                        <p className="flex items-center gap-2 text-sm"><FiCalendar /> {new Date(res.pickup.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="flex items-center gap-2 text-sm"><FiClock /> {res.pickup.time}</p>
                      </div>
                    )}
                    {(() => {
                      const loc =
                        typeof res.pickup !== 'string'
                          ? res.pickup.location
                          : res.pickupLocation
                          ? { lat: res.pickupLocation.coordinates[1], lng: res.pickupLocation.coordinates[0] }
                          : null;
                      if (!loc) return null;
                      return (
                        <a
                          href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-emerald-400 hover:underline"
                        >
                          <FiMapPin /> Voir sur la carte
                        </a>
                      );
                    })()}
                  </div>

                  {/* Delivery Info */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-400 flex items-center gap-2"><FiHome /> Livraison</h4>
                    {typeof res.delivery === 'string' ? (
                      isNaN(Date.parse(res.delivery)) ? (
                        <p className="text-sm text-gray-400">--</p>
                      ) : (
                        <div>
                          <p className="flex items-center gap-2 text-sm"><FiCalendar /> {new Date(res.delivery).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          <p className="flex items-center gap-2 text-sm"><FiClock /> {new Date(res.delivery).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )
                    ) : (
                      <div>
                        <p className="flex items-center gap-2 text-sm"><FiCalendar /> {new Date(res.delivery.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p className="flex items-center gap-2 text-sm"><FiClock /> {res.delivery.time}</p>
                      </div>
                    )}
                    {(typeof res.delivery !== 'string' ? res.delivery.location : undefined) || (res.deliveryLocation ? { lat: res.deliveryLocation.coordinates[1], lng: res.deliveryLocation.coordinates[0] } : undefined) ? (
                      <a href={`https://www.google.com/maps?q=${(typeof res.delivery !== 'string' ? res.delivery.location : { lat: res.deliveryLocation!.coordinates[1], lng: res.deliveryLocation!.coordinates[0] }).lat},${(typeof res.delivery !== 'string' ? res.delivery.location : { lat: res.deliveryLocation!.coordinates[1], lng: res.deliveryLocation!.coordinates[0] }).lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-emerald-400 hover:underline"><FiMapPin /> Voir sur la carte</a>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4">
                  <h4 className="font-semibold mb-2">Services</h4>
                  {Array.isArray(res.services) && res.services.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-300">
                      {res.services.map((s, idx) => (
                        <li key={s.serviceId ?? idx}>
                          {s.quantity} x {s.name} {s.price !== undefined ? `(${s.price.toFixed(2)} DT)` : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400">Aucun service associé</p>
                  )}
                </div>

                {res.status === 'pending' && (
                  <div className="mt-6 text-right">
                    <button onClick={() => cancelReservation(res._id)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                      Annuler la réservation
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
