'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/server';

const navLinks = [
  { href: '/learn', label: 'learn', icon: '🏠' },
];

type User = { email?: string } | null;

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) return null;

  return (
    <aside className="fixed top-6 left-6 h-[92vh] w-80 bg-white shadow-xl rounded-3xl flex flex-col justify-between z-50">
      <div>
        <div className="flex flex-col items-center justify-center px-10 py-12">
          <div className="flex items-center gap-2">
            <span className="text-4xl text-black">💰</span>
            <span className="text-2xl font-extrabold text-black tracking-tight">CryptoDuo</span>
          </div>
        </div>
        <nav className="flex flex-col gap-4 mt-8">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-8 py-4 mx-4 rounded-full font-bold text-2xl transition-colors
                ${pathname === link.href ? 'bg-gray-900/90 text-white shadow-sm' : 'text-gray-900 hover:bg-gray-100'}`}
            >
              <span className="text-3xl">{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-10 py-10 flex flex-col gap-4">
        <div className="text-gray-700 text-lg truncate font-semibold mb-2">{user.email}</div>
        <button
          onClick={handleLogout}
          className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-xl w-full shadow-sm hover:bg-gray-700 transition-colors"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
} 