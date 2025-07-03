'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiShoppingCart, FiTag, FiInfo } from 'react-icons/fi';
import AuroraBackground from '@/app/components/AuroraBackground';

interface Product {
  _id: string;
  nomProduit: string;
  description: string;
  prix: number;
  categorie: string;
  quantite: number;
  image: string;
}

const ProductDetailPage = () => {
  const params = useParams();
  const { id } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const res = await fetch(`http://localhost:5001/api/products/${id}`);
          if (!res.ok) {
            throw new Error('Failed to fetch product data');
          }
          const data = await res.json();
          setProduct(data);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <p className="text-red-500 text-2xl mb-4">Error: {error}</p>
        <Link href="/products" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white">
        <p className="text-xl mb-4">Product not found.</p>
        <Link href="/products" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <AuroraBackground>
      <main className="min-h-screen w-full text-white p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/products" className="inline-flex items-center text-lg text-gray-300 hover:text-white transition-colors group">
              <FiChevronLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
              Back to Products
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20"
            >
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={product.image || '/placeholder.png'}
                  alt={product.nomProduit}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-4xl lg:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                {product.nomProduit}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-300">
                  <FiTag className="mr-2" /> {product.categorie}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${product.quantite > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                  {product.quantite > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                <FiInfo className="inline mr-2" />
                {product.description}
              </p>

              <div className="flex items-center justify-between mb-8">
                <span className="text-4xl font-bold text-white">${product.prix.toFixed(2)}</span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={product.quantite === 0}
                className="w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart className="mr-3" />
                Add to Cart
              </motion.button>
            </motion.div>
          </div>
        </div>
      </main>
    </AuroraBackground>
  );
};

export default ProductDetailPage;
