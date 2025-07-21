'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default function AuthPage() {
  const [firstName, setFirstName] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    if (!firstName) {
      setMessage('Please enter your first name.');
      return;
    }
    // Try to find user by first name (for demo only, not secure for real apps)
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_id, first_name')
      .eq('first_name', firstName)
      .maybeSingle();
    if (userProfile) {
      // Log in: set session (simulate login)
      // In a real app, you would use a secure auth method
      localStorage.setItem('firstName', firstName);
      setMessage('Welcome back, ' + firstName + '!');
      setTimeout(() => router.push('/learn'), 1000);
    } else {
      // Sign up: create user in auth and user_profiles
      // For demo, just insert into user_profiles with a random UUID
      const uuid = crypto.randomUUID();
      await supabase.from('user_profiles').insert({ user_id: uuid, first_name: firstName });
      localStorage.setItem('firstName', firstName);
      setMessage('Account created! Welcome, ' + firstName + '.');
      setTimeout(() => router.push('/learn'), 1000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💹</div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">CryptoDuo</h1>
          <p className="text-gray-600 text-lg">Master Crypto & Investing Like a Pro</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome</h2>
            <p className="text-gray-600">Enter your first name to continue</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name
              </label>
              <input
                className="w-full px-4 py-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="text"
                placeholder="Enter your first name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              type="submit"
            >
              Continue
            </button>

            {message && (
              <div className={`text-center p-4 rounded-xl text-sm font-medium ${
                message.includes('error') || message.includes('Error')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
} 