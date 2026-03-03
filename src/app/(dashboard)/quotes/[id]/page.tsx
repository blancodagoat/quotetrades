import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import QuoteActions from '@/components/QuoteActions';
import CopyableQuoteLink from '@/components/CopyableQuoteLink';
import type { QuoteStatus, QuoteItem } from '@/types';

const STATUS_COLORS: Record<QuoteStatus, string> = {
  draft:    'bg-gray-100 text-gray-700',
  sent:     'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

function cents(n: number) { return `$${(n / 100).toFixed(2)}`; }

export default async function QuoteDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, leads(name, phone, email), quote_items(*)')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single();

  if (!quote) notFound();

  const items: QuoteItem[] = (quote.quote_items ?? []).sort(
    (a: QuoteItem, b: QuoteItem) => a.sort_order - b.sort_order,
  );
  const lead = quote.leads as { name: string; phone: string | null; email: string | null } | null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const publicUrl = quote.public_slug ? `${appUrl}/quote/${quote.public_slug}` : null;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <a href="/quotes" className="text-gray-500 hover:text-gray-700 text-sm">← Quotes</a>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{quote.title}</h1>
          {lead && (
            <p className="text-gray-500 text-sm mt-1">
              {lead.name}{lead.phone ? ` · ${lead.phone}` : ''}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium mt-1 ${STATUS_COLORS[quote.status as QuoteStatus]}`}>
          {quote.status}
        </span>
      </div>

      {/* Quote meta */}
      <div className="bg-white rounded-lg border p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p className="text-gray-500">Created</p>
            <p>{new Date(quote.created_at).toLocaleDateString()}</p>
          </div>
          {quote.valid_until && (
            <div>
              <p className="text-gray-500">Valid until</p>
              <p>{new Date(quote.valid_until).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Line items */}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500 text-left">
              <th className="pb-2 font-medium">Description</th>
              <th className="pb-2 font-medium text-right w-16">Qty</th>
              <th className="pb-2 font-medium text-right w-24">Unit price</th>
              <th className="pb-2 font-medium text-right w-24">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="py-2">{item.description}</td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{cents(item.unit_price_cents)}</td>
                <td className="py-2 text-right">
                  {cents(Math.round(item.quantity * item.unit_price_cents))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t font-bold">
              <td colSpan={3} className="pt-3 text-right">Total</td>
              <td className="pt-3 text-right">{cents(quote.total_cents)}</td>
            </tr>
          </tfoot>
        </table>

        {quote.notes && (
          <div className="mt-4 border-t pt-3 text-sm text-gray-600">
            <p className="font-medium mb-1">Notes</p>
            <p className="whitespace-pre-wrap">{quote.notes}</p>
          </div>
        )}
      </div>

      {/* Shareable link */}
      {publicUrl && (
        <div className="mb-4">
          <CopyableQuoteLink url={publicUrl} />
        </div>
      )}

      {/* Actions */}
      <QuoteActions quoteId={quote.id} status={quote.status as QuoteStatus} hasSlug={!!quote.public_slug} />
    </div>
  );
}
