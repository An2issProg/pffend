"use client";

import { useState, useEffect, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiCalendar, FiMapPin, FiChevronDown, FiChevronUp, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';
import { IoIosArrowBack } from 'react-icons/io';
import { FaWallet } from 'react-icons/fa';
import { TbTruck, TbTruckDelivery } from 'react-icons/tb';
import { CartItem } from '../../types';
import type { Location } from '../components/LocationPicker'; // Use type-only import for Location

import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('../components/LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-gray-200 rounded-xl animate-pulse"></div>
});

const getNext7Days = () => {
  const days = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
  const result = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    result.push({
      dayName: days[date.getDay()],
      dayNumber: date.getDate(),
      fullDate: date.toISOString().split('T')[0],
    });
  }
  return result;
};

const timeSlots = ['8:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00'];
const availableDays = getNext7Days();

const AccordionCard = ({ title, icon, children, defaultOpen = false }: { title: string, icon: ReactNode, children: ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-4 text-left">
        <div className="flex items-center gap-3">
          <div className="text-green-500">{icon}</div>
          <span className="font-semibold text-gray-800">{title}</span>
        </div>
        {isOpen ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-100">{children}</div>}
    </div>
  );
};

export default function ReservationPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState<Location | null>(null);
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePickupLocationSelect = (location: Location) => {
    setPickupLocation(location);
  };

  const handleDeliveryLocationSelect = (location: Location) => {
    setDeliveryLocation(location);
  };

  useEffect(() => {
    const rawCart = localStorage.getItem('panier');
    if (rawCart) {
      try {
        const parsedCart = JSON.parse(rawCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.error("Cart data is not an array:", parsedCart);
          localStorage.removeItem('panier');
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        localStorage.removeItem('panier');
      }
    }
  }, []);

  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const totalPrice = useMemo(() => cartItems.reduce((sum, item) => sum + (item.prix * item.quantity), 0), [cartItems]);
  const currentMonthName = useMemo(() => new Date().toLocaleString('fr-FR', { month: 'long' }), []);

  const handleSubmit = async () => {
    if (!pickupDate || !pickupTime || !pickupLocation) {
      setError('Veuillez sélectionner une adresse, une date et une heure pour le ramassage.');
      return;
    }
    if (!deliveryDate || !deliveryTime || (!useSameAddress && !deliveryLocation)) {
      setError('Veuillez sélectionner une adresse, une date et une heure pour la livraison.');
      return;
    }


    
    setError('');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      const finalDeliveryLocation = useSameAddress ? pickupLocation : deliveryLocation;

      // The validation checks at the top ensure that `pickupLocation` and `finalDeliveryLocation` are not null here.
      const getStartTime = (timeRange: string) => timeRange.split(' - ')[0];
      const buildIso = (dateStr: string, timeRange: string) => {
        const [h, m] = getStartTime(timeRange).split(':');
        const hh = h.padStart(2, '0');
        const mm = m.padStart(2, '0');
        return new Date(`${dateStr}T${hh}:${mm}:00`).toISOString();
      };
      const pickupIso = buildIso(pickupDate, pickupTime);
      const deliveryIso = buildIso(deliveryDate, deliveryTime);

      const reservationData = {
        pickup: pickupIso,
        delivery: deliveryIso,
        pickupLocation: { type: 'Point', coordinates: [pickupLocation.lng, pickupLocation.lat] },
        deliveryLocation: { type: 'Point', coordinates: [finalDeliveryLocation!.lng, finalDeliveryLocation!.lat] },
        services: cartItems.map(item => ({ name: item.nomProduit, quantity: item.quantity })),
        
      };

      const res = await fetch('http://localhost:5001/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(reservationData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de la réservation');
      }
      
      setSuccess(true);
      localStorage.removeItem('panier');
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (e: any) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  };

    if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50 p-4 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Réservation envoyée !</h1>
          <p className="text-gray-600 mb-6">En attente de la confirmation d'un travailleur.</p>
          <button onClick={() => router.push('/')} className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition-colors">
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 font-sans">
      <header className="bg-blue-100/50 backdrop-blur-lg p-4 flex justify-between items-center sticky top-0 z-10 rounded-b-3xl">
                 <button onClick={() => router.back()} className="text-gray-700">
          <IoIosArrowBack size={24} />
        </button>
        <div className="flex items-center gap-2">
          <FiCalendar className="text-gray-700" />
          <h1 className="font-bold text-lg text-gray-800">Planifier</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 text-sm shadow-sm">
            <FaWallet className="text-blue-500" />
            <span className="font-semibold">0</span>
            <button className="bg-blue-500 text-white rounded-full w-4 h-4 text-xs">+</button>
          </div>
          <div className="relative">
            <FiShoppingCart size={24} className="text-gray-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 pb-32">
        <AccordionCard title={`Vos Articles (${totalItems})`} icon={<FiShoppingCart size={20} />} defaultOpen>
            <div className="space-y-2">
                {cartItems.map(item => (
                    <div key={item._id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.quantity} x {item.nomProduit}</span>
                        <span className="font-semibold text-gray-800">{(item.prix * item.quantity).toFixed(3)} dt</span>
                    </div>
                ))}
            </div>
        </AccordionCard>

        {/* Pickup Section */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-4"><TbTruck size={28} className="text-gray-700" /><h2 className="text-xl font-bold text-gray-800">Ramassage</h2></div>
          <AccordionCard title="Adresse" icon={<FiMapPin size={20} />} defaultOpen><LocationPicker onLocationSelect={handlePickupLocationSelect} selectedLocation={pickupLocation} /></AccordionCard>
          <AccordionCard title="Date et heure" icon={<FiCalendar size={20} />} defaultOpen>
            <div className="flex justify-between items-center mb-2"><label className="font-semibold text-sm text-gray-600">Choisir date</label><span className="text-sm font-medium text-blue-600 capitalize">{currentMonthName}</span></div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDays.map(day => <button key={day.fullDate} onClick={() => setPickupDate(day.fullDate)} className={`flex-shrink-0 text-center px-4 py-2 rounded-lg border-2 ${pickupDate === day.fullDate ? 'bg-blue-500 text-white' : 'bg-white'}`}><div className="text-xs">{day.dayName}</div><div className="font-bold">{day.dayNumber}</div></button>)}
            </div>
            <div className="mt-4"><label className="font-semibold text-sm text-gray-600 mb-2 block">Choisir heure</label><div className="grid grid-cols-3 gap-2">{timeSlots.map(slot => <button key={slot} onClick={() => setPickupTime(slot)} className={`px-2 py-3 rounded-lg border-2 text-sm ${pickupTime === slot ? 'bg-blue-500 text-white' : 'bg-white'}`}>{slot}</button>)}</div></div>
          </AccordionCard>
        </section>

        {/* Delivery Section */}
        <section>
          <div className="flex items-center gap-3 mb-4"><TbTruckDelivery size={28} className="text-gray-700" /><h2 className="text-xl font-bold text-gray-800">Livraison</h2></div>
          <AccordionCard title="Adresse" icon={<FiMapPin size={20} />}>
            <div className="flex justify-between items-center mb-4"><span className="text-gray-600">Même adresse que le ramassage</span><label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" checked={useSameAddress} onChange={() => setUseSameAddress(!useSameAddress)} className="sr-only peer" /><div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div></label></div>
            {!useSameAddress && <LocationPicker onLocationSelect={handleDeliveryLocationSelect} selectedLocation={deliveryLocation} />}
          </AccordionCard>
          <AccordionCard title="Date et heure" icon={<FiCalendar size={20} />}>
            <div className="flex justify-between items-center mb-2"><label className="font-semibold text-sm text-gray-600">Choisir date</label><span className="text-sm font-medium text-blue-600 capitalize">{currentMonthName}</span></div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableDays.map(day => <button key={day.fullDate} onClick={() => setDeliveryDate(day.fullDate)} className={`flex-shrink-0 text-center px-4 py-2 rounded-lg border-2 ${deliveryDate === day.fullDate ? 'bg-blue-500 text-white' : 'bg-white'}`}><div className="text-xs">{day.dayName}</div><div className="font-bold">{day.dayNumber}</div></button>)}
            </div>
            <div className="mt-4"><label className="font-semibold text-sm text-gray-600 mb-2 block">Choisir heure</label><div className="grid grid-cols-3 gap-2">{timeSlots.map(slot => <button key={slot} onClick={() => setDeliveryTime(slot)} className={`px-2 py-3 rounded-lg border-2 text-sm ${deliveryTime === slot ? 'bg-blue-500 text-white' : 'bg-white'}`}>{slot}</button>)}</div></div>
          </AccordionCard>
        </section>

        {error && <div className="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded-lg my-4 flex items-center gap-2"><FiAlertCircle/><span className="block sm:inline">{error}</span></div>}
      </main>

      <footer className="sticky bottom-0 left-0 right-0 bg-gray-800 p-4 border-t border-gray-700 shadow-lg">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <div>
              <p className="text-lg font-bold text-white">{totalPrice.toFixed(3)} dt</p>
              <p className="text-sm text-gray-400">{totalItems} articles</p>
            </div>
            <button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700 px-4 py-2 rounded-md">Suivant</button>
          </div>
        </footer>
    </div>
  );
}
