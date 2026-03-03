'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <nav className="w-48 shrink-0 bg-white border-r min-h-screen flex flex-col py-6 px-3">
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
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <button
        onClick={handleSignOut}
        className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 text-left rounded-lg hover:bg-gray-100"
      >
        Sign out
      </button>
    </nav>
  );
}
