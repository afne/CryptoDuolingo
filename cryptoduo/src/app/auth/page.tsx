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
        router.push('/learn');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <form onSubmit={handleAuth} className="bg-gray-100 p-8 rounded-2xl flex flex-col gap-4 w-80 border border-gray-200">
        <h2 className="text-2xl text-blue-600 font-bold mb-2">{isSignUp ? 'Sign Up' : 'Log In'}</h2>
        <input
          className="p-2 rounded bg-white text-blue-600 border border-blue-600 focus:outline-none placeholder:text-gray-400"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="p-2 rounded bg-white text-blue-600 border border-blue-600 focus:outline-none placeholder:text-gray-400"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-full"
          type="submit"
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
        <button
          type="button"
          className="text-sm text-blue-600 underline"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
        {message && <div className="text-blue-600 text-sm mt-2">{message}</div>}
      </form>
    </div>
  );
} 