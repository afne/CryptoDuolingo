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
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace('/dashboard');
      } else {
        setIsLoaded(true);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-blue-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-400 rounded-full opacity-25 animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-12 h-12 bg-pink-400 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-8 h-8 bg-cyan-400 rounded-full opacity-35 animate-pulse"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        {/* Logo and title */}
        <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="mb-8">
            <div className="text-8xl mb-4 animate-bounce">🚀</div>
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 drop-shadow-2xl">
              Crypto<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Duo</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light">
              Master Crypto & Investing Like a Pro! 🎯
            </p>
          </div>
        </div>

        {/* Animated crypto showcase */}
        <div className={`transform transition-all duration-1000 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20 shadow-2xl">
            <div className="text-4xl mb-4 animate-pulse">
              {cryptos[currentCrypto].emoji}
            </div>
            <div className={`text-2xl font-bold mb-2 bg-gradient-to-r ${cryptos[currentCrypto].color} bg-clip-text text-transparent`}>
              {cryptos[currentCrypto].name}
            </div>
            <div className="text-lg text-gray-300">
              Learn about {cryptos[currentCrypto].symbol} and more!
            </div>
          </div>
        </div>

        {/* Features grid */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl transform transition-all duration-1000 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Learn</h3>
            <p className="text-sm opacity-90">Interactive lessons on crypto fundamentals</p>
          </div>
          <div className="bg-gradient-to-br from-blue-400 to-cyan-600 rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold mb-2">Practice</h3>
            <p className="text-sm opacity-90">Fun challenges and trading simulations</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl p-6 text-white shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">Earn</h3>
            <p className="text-sm opacity-90">Earn rewards and track your progress</p>
          </div>
        </div>

        {/* CTA buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 transform transition-all duration-1000 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <a href="/lessons" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-4 px-8 rounded-full text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 inline-block text-center">
            🚀 Start a Demo lesson now
          </a>
          <a href="/auth" className="bg-white/20 backdrop-blur-md text-white font-bold py-4 px-8 rounded-full text-lg border border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl text-center">
            🔑 Sign Up / Log In
          </a>

        </div>

        {/* Stats */}
        <div className={`mt-12 flex flex-wrap justify-center gap-8 text-white/80 transform transition-all duration-1000 delay-1200 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">1M+</div>
            <div className="text-sm">Active Learners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">50+</div>
            <div className="text-sm">Crypto Lessons</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">95%</div>
            <div className="text-sm">Success Rate</div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className={`mt-8 transform transition-all duration-1000 delay-1400 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/20">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-3/4 animate-pulse"></div>
          </div>
          <p className="text-white/70 text-sm mt-2">Ready to start your crypto journey!</p>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-10 text-6xl animate-bounce opacity-30">💎</div>
        <div className="absolute bottom-20 left-10 text-5xl animate-pulse opacity-40">⚡</div>
        <div className="absolute top-1/3 left-10 text-4xl animate-spin opacity-30">🔄</div>
        <div className="absolute bottom-1/3 right-20 text-5xl animate-bounce opacity-35">📈</div>
        <div className="absolute top-1/4 right-1/4 text-3xl animate-float opacity-25">🎯</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl animate-pulse opacity-30">💡</div>
        <div className="absolute top-2/3 right-1/3 text-5xl animate-bounce opacity-20">🌟</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-spin opacity-35">🎪</div>
      </div>

      {/* Bottom wave effect */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent"></div>
    </div>
  );
}
