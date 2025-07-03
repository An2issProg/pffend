'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthLayout from '../components/AuthLayout'

export default function SignUp() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/login?registered=true') // Redirect to login with a success message
      } else {
        setError(data.message || 'Une erreur est survenue lors de l\'inscription.')
      }
    } catch (err) {
      setError('Impossible de se connecter au serveur. Veuillez réessayer plus tard.')
    }
  }

  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Vous avez déjà un compte ?"
      linkHref="/login"
      linkText="Connectez-vous"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-xl text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
            Nom complet
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition-all backdrop-blur-sm hover:border-sky-500/30 focus:border-sky-500/50"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
            Adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition-all backdrop-blur-sm hover:border-sky-500/30 focus:border-sky-500/50"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition-all backdrop-blur-sm hover:border-sky-500/30 focus:border-sky-500/50"
            placeholder="••••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 px-4 text-white placeholder-white/40 focus:ring-2 focus:ring-sky-500/50 focus:outline-none transition-all backdrop-blur-sm hover:border-sky-500/30 focus:border-sky-500/50"
            placeholder="••••••••"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-sky-500 to-emerald-500 text-white py-3.5 px-4 rounded-xl font-bold hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            S'inscrire
          </button>
        </div>
      </form>
    </AuthLayout>
  )
}
