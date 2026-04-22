import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Wrench,
  Zap,
  Droplet,
  TreePine,
  Home as HomeIcon,
  Hammer,
  ClipboardList,
  FileText,
  Send,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect('/dashboard');

  const trades = [
    { label: 'HVAC', Icon: Wrench },
    { label: 'Electrical', Icon: Zap },
    { label: 'Plumbing', Icon: Droplet },
    { label: 'Landscaping', Icon: TreePine },
    { label: 'Roofing', Icon: HomeIcon },
    { label: 'Flooring', Icon: Hammer },
  ];

  const steps = [
    {
      n: 1,
      title: 'Capture the lead',
      body: 'Name, address, the job. Thirty seconds in the truck.',
      Icon: ClipboardList,
    },
    {
      n: 2,
      title: 'Build the quote',
      body: 'Itemize parts and labor. Markup, tax, notes. Save as a template for next time.',
      Icon: FileText,
    },
    {
      n: 3,
      title: 'Send. They accept. Done.',
      body: 'Shareable link goes to the client. They tap Accept. You get a signed PDF.',
      Icon: Send,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            quotetrades
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-700 underline-offset-4 hover:text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start free
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="bg-blue-50/60 border-b border-gray-200">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]">
                Quotes out before you leave the driveway.
              </h1>
              <p className="mt-6 text-lg md:text-xl text-neutral-700 max-w-2xl leading-relaxed">
                On-site estimates beat office CRMs. Capture the lead, itemize the job, send a
                link. Your client taps Accept — you get the signed PDF.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Start free
                </Link>
                <Link
                  href="#sample"
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-base font-semibold text-neutral-800 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  See a sample quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trade-target strip */}
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-4">
              Built for the trades
            </p>
            <ul className="flex flex-wrap gap-3">
              {trades.map(({ label, Icon }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800"
                >
                  <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="sample" className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-neutral-600 max-w-2xl">
              Three steps from driveway to signed quote. No training day required.
            </p>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map(({ n, title, body, Icon }) => (
                <li
                  key={n}
                  className="rounded-xl border border-gray-200 bg-white p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                      {n}
                    </span>
                    <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                    {body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Why not a CRM */}
        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="max-w-3xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Why not a CRM?
              </h2>
              <p className="mt-3 text-neutral-600">
                You don&apos;t need a sales team&apos;s toolchain to send a quote.
              </p>
            </div>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              <li className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold">No seat licenses.</h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Your crew isn&apos;t a line item. Flat pricing, not per-user tax.
                </p>
              </li>
              <li className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold">
                  No pipeline stages you don&apos;t use.
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  Lead, quote, accepted. That&apos;s the funnel. No &ldquo;nurture sequence.&rdquo;
                </p>
              </li>
              <li className="rounded-xl border border-gray-200 p-6">
                <h3 className="text-base font-semibold">
                  No upsells to an &ldquo;Enterprise&rdquo; plan.
                </h3>
                <p className="mt-2 text-sm text-neutral-600">
                  One product. Everything&apos;s in. No call with sales to unlock PDF export.
                </p>
              </li>
            </ul>
          </div>
        </section>

        {/* CTA strip */}
        <section className="bg-blue-600">
          <div className="mx-auto max-w-6xl px-6 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Ready to send a quote today?
            </h2>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
            >
              Start free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-neutral-600">
          <div className="font-semibold text-neutral-800">quotetrades</div>
          <nav className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-blue-600">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-blue-600">
              Terms
            </Link>
            <span>© {new Date().getFullYear()} quotetrades</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
