'use client'

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiTrash2, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

// Updated Product interface to match the data from products page
interface Product {
  _id: string;
  nomProduit: string;
  prix: number;
  imageUrl?: string;
  quantity: number;
}

const PanierPage = () => {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('panier');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          // Clear invalid cart data
          localStorage.removeItem('panier');
        }
      } catch (error) {
        console.error("Failed to parse cart from localStorage", error);
        // Clear invalid cart data
        localStorage.removeItem('panier');
      }
    }
  }, []);

  const updateQuantity = (_id: string, quantity: number) => {
    if (quantity < 1) return;
    const updatedCart = cartItems.map(item => 
      item._id === _id ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('panier', JSON.stringify(updatedCart));
    // Dispatch custom event to notify other components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeFromCart = (_id: string) => {
    const updatedCart = cartItems.filter(item => item._id !== _id);
    setCartItems(updatedCart);
    localStorage.setItem('panier', JSON.stringify(updatedCart));
    // Dispatch custom event to notify other components about cart update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const total = cartItems.reduce((acc, item) => acc + item.prix * item.quantity, 0);

  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login?redirect=/panier');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          datetime: new Date().toISOString(),
          services: cartItems.map(item => ({ name: item.nomProduit, quantity: item.quantity })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'La création de la réservation a échoué.');
      }

      // Order successful
            alert('Votre achat a été enregistré avec succès comme une réservation!');
      localStorage.removeItem('panier');
      setCartItems([]);
      router.push('/dashboard');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">Votre Panier</h1>
          <Link href="/products" className="group flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors">
            <FiArrowLeft />
            <span>Continuer les achats</span>
          </Link>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/50 rounded-lg">
            <p className="text-xl text-gray-400">Votre panier est vide.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map(item => (
                <div key={item._id} className="flex items-center justify-between bg-gray-800/50 p-4 rounded-lg border border-white/10">
                  <div className="flex items-center gap-4">
                    <Image src={item.imageUrl || '/placeholder.png'} alt={item.nomProduit} width={80} height={80} className="rounded-md object-cover" />
                    <div>
                      <h2 className="text-lg font-semibold">{item.nomProduit}</h2>
                      <p className="text-sky-400 font-bold">{(item.prix).toFixed(2)} DT</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-gray-700/50 rounded-full p-1">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="p-1 rounded-full hover:bg-gray-600"><FiMinus /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 rounded-full hover:bg-gray-600"><FiPlus /></button>
                    </div>
                    <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-400 p-2">
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10 h-fit">
              <h2 className="text-2xl font-bold mb-4">Résumé</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)} DT</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span>Calculée à la prochaine étape</span>
                </div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{total.toFixed(2)} DT</span>
                </div>
              </div>
                            {error && <p className="text-red-400 text-sm text-center my-2">{error}</p>}
              <button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full mt-6 bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-6 py-3 rounded-full font-semibold hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Traitement...' : 'Passer la commande'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PanierPage;
