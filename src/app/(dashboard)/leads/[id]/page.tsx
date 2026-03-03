import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LeadForm from '@/components/LeadForm';
import type { LeadStatus, QuoteStatus } from '@/types';

const STATUS_COLORS: Record<LeadStatus, string> = {
  new:      'bg-blue-100 text-blue-700',
  quoted:   'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  done:     'bg-gray-100 text-gray-600',
};

const Q_STATUS_COLORS: Record<QuoteStatus, string> = {
  draft:    'bg-gray-100 text-gray-600',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

function cents(n: number) {
  return `$${(n / 100).toFixed(2)}`;
}

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: lead } = await supabase
    .from('leads')
    .select('*, quotes(id, title, status, total_cents, created_at)')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single();

  if (!lead) notFound();

  const quotes = (lead.quotes ?? []) as { id: string; title: string; status: QuoteStatus; total_cents: number; created_at: string }[];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/leads" className="text-gray-500 hover:text-gray-700 text-sm">← Leads</a>
        <h1 className="text-2xl font-bold">{lead.name}</h1>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status as LeadStatus]}`}>
          {lead.status}
        </span>
      </div>

      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="font-semibold mb-4">Lead details</h2>
        <LeadForm lead={lead} />
      </div>

      {/* Quotes for this lead */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Quotes</h2>
          <a href={`/quotes/new?lead_id=${lead.id}`}
            className="text-sm text-blue-600 hover:underline">
            + Create quote
          </a>
        </div>
        {quotes.length > 0 ? (
          <div className="divide-y">
            {quotes.map((q) => (
              <a key={q.id} href={`/quotes/${q.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded">
                <div>
                  <p className="font-medium text-sm">{q.title}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{cents(q.total_cents)}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${Q_STATUS_COLORS[q.status]}`}>
                    {q.status}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No quotes yet.</p>
        )}
      </div>
    </div>
  );
}
