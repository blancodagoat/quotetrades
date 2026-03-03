'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/dashboard',  label: 'Dashboard' },
  { href: '/leads',      label: 'Leads' },
  { href: '/quotes',     label: 'Quotes' },
  { href: '/templates',  label: 'Templates' },
  { href: '/profile',    label: 'Profile' },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lead to Quote</p>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Toggle navigation"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {open && (
        <div className="md:hidden bg-white border-b px-4 pb-3 flex flex-col gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <button
            onClick={handleSignOut}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 text-left rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Sign out
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <nav className="hidden md:flex w-48 shrink-0 bg-white border-r min-h-screen flex-col py-6 px-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-4">
          Lead to Quote
        </p>
        <div className="flex flex-col gap-1 flex-1">
          {links.map(({ href, label }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                  active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <button
          onClick={handleSignOut}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 text-left rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Sign out
        </button>
      </nav>
    </>
  );
}
