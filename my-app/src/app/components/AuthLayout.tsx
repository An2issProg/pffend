'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

// Reusable Aurora Background from the home page
const AuroraBackground = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
    <div
      className="absolute top-1/2 left-1/2 w-[150%] h-[150%] transform -translate-x-1/2 -translate-y-1/2"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(13, 186, 153, 0.15), rgba(14, 165, 233, 0.1), transparent 60%)',
        animation: 'aurora-spin 20s linear infinite',
      }}
    ></div>
    <div
      className="absolute top-1/2 left-1/2 w-[120%] h-[120%] transform -translate-x-1/2 -translate-y-1/2"
      style={{
        background:
          'radial-gradient(circle at 30% 70%, rgba(56, 189, 248, 0.1), transparent 50%), radial-gradient(circle at 70% 30%, rgba(16, 185, 129, 0.1), transparent 50%)',
        animation: 'aurora-spin-reverse 25s linear infinite',
      }}
    ></div>
    <style jsx>{`
      @keyframes aurora-spin {
        from {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
      @keyframes aurora-spin-reverse {
        from {
          transform: translate(-50%, -50%) rotate(360deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(0deg);
        }
      }
    `}</style>
  </div>
)

// AuthLayout Component
const AuthLayout = ({ children, title, subtitle, linkHref, linkText }: {
  children: React.ReactNode
  title: string
  subtitle: string
  linkHref: string
  linkText: string
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden flex items-center justify-center p-4">
      <AuroraBackground />
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/Yalla.png"
              alt="Logo YallaClean"
              width={64}
              height={64}
              priority
              className="h-20 w-20 object-contain drop-shadow-lg mx-auto"
            />
          </Link>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent">{title}</h2>
          <p className="text-white/70 mt-2">
            {subtitle}{' '}
            <Link href={linkHref} className="font-semibold bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent hover:from-sky-300 hover:to-emerald-300 transition-all duration-300">
              {linkText}
            </Link>
          </p>
        </div>
        {children}
      </motion.div>
    </div>
  )
}

export default AuthLayout
