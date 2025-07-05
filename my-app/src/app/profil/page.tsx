'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEnvelope, FaShieldAlt, FaCalendarAlt } from 'react-icons/fa';
import AuroraBackground from '../components/AuroraBackground';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const ProfilPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Vous n'êtes pas connecté.");
          setLoading(false);
          return;
        }

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const { data } = await axios.get('http://localhost:5001/api/auth/me', config);
        setUser(data.user);
      } catch (err) {
        setError('Erreur lors de la récupération du profil.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading || error || !user) {
    return (
      <AuroraBackground>
        <div className="flex justify-center items-center h-screen">
          {loading && <p className="text-lg">Chargement du profil...</p>}
          {error && <p className="text-lg text-red-400">{error}</p>}
          {!loading && !error && !user && <p className="text-lg">Aucun utilisateur trouvé.</p>}
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground>
      <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-screen">
        <div className="w-full max-w-2xl bg-black/30 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10">
          <div className="bg-gradient-to-r from-sky-500 to-emerald-500 p-8 text-white flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/40">
              <span className="text-4xl font-bold">{user.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.name}</h1>
              <p className="text-emerald-200 flex items-center gap-2"><FaEnvelope /> {user.email}</p>
            </div>
          </div>
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Détails du compte</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg">
                <FaShieldAlt className="text-2xl text-sky-400" />
                <div>
                  <p className="font-semibold text-white/70">Rôle</p>
                  <p className="text-lg text-white capitalize">{user.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-white/5 p-4 rounded-lg">
                <FaCalendarAlt className="text-2xl text-emerald-400" />
                <div>
                  <p className="font-semibold text-white/70">Membre depuis</p>
                  <p className="text-lg text-white">{new Date(user.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuroraBackground>
  );
};

export default ProfilPage;
