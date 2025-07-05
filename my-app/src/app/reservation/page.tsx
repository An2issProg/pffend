"use client";

import { useState, useEffect, ReactNode, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiCalendar, FiMapPin, FiShoppingCart, FiAlertCircle, FiArrowLeft, FiCheckCircle, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { TbTruck, TbTruckDelivery } from 'react-icons/tb';
import { motion } from 'framer-motion';
import { CartItem } from '../../types';
import type { Location } from '../components/LocationPicker';
import AuroraBackground from '../components/AuroraBackground';
import { getImageProps } from '../../utils/imageUtils';

import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('../components/LocationPicker'), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-white/10 rounded-xl animate-pulse"></div>
});

const getNext7Days = () => {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
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

const timeSlots = ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00', '16:00 - 18:00'];
const availableDays = getNext7Days();

const SectionWrapper = ({ title, icon, children }: { title: string, icon: ReactNode, children: ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl mb-6"
  >
    <div className="flex items-center gap-4 mb-4">
      <div className="text-sky-400">{icon}</div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);


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

  const updateQuantity = (_id: string, quantity: number) => {
    if (quantity < 1) return;
    const updatedCart = cartItems.map(item => 
      item._id === _id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('panier', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (_id: string) => {
    const updatedCart = cartItems.filter(item => item._id !== _id);
    setCartItems(updatedCart);
    localStorage.setItem('panier', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

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
        setCartItems(Array.isArray(parsedCart) ? parsedCart : []);
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

      const getStartTime = (timeRange: string) => timeRange.split(' - ')[0];
      const buildIso = (dateStr: string, timeRange: string) => {
        const [h, m] = getStartTime(timeRange).split(':');
        return new Date(`${dateStr}T${h.padStart(2, '0')}:${m.padStart(2, '0')}:00`).toISOString();
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
      <AuroraBackground>
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl max-w-md w-full"
          >
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="text-5xl text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Réservation envoyée !</h1>
            <p className="text-white/70 mb-8">Nous vous notifierons dès qu'un travailleur aura confirmé votre demande.</p>
            <button 
              onClick={() => router.push('/')} 
              className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold py-3 rounded-full hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Retour à l'accueil
            </button>
          </motion.div>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-24 pb-40">
        <div className="flex justify-between items-center mb-12">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <FiArrowLeft size={22} />
            <span className="font-semibold">Retour</span>
          </button>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-sky-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent drop-shadow-xl">
            Planifier une Réservation
          </h1>
          <div className="w-24"></div> {/* Spacer */}
        </div>

        <div className="max-w-4xl mx-auto">
          <SectionWrapper title={`Vos Articles (${totalItems})`} icon={<FiShoppingCart size={24} />}>
            <div className="space-y-4">
              {cartItems.length > 0 ? (
                <>
                  {cartItems.map(item => (
                    <div key={item._id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            {...getImageProps(item.image, item.nomProduit)}
                            className="object-cover"
                            fill
                            sizes="64px"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-white truncate">{item.nomProduit}</h3>
                          <p className="text-sky-400 text-sm font-bold">{(item.prix || 0).toFixed(2)} DT</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-black/20 rounded-full p-1">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors"><FiMinus className="text-white/80"/></button>
                          <span className="font-bold text-white w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1.5 rounded-full hover:bg-white/20 transition-colors"><FiPlus className="text-white/80"/></button>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-400 p-2">
                          <FiTrash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <p className="text-white/70 mb-1">Revenu Total</p>
                      <p className="text-xl font-bold text-sky-400">{totalPrice.toFixed(2)} DT</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-white/60 text-center py-4">Votre panier est vide.</p>
              )}
            </div>
          </SectionWrapper>

          <SectionWrapper title="Ramassage" icon={<TbTruck size={28} />}>
            <h3 className="font-semibold text-white/80 mb-2">Adresse de ramassage</h3>
            <LocationPicker onLocationSelect={handlePickupLocationSelect} selectedLocation={pickupLocation} />
            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div>
                <h3 className="font-semibold text-white/80 mb-3 flex justify-between items-center">
                  <span>Date de ramassage</span>
                  <span className="text-sm font-medium text-sky-400 capitalize">{currentMonthName}</span>
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                  {availableDays.map(day => 
                    <button key={day.fullDate} onClick={() => setPickupDate(day.fullDate)} className={`flex-shrink-0 text-center px-3 py-2 rounded-lg border-2 transition-all duration-200 ${pickupDate === day.fullDate ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'}`}>
                      <div className="text-xs">{day.dayName}</div>
                      <div className="font-bold text-lg">{day.dayNumber}</div>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white/80 mb-3">Heure de ramassage</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {timeSlots.map(slot => 
                    <button key={slot} onClick={() => setPickupTime(slot)} className={`px-2 py-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${pickupTime === slot ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'}`}>
                      {slot}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionWrapper>

          <SectionWrapper title="Livraison" icon={<TbTruckDelivery size={28} />}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-white/80">Même adresse que le ramassage</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={useSameAddress} onChange={() => setUseSameAddress(!useSameAddress)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
              </label>
            </div>
            {!useSameAddress && (
              <div className="mt-4">
                <h3 className="font-semibold text-white/80 mb-2">Adresse de livraison</h3>
                <LocationPicker onLocationSelect={handleDeliveryLocationSelect} selectedLocation={deliveryLocation} />
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div>
                <h3 className="font-semibold text-white/80 mb-3 flex justify-between items-center">
                  <span>Date de livraison</span>
                  <span className="text-sm font-medium text-sky-400 capitalize">{currentMonthName}</span>
                </h3>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
                  {availableDays.map(day => 
                    <button key={day.fullDate} onClick={() => setDeliveryDate(day.fullDate)} className={`flex-shrink-0 text-center px-3 py-2 rounded-lg border-2 transition-all duration-200 ${deliveryDate === day.fullDate ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'}`}>
                      <div className="text-xs">{day.dayName}</div>
                      <div className="font-bold text-lg">{day.dayNumber}</div>
                    </button>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-white/80 mb-3">Heure de livraison</h3>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {timeSlots.map(slot => 
                    <button key={slot} onClick={() => setDeliveryTime(slot)} className={`px-2 py-3 rounded-lg border-2 text-sm font-semibold transition-all duration-200 ${deliveryTime === slot ? 'bg-sky-500 border-sky-500 text-white' : 'bg-white/5 border-white/20 text-white/80 hover:bg-white/10'}`}>
                      {slot}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionWrapper>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg my-4 flex items-center gap-3"
            >
              <FiAlertCircle/>
              <span className="font-semibold">{error}</span>
            </motion.div>
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-20 p-4">
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
          className="max-w-4xl mx-auto bg-black/50 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex justify-between items-center shadow-2xl"
        >
          <div>
            <p className="text-lg font-bold text-white">{totalPrice.toFixed(2)} DT</p>
            <p className="text-sm text-white/60">{totalItems} articles</p>
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading || cartItems.length === 0}
            className="bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold px-8 py-3 rounded-full hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? 'Envoi...' : 'Réserver maintenant'}
          </button>
        </motion.div>
      </footer>
    </AuroraBackground>
  );
}
