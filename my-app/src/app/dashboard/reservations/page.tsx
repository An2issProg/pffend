"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiHome, FiPackage, FiCalendar, FiClock, FiMapPin, FiRefreshCw, FiCheckCircle, FiXCircle, FiLoader, FiAlertTriangle } from 'react-icons/fi';
import AuroraBackground from "@/app/components/AuroraBackground";

// Interfaces
interface Location { lat: number; lng: number; }
interface TimeSlot { date: string; time: string; location: Location; }
interface Service { name: string; quantity: number; price: number; serviceId: string; }
type PickupLegacy = TimeSlot;
interface GeoPoint { type: 'Point'; coordinates: [number, number]; }
interface Reservation {
  _id: string;
  pickup: PickupLegacy | string;
  delivery: PickupLegacy | string;
  pickupLocation?: GeoPoint;
  deliveryLocation?: GeoPoint;
  services: Service[];
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'done' | 'canceled';
  createdAt: string;
}

// Helper Components
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
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${color} ${bgColor}`}>
      <Icon className={status === 'pending' ? 'animate-spin' : ''} />
      {label}
    </span>
  );
};

const DateTimeDisplay = ({ dateTime, location }: { dateTime?: PickupLegacy | string, location?: GeoPoint }) => {
  const renderContent = () => {
    if (typeof dateTime === 'string') {
      if (isNaN(Date.parse(dateTime))) return <p className="text-sm text-white/70">--</p>;
      return (
        <>
          <p className="flex items-center gap-2"><FiCalendar size={14} /> {new Date(dateTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p className="flex items-center gap-2"><FiClock size={14} /> {new Date(dateTime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
        </>
      );
    } else if (dateTime && typeof dateTime === 'object' && dateTime.date) {
      return (
        <>
          <p className="flex items-center gap-2"><FiCalendar size={14} /> {new Date(dateTime.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          <p className="flex items-center gap-2"><FiClock size={14} /> {dateTime.time}</p>
        </>
      );
    }
    return <p className="text-sm text-white/70">--</p>;
  };

  const mapLocation = location ? { lat: location.coordinates[1], lng: location.coordinates[0] } : (dateTime && typeof dateTime === 'object' && dateTime.location) ? dateTime.location : null;

  return (
    <div className="space-y-1 text-sm text-white/90">
      {renderContent()}
      {mapLocation && (
        <a href={`https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-400 hover:underline mt-1"><FiMapPin size={14} /> Voir sur la carte</a>
      )}
    </div>
  );
};

// Main Page Component
export default function ReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      try {
        const res = await fetch('http://localhost:5001/api/client/reservations', { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error((await res.json()).message || 'Failed to fetch reservations');
        const data = await res.json();
        const list: Reservation[] = Array.isArray(data) ? data : Array.isArray(data.reservations) ? data.reservations : [];
        setReservations(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err: any) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchReservations();
  }, [router]);

  const cancelReservation = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }
      const res = await fetch(`http://localhost:5001/api/client/reservations/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to cancel reservation' }));
        throw new Error(errorData.message);
      }
      setReservations(prev => prev.map(r => r._id === id ? { ...r, status: 'canceled' } : r));
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  if (loading) return <AuroraBackground><div className="flex items-center justify-center min-h-screen"><FiLoader className="animate-spin text-4xl text-sky-300" /></div></AuroraBackground>;
  if (error) return <AuroraBackground><div className="flex items-center justify-center min-h-screen"><div className="bg-red-900/50 border border-red-400/50 p-4 text-red-300 rounded-lg flex items-center gap-3"><FiAlertTriangle /> {error}</div></div></AuroraBackground>;

  return (
    <AuroraBackground>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white">
        <h1 className="text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">Mes Réservations</h1>
        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-black/20 rounded-lg border border-white/10"><FiPackage className="mx-auto text-5xl text-gray-500" /><p className="mt-4 text-gray-400">Vous n'avez aucune réservation.</p></div>
        ) : (
          <div className="space-y-8">
            {reservations.map(res => (
              <div key={res._id} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                <header className="p-5 bg-black/20 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="text-sm text-white/60">Réservation <span className="font-mono">#{res._id.slice(-6)}</span></p>
                    <p className="text-2xl font-bold text-emerald-300">{typeof res.totalPrice === 'number' ? `${res.totalPrice.toFixed(2)} €` : '--'}</p>
                  </div>
                  <StatusIndicator status={res.status} />
                </header>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sky-300 flex items-center gap-2"><FiPackage /> Récupération</h4>
                    <DateTimeDisplay dateTime={res.pickup} location={res.pickupLocation} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sky-300 flex items-center gap-2"><FiHome /> Livraison</h4>
                    <DateTimeDisplay dateTime={res.delivery} location={res.deliveryLocation} />
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <h4 className="font-semibold mb-2 text-sky-300">Services</h4>
                    {Array.isArray(res.services) && res.services.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-white/80 space-y-1 pl-2">
                        {res.services.map((s, idx) => <li key={s.serviceId ?? idx}>{s.quantity} x {s.name} {typeof s.price === 'number' ? `(${s.price.toFixed(2)} €)` : ''}</li>)}
                      </ul>
                    ) : <p className="text-sm text-white/70">Aucun service.</p>}
                  </div>
                </div>

                {res.status === 'pending' && (
                  <footer className="px-5 pb-5 text-right">
                    <button onClick={() => cancelReservation(res._id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ml-auto">
                      <FiXCircle /> Annuler
                    </button>
                  </footer>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </AuroraBackground>
  );
}
