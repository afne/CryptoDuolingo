'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (result.error) {
        setMessage(result.error.message);
      } else {
        setMessage('Check your email for a confirmation link!');
        // Optionally, redirect after sign up confirmation
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        setMessage(result.error.message);
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <form onSubmit={handleAuth} className="bg-white/10 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-80">
        <h2 className="text-2xl text-white font-bold mb-2">{isSignUp ? 'Sign Up' : 'Log In'}</h2>
        <input
          className="p-2 rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="p-2 rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-2 px-4 rounded-full"
          type="submit"
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
        <button
          type="button"
          className="text-sm text-white underline"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
        {message && <div className="text-white text-sm mt-2">{message}</div>}
      </form>
    </div>
  );
} 