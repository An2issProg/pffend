'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, Variants } from 'framer-motion'
import { FiArrowRight, FiHome, FiBriefcase, FiPackage } from 'react-icons/fi' // Using react-icons for modern icons

// Aurora Background Component
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

// Main Home Component
export default function Home() {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.6,
        ease: 'easeOut',
      },
    }),
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <AuroraBackground />

      <main className="relative z-10 flex flex-col">
        {/* Hero Section */}
        <section className="h-screen flex items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="container mx-auto px-6"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-sky-300 via-emerald-300 to-teal-300 bg-clip-text text-transparent drop-shadow-xl">
              Yalla Clean
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto">
              L'excellence en nettoyage, à portée de clic. Découvrez nos services et produits premium.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                href="/services"
                className="group bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-8 py-3 rounded-full font-bold hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
              >
                <span>Réserver un Service</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/products"
                className="group bg-black/20 border-2 border-white/20 text-white/80 px-8 py-3 rounded-full font-bold hover:bg-white/10 hover:border-white/40 hover:text-white transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
              >
                <span>Nos Produits</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-900/50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-emerald-400 bg-clip-text text-transparent">Nos Prestations</h2>
            <p className="text-white/70 mb-16 max-w-2xl mx-auto">Qualité, fiabilité et excellence. Conçu pour vous.</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[ 
                { icon: FiHome, title: 'Nettoyage Résidentiel', description: 'Un intérieur impeccable pour un confort absolu.' },
                { icon: FiBriefcase, title: 'Nettoyage Commercial', description: 'Des espaces professionnels qui inspirent confiance.' },
                { icon: FiPackage, title: 'Produits d\'Entretien', description: 'La qualité professionnelle livrée chez vous.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group bg-black/30 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl transition-all duration-300 hover:border-sky-400/50 hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 mx-auto shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-sky-600/30 via-emerald-600/30 to-teal-600/30 p-10 rounded-3xl border border-white/10 shadow-2xl"
            >
              <h2 className="text-4xl font-bold mb-4 text-white">Prêt à transformer votre espace ?</h2>
              <p className="text-white/70 mb-8 max-w-2xl mx-auto">Contactez-nous dès aujourd'hui pour un devis gratuit et découvrez la différence Yalla Clean.</p>
              <Link 
                href="/contact" 
                className="group bg-gradient-to-r from-sky-500 to-emerald-500 text-white px-8 py-4 rounded-full font-bold hover:from-sky-400 hover:to-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center gap-2"
              >
                <span>Demander un Devis</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}
