'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../utils/supabase/server';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentCrypto, setCurrentCrypto] = useState(0);

  const [scrollY, setScrollY] = useState(0);
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

  // Enhanced parallax scrolling effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.pageYOffset);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isLoaded) return null;

  return (
    <div className="relative min-h-screen text-white overflow-hidden bg-black">
      {/* Dark purple background for the whole page */}
      <div className="absolute inset-0 z-0 bg-[#0a0052]" />

      {/* Background Image with Parallax - Hero section only */}
      <div 
        className="absolute inset-0 z-10 opacity-60"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
          willChange: 'transform',
          height: '100vh' // Limit to hero section
        }}
      >
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: 'url(/background_icons.png)',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center 20%'
          }}
        />
      </div>

      {/* Dark overlay for better readability */}
      <div className="absolute inset-0 z-20 bg-black/50" />

      {/* Page Content */}
      <div className="relative z-30">
        {/* Hero Section */}
        <div className="relative">
          {/* Background Pattern - Lighter for better contrast */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex justify-between items-center px-8 py-6">
            <div className="flex items-center space-x-2">
              <span className="text-3xl">💹</span>
              <span className="text-2xl font-bold">CryptoDuo</span>
            </div>
            <div className="flex space-x-6">
              <a href="/auth" className="text-gray-300 hover:text-white transition-colors">Sign In</a>
              <a href="/auth" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                Get Started
              </a>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              Learn Crypto
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-6 max-w-3xl mx-auto leading-relaxed">
              Learn cryptocurrency and investing like a pro with interactive lessons, 
              <span className="text-blue-400 font-semibold"> real-world practice</span>, and expert guidance.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a href="/auth" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
                🚀 Start Learning
              </a>
              <a href="/auth" className="bg-gray-800/60 hover:bg-gray-700/70 text-white font-bold py-3 px-6 rounded-xl text-lg border border-gray-600/30 transition-all duration-200 backdrop-blur-sm">
                🔑 Sign Up Free
              </a>
            </div>

            {/* Crypto Showcase - Smaller */}
            <div className="max-w-lg mx-auto mb-8">
              <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/20">
                <div className="relative overflow-hidden rounded-xl bg-gray-900/20 h-32">
                  {cryptos.map((crypto, index) => (
                    <div 
                      key={crypto.symbol}
                      className={`absolute inset-0 p-4 flex flex-col items-center justify-center transition-all duration-700 ease-in-out ${
                        index === currentCrypto 
                          ? 'opacity-100 translate-x-0' 
                          : index < currentCrypto 
                            ? 'opacity-0 -translate-x-full' 
                            : 'opacity-0 translate-x-full'
                      }`}
                    >
                      <div className="text-3xl mb-2 animate-bounce">
                        {crypto.emoji}
                      </div>
                      <div className="text-lg font-bold mb-1 text-blue-400 text-center">
                        {crypto.name}
                      </div>
                      <div className="text-sm text-gray-200 text-center">
                        Learn about {crypto.symbol} and more!
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {cryptos.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentCrypto(index);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentCrypto 
                            ? 'bg-blue-400 scale-125' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Moved up and compact */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Everything you need to succeed
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              From beginner to expert, we&apos;ve got you covered with comprehensive learning tools
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/20 hover:border-gray-600/30 transition-all duration-200">
              <div className="text-4xl mb-4 text-blue-400">📈</div>
              <h3 className="text-xl font-bold mb-3">Interactive Learning</h3>
              <p className="text-gray-200 leading-relaxed text-sm">
                Master crypto fundamentals through engaging lessons, quizzes, and hands-on exercises designed by industry experts.
              </p>
            </div>
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/20 hover:border-gray-600/30 transition-all duration-200">
              <div className="text-4xl mb-4 text-purple-400">💹</div>
              <h3 className="text-xl font-bold mb-3">Real Practice</h3>
              <p className="text-gray-200 leading-relaxed text-sm">
                Apply your knowledge with simulated trading, portfolio management, and real-world crypto scenarios.
              </p>
            </div>
            <div className="bg-gray-800/20 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/20 hover:border-gray-600/30 transition-all duration-200">
              <div className="text-4xl mb-4 text-cyan-400">🏆</div>
              <h3 className="text-xl font-bold mb-3">Earn Rewards</h3>
              <p className="text-gray-200 leading-relaxed text-sm">
                Track your progress, earn achievements, and unlock exclusive content as you advance your crypto knowledge.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section - Compact */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-gray-800/15 backdrop-blur-sm rounded-xl p-4 border border-gray-700/15">
              <div className="text-3xl font-bold text-blue-400 mb-1">1M+</div>
              <div className="text-gray-200 text-sm">Active Learners</div>
            </div>
            <div className="bg-gray-800/15 backdrop-blur-sm rounded-xl p-4 border border-gray-700/15">
              <div className="text-3xl font-bold text-purple-400 mb-1">50+</div>
              <div className="text-gray-200 text-sm">Crypto Lessons</div>
            </div>
            <div className="bg-gray-800/15 backdrop-blur-sm rounded-xl p-4 border border-gray-700/15">
              <div className="text-3xl font-bold text-cyan-400 mb-1">95%</div>
              <div className="text-gray-200 text-sm">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="relative z-10 border-t border-gray-800/50 mt-8">
          <div className="max-w-7xl mx-auto px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-xl">💹</span>
                <span className="text-lg font-bold">CryptoDuo</span>
              </div>
              <div className="flex space-x-6 text-gray-400">
                <a href="#" className="hover:text-white transition-colors text-sm">Privacy</a>
                <a href="#" className="hover:text-white transition-colors text-sm">Terms</a>
                <a href="#" className="hover:text-white transition-colors text-sm">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>  
  );
}