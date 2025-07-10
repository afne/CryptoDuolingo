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
    <aside className="fixed top-0 left-0 h-screen w-64 bg-blue-600 flex flex-col justify-between z-50">
      <div>
        <div className="flex items-center gap-3 px-6 py-8">
          <span className="text-3xl">💰</span>
          <span className="text-2xl font-bold text-white tracking-tight">CryptoDuo</span>
        </div>
        <nav className="flex flex-col gap-2 mt-4">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-6 py-3 mx-2 rounded-xl font-semibold text-lg
                ${pathname === link.href ? 'bg-white text-blue-600' : 'text-white hover:bg-gray-100 hover:text-blue-600'}`}
            >
              <span className="text-2xl">{link.icon}</span> {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="px-6 py-8 border-t border-white flex flex-col gap-2">
        <div className="text-white text-sm truncate">{user.email}</div>
        <button
          onClick={handleLogout}
          className="mt-2 bg-white text-blue-600 px-4 py-2 rounded-full font-bold w-full"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
} 