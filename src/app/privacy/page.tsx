import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy — quotetrades',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <nav className="mb-12">
        <Link
          href="/"
          className="text-sm text-neutral-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm"
        >
          ← quotetrades
        </Link>
      </nav>

      <h1 className="text-3xl font-semibold mb-6">Privacy</h1>
      <p className="text-sm text-neutral-500 mb-8">Placeholder — full policy in progress.</p>

      <div className="text-neutral-700 space-y-4 leading-relaxed">
        <p>Short version while we draft the long one:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>We collect what we need to run the service — your business profile, leads, quotes, and client contact info you enter.</li>
          <li>We don&apos;t sell your data.</li>
          <li>Your data lives in Supabase (Postgres). Quote PDFs are rendered on demand, not archived externally.</li>
          <li>You can delete your account and your data at any time.</li>
        </ul>
        <p>
          Questions? Email{' '}
          <a href="mailto:hello@quotetrades.example" className="underline hover:text-blue-600">
            hello@quotetrades.example
          </a>
          .
        </p>
      </div>
    </main>
  );
}
