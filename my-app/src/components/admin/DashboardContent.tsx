'use client'

import { useEffect, useState } from 'react'
import { FiUsers, FiUserCheck, FiTrendingUp, FiDollarSign } from 'react-icons/fi'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { motion } from 'framer-motion'
import AuroraBackground from '@/app/components/AuroraBackground'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface Sale {
  _id: string;
  worker: {
    _id: string;
    name: string;
  };
  date: string;
  total: number;
}

interface DashboardStats {
  travailleursCount: number
  clientsCount: number
  totalRevenue?: number // Make totalRevenue optional
  recentTravailleurs: {
    _id: string
    name: string
    email: string
    createdAt: string
  }[]
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [animatedTravailleurs, setAnimatedTravailleurs] = useState(0)
  const [animatedClients, setAnimatedClients] = useState(0)
  const [animatedRevenue, setAnimatedRevenue] = useState(0)
  const [totalWorkersAmount, setTotalWorkersAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sales, setSales] = useState<Sale[]>([])
  const [salesLoading, setSalesLoading] = useState(true)
  const [salesError, setSalesError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('http://localhost:5001/api/admin/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error('Failed to fetch stats')
        }
        const data = await response.json()
        setStats(data)
        animateCounter(setAnimatedTravailleurs, data.travailleursCount)
        animateCounter(setAnimatedClients, data.clientsCount)
        animateCounter(setAnimatedRevenue, data.totalRevenue || 0)
      } catch (err) {
        setError('Failed to load dashboard stats')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          throw new Error('No token found')
        }
        const response = await fetch('http://localhost:5001/api/admin/sales', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (!response.ok) {
          throw new Error('Failed to fetch sales')
        }
        const data = await response.json()
        setSales(data)
        
        // Calculer le montant total des travailleurs
        const total = data.reduce((sum: number, sale: Sale) => sum + (sale.total || 0), 0)
        setTotalWorkersAmount(total)
        
      } catch (err: any) {
        setSalesError(err.message || 'Failed to load sales data')
        console.error(err)
      } finally {
        setSalesLoading(false)
      }
    }

    fetchSales()
  }, [])

  const animateCounter = (setter: (v: number) => void, target: number) => {
    let start = 0
    const duration = 1000
    const increment = target > 0 ? Math.max(1, Math.ceil(target / (duration / 16))) : 0;
    const step = () => {
      start += increment
      if (start >= target) {
        setter(target)
      } else {
        setter(start)
        requestAnimationFrame(step)
      }
    }
    requestAnimationFrame(step)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  }

  if (loading) {
    return (
      <AuroraBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-400"></div>
        </div>
      </AuroraBackground>
    )
  }

  if (error) {
    return (
      <AuroraBackground>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-900/50 border border-red-400/50 p-4 text-red-300 rounded-lg">
            {error}
          </div>
        </div>
      </AuroraBackground>
    )
  }

  return (
    <AuroraBackground>
      <main className="p-6 text-white min-h-screen">
        <motion.div 
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-emerald-300">Tableau de bord Administrateur</h1>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Stat Cards */}
            <StatCard icon={FiUsers} title="Travailleurs" value={animatedTravailleurs} />
            <StatCard icon={FiUserCheck} title="Clients" value={animatedClients} />
            <StatCard icon={FiDollarSign} title="Total Travailleurs" value={`€${totalWorkersAmount.toFixed(2)}`} />
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <motion.div variants={itemVariants} className="lg:col-span-2 bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Nouveaux Travailleurs</h2>
              <ul className="space-y-3">
                {stats?.recentTravailleurs.map((t) => (
                  <li key={t._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <div>
                      <p className="font-semibold text-white/90">{t.name}</p>
                      <p className="text-sm text-white/60">{t.email}</p>
                    </div>
                    <p className="text-xs text-white/50">{new Date(t.createdAt).toLocaleDateString()}</p>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-2xl font-bold text-white mb-6">Croissance des Comptes</h2>
              <div className="h-64">
                <Line
                  data={{
                    labels: ['Travailleurs', 'Clients'],
                    datasets: [{
                      label: 'Comptes',
                      data: [stats?.travailleursCount || 0, stats?.clientsCount || 0],
                      backgroundColor: 'rgba(22, 163, 74, 0.2)',
                      borderColor: 'rgba(34, 197, 94, 1)',
                      pointBackgroundColor: 'rgba(34, 197, 94, 1)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgba(34, 197, 94, 1)',
                      tension: 0.4,
                    }],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#e5e7eb',
                        bodyColor: '#d1d5db',
                      }
                    },
                    scales: {
                      x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                      y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                    }
                  }}
                />
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Rapport des Ventes Journalières</h2>
            {salesLoading ? (
              <div className="h-40 w-full bg-white/10 rounded animate-pulse"></div>
            ) : salesError ? (
              <div className="bg-red-900/50 border border-red-400/50 p-4 text-red-300 rounded-lg">
                {salesError}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-white/20">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">Travailleur</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-white/80 uppercase tracking-wider">Montant Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {sales.length > 0 ? sales.map((sale) => (
                      <tr key={sale._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{sale.worker?.name || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">{new Date(sale.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-300 font-semibold">{sale.total.toFixed(2)} DT </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-center text-white/70">Aucune vente enregistrée pour le moment.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </AuroraBackground>
  )
}

const StatCard = ({ icon: Icon, title, value }: { icon: React.ElementType, title: string, value: string | number }) => (
  <div className="group bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-2">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-white/70 mb-1">{title}</p>
        <p className="text-4xl font-bold text-white">{value}</p>
      </div>
      <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
        <Icon className="w-8 h-8 text-white" />
      </div>
    </div>
  </div>
);
