"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StatusResp {
  active: boolean;
}

export default function SuperAdminPage() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/superadmin/site-status", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Impossible de récupérer le statut du site");
      const data: StatusResp = await res.json();
      setActive(data.active);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5001/api/superadmin/site-status/toggle", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Échec de la mise à jour du statut");
      const data: StatusResp & { message?: string } = await res.json();
      setActive(data.active);
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Chargement…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Panneau Super-Admin</h1>

        <div className="flex items-center justify-between mb-8">
          <span className="font-medium">Statut du site :</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {active ? "Actif" : "Désactivé"}
          </span>
        </div>

        <button
          onClick={toggleStatus}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"} text-white`}
        >
          {active ? "Désactiver le site" : "Activer le site"}
        </button>

        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href="/">← Retour au site</Link>
        </div>
      </div>
    </div>
  );
}
