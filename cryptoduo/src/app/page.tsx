'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/server';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentCrypto, setCurrentCrypto] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(() => {
      setIsLoaded(true);
    });
  }, [router]);

  const cryptos = [
    { name: 'Bitcoin', symbol: 'BTC', color: 'from-yellow-400 to-orange-500', emoji: '₿' },
    { name: 'Ethereum', symbol: 'ETH', color: 'from-blue-400 to-purple-500', emoji: 'Ξ' },
    { name: 'Cardano', symbol: 'ADA', color: 'from-blue-500 to-cyan-400', emoji: '₳' },
    { name: 'Solana', symbol: 'SOL', color: 'from-purple-400 to-pink-500', emoji: '◎' },
  ];

  useEffect(() => {
    if (!isLoaded) return;
    const interval = setInterval(() => {
      setCurrentCrypto((prev) => (prev + 1) % cryptos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoaded, cryptos.length]);

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-[#ffd700] rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-[#1ecb8b] rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-[#1a73e8] rounded-full opacity-10 animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-[#ffd700] rounded-full opacity-10 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-[#1ecb8b] rounded-full opacity-10 animate-pulse"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        {/* Logo and title */}
        <div>
          <div className="mb-8">
            <div className="text-8xl mb-4">💹</div>
            <h1 className="text-6xl md:text-8xl font-bold text-blue-600 mb-4">
              CryptoDuo
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-light">
              Master Crypto & Investing Like a Pro! <span className="text-blue-600">💰</span>
            </p>
          </div>
        </div>

        {/* Animated crypto showcase */}
        <div>
          <div className="bg-gray-100 rounded-3xl p-8 mb-8 border border-gray-200">
            <div className="text-4xl mb-4">
              {cryptos[currentCrypto].emoji}
            </div>
            <div className="text-2xl font-bold mb-2 text-blue-600">
              {cryptos[currentCrypto].name}
            </div>
            <div className="text-lg text-gray-700">
              Learn about {cryptos[currentCrypto].symbol} and more!
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
          <div className="bg-gray-100 rounded-2xl p-6 text-gray-800 border border-gray-200">
            <div className="text-4xl mb-4 text-blue-600">📈</div>
            <h3 className="text-xl font-bold mb-2">Learn</h3>
            <p className="text-sm opacity-90">Interactive lessons on crypto fundamentals</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6 text-gray-800 border border-gray-200">
            <div className="text-4xl mb-4 text-blue-600">💹</div>
            <h3 className="text-xl font-bold mb-2">Practice</h3>
            <p className="text-sm opacity-90">Fun challenges and trading simulations</p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6 text-gray-800 border border-gray-200">
            <div className="text-4xl mb-4 text-blue-600">🏆</div>
            <h3 className="text-xl font-bold mb-2">Earn</h3>
            <p className="text-sm opacity-90">Earn rewards and track your progress</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="/lessons" className="bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg text-center">
            🚀 Start Learning Now
          </a>
          <a href="/auth" className="bg-gray-100 text-blue-600 font-bold py-4 px-8 rounded-full text-lg border border-blue-600 text-center">
            🔑 Sign Up / Log In
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-gray-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">1M+</div>
            <div className="text-sm">Active Learners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">50+</div>
            <div className="text-sm">Crypto Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">95%</div>
            <div className="text-sm">Success Rate</div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-8">
          <div className="bg-gray-100 rounded-full p-1 border border-gray-200">
            <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
          </div>
          <p className="text-gray-500 text-sm mt-2">Ready to start your crypto journey!</p>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-10 text-6xl opacity-10">💎</div>
        <div className="absolute bottom-20 left-10 text-5xl opacity-10">⚡</div>
        <div className="absolute top-1/3 left-10 text-4xl opacity-10">🔄</div>
        <div className="absolute bottom-1/3 right-20 text-5xl opacity-10">📈</div>
        <div className="absolute top-1/4 right-1/4 text-3xl opacity-10">🎯</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl opacity-10">💡</div>
        <div className="absolute top-2/3 right-1/3 text-5xl opacity-10">🌟</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl opacity-10">🎪</div>
      </div>
    </div>
  );
}
