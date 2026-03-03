import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import type { QuoteStatus } from '@/types';
import { TableSkeleton } from '@/components/Skeleton';

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`;
}

async function QuotesContent({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const params = await searchParams;
  return (
    <>
      <form method="GET" className="flex gap-2 mb-5">
        <select name="status" defaultValue={params.status ?? ''}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {['draft', 'sent', 'accepted', 'declined'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button type="submit"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
          Filter
        </button>
      </form>

      <QuotesList status={params.status} />
    </>
  );
}

async function QuotesList({ status }: { status?: string }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('quotes')
    .select('*, leads(name)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data: quotes } = await query;

  if (quotes && quotes.length > 0) {
    return (
      <div className="bg-white rounded-lg border divide-y">
        {quotes.map((q) => {
          const lead = q.leads as { name: string } | null;
          return (
            <a key={q.id} href={`/quotes/${q.id}`}
              className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
              <div className="min-w-0">
                <p className="font-medium truncate">{q.title}</p>
                <p className="text-sm text-gray-500">{lead?.name ?? '—'}</p>
              </div>
              <div className="ml-4 flex items-center gap-4 shrink-0">
                <span className="font-medium text-sm">{cents(q.total_cents)}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[q.status as QuoteStatus]}`}>
                  {q.status}
                </span>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-8 text-center">
      <p className="text-gray-500 text-sm mb-4">No quotes yet.</p>
      <a href="/quotes/new" className="text-blue-600 hover:underline text-sm">
        Create your first quote
      </a>
    </div>
  );
}

export default function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <a href="/quotes/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New quote
        </a>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <QuotesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
