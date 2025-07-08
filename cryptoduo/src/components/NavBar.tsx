'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/server';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/lessons', label: 'Lessons', icon: '📚' },
  { href: '/notes', label: 'Notes', icon: '📝' },
];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

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
    <nav className="w-full bg-white/10 backdrop-blur-md py-3 px-6 flex items-center justify-between shadow-md z-40">
      <div className="flex gap-4 items-center">
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-1 px-4 py-2 rounded-full font-semibold transition-colors duration-200
              ${pathname === link.href ? 'bg-yellow-400 text-black' : 'text-white hover:bg-white/20'}`}
          >
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-white text-sm">{user.email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-full font-bold hover:bg-red-600 transition-colors"
        >
          Log Out
        </button>
      </div>
    </nav>
  );
} 