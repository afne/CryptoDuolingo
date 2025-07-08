'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/server';

type User = { email?: string } | null;

export default function UserWidget() {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 bg-white/20 p-4 rounded-xl text-white z-50 shadow-lg">
      <div>Signed in as: {user.email}</div>
      <button onClick={handleLogout} className="mt-2 bg-red-500 px-3 py-1 rounded text-white">Log out</button>
    </div>
  );
} 