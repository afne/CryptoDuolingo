'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '../utils/supabase/server';
import { FaBars } from 'react-icons/fa';

const navLinks = [
  { href: '/learn', label: 'Learn', icon: '🏠' },
  { href: '/multiplayer', label: 'Multiplayer', icon: '🎮' },
  { href: '/news', label: 'News', icon: '📰' },
  { href: '/prices', label: 'Live Prices', icon: '💵' }
  // Removed Profile tab
];

type User = { email?: string } | null;

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [guestName, setGuestName] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    // Check for guest login (firstName in localStorage)
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('firstName');
      if (name) setGuestName(name);
    }
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('firstName');
    router.push('/');
  };

  if (!user && !guestName) return null;

  return (
    <>
      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-3xl">💰</span>
          <span className="text-2xl font-bold tracking-tight text-black">DeCrypto</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl text-black focus:outline-none">
          <FaBars />
        </button>
      </div>
      {/* Mobile Drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 shadow-sm transform transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 px-6 py-8">
              <span className="text-3xl">💰</span>
              <span className="text-2xl font-bold tracking-tight text-black">DeCrypto</span>
            </div>
            <nav className="flex flex-col gap-2 px-2">
              {navLinks.map(link => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition ${isActive ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="px-6 py-6 border-t border-gray-200">
            <div className="flex flex-col items-center text-center">
              <span className="font-medium text-base text-black truncate">
                Welcome, {user?.email || guestName || 'Guest'}!
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full text-sm font-semibold text-red-500 hover:underline"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
      {/* Overlay for mobile drawer */}
      {mobileOpen && <div className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex-col justify-between z-50 shadow-sm">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 px-6 py-8">
            <span className="text-3xl">💰</span>
            <span className="text-2xl font-bold tracking-tight text-black">DeCrypto</span>
          </div>
          {/* Nav links */}
          <nav className="flex flex-col gap-2 px-2">
            {navLinks.map(link => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition ${isActive ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        {/* User profile and logout */}
        <div className="px-6 py-6 border-t border-gray-200">
          <div className="flex flex-col items-center text-center">
            <span className="font-medium text-base text-black truncate">
              Welcome, {user?.email || guestName || 'Guest'}!
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 w-full text-sm font-semibold text-red-500 hover:underline"
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
