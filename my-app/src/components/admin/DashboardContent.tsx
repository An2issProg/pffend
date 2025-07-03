'use client'

import { useEffect, useState } from 'react'
import { FiUsers, FiUserCheck, FiTrendingUp } from 'react-icons/fi'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { motion } from 'framer-motion'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

interface DashboardStats {
  travailleursCount: number
  clientsCount: number
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      } catch (err) {
        setError('Failed to load dashboard stats')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const animateCounter = (setter: (v: number) => void, target: number) => {
    let start = 0
    const duration = 1000
    const increment = Math.ceil(target / (duration / 16))
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
      <div>
        <div className="h-8 w-64 bg-white/10 rounded animate-pulse mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-40 animate-pulse"></div>
          ))}
        </div>
        <div className="bg-black/30 backdrop-blur-lg rounded-2xl p-6 border border-white/10 h-80 animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={cardVariants}>
      <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">Dashboard</h1>
      
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" variants={cardVariants}>
        <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <FiUsers className="text-2xl text-blue-300" />
            </div>
            <span className="text-sm font-medium text-blue-300 bg-blue-500/10 px-2.5 py-0.5 rounded-full">Total</span>
          </div>
          <h3 className="text-4xl font-bold text-white mb-1">{animatedTravailleurs}</h3>
          <p className="text-sm text-gray-400">Active Workers</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <FiUserCheck className="text-2xl text-green-300" />
            </div>
            <span className="text-sm font-medium text-green-300 bg-green-500/10 px-2.5 py-0.5 rounded-full">Total</span>
          </div>
          <h3 className="text-4xl font-bold text-white mb-1">{animatedClients}</h3>
          <p className="text-sm text-gray-400">Registered Clients</p>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <FiTrendingUp className="text-2xl text-purple-300" />
            </div>
            <span className="text-sm font-medium text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full">Growth</span>
          </div>
          <h3 className="text-4xl font-bold text-white mb-1">+{(stats?.travailleursCount || 0) + (stats?.clientsCount || 0)}</h3>
          <p className="text-sm text-gray-400">Total Accounts</p>
        </motion.div>
      </motion.div>

      <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Workers</h2>
          <ul className="divide-y divide-white/10">
            {stats?.recentTravailleurs.map((t) => (
              <li key={t._id} className="flex items-center gap-4 py-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center font-semibold">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.email}</p>
                </div>
                <span className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-black/30 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-4">Account Growth</h2>
          <div className="h-64">
            <Line
              data={{
                labels: ['Travailleurs', 'Clients'],
                datasets: [{
                  label: 'Comptes',
                  data: [stats?.travailleursCount || 0, stats?.clientsCount || 0],
                  backgroundColor: 'rgba(168, 85, 247, 0.2)',
                  borderColor: 'rgba(168, 85, 247, 1)',
                  pointBackgroundColor: 'rgba(168, 85, 247, 1)',
                  pointBorderColor: '#fff',
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: 'rgba(168, 85, 247, 1)',
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
    </motion.div>
  )
}
