import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import AcceptQuoteButton from '@/components/AcceptQuoteButton';
import type { QuoteItem } from '@/types';
import { Metadata } from 'next';

function cents(n: number) { return `$${(n / 100).toFixed(2)}`; }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from('quotes')
    .select('title, biz_name')
    .eq('public_slug', slug)
    .eq('status', 'sent')
    .single();

  if (!quote) return { title: 'Quote' };

  return {
    title: `${quote.title} - Quote from ${quote.biz_name || 'Business'}`,
  };
}

export default async function PublicQuotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, quote_items(*)')
    .eq('public_slug', slug)
    .eq('status', 'sent')
    .single();

  if (!quote) notFound();

  const items: QuoteItem[] = (quote.quote_items ?? []).sort(
    (a: QuoteItem, b: QuoteItem) => a.sort_order - b.sort_order,
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Business header */}
        {quote.biz_name && (
          <div className="mb-8">
            <h2 className="text-xl font-bold">{quote.biz_name}</h2>
            <div className="text-sm text-gray-500 mt-1">
              {[quote.biz_phone, quote.biz_email].filter(Boolean).join(' · ')}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-1">{quote.title}</h1>

          {/* Client info */}
          {quote.client_name && (
            <div className="mb-4 text-sm text-gray-600">
              <span className="font-medium">Prepared for:</span>{' '}
              {quote.client_name}
              {quote.client_phone ? ` · ${quote.client_phone}` : ''}
            </div>
          )}

          <div className="text-sm text-gray-500 mb-1">
            Date: {new Date(quote.created_at).toLocaleDateString()}
          </div>
          {quote.valid_until && (
            <div className="text-sm text-gray-500 mb-4">
              Valid until: {new Date(quote.valid_until).toLocaleDateString()}
            </div>
          )}

          <hr className="my-4" />

          {/* Line items */}
          <table className="w-full text-sm mb-4">
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
            <div className="border-t pt-4 text-sm text-gray-600 whitespace-pre-wrap mb-4">
              {quote.notes}
            </div>
          )}

          {/* Accept button */}
          {quote.status === 'sent' && (
            <div className="mt-6 border-t pt-6">
              <AcceptQuoteButton quoteId={quote.id} slug={slug} />
            </div>
          )}

          {quote.status === 'accepted' && (
            <div className="mt-6 border-t pt-6 text-center">
              <p className="text-green-600 font-medium text-lg"><Check className="w-4 h-4 inline" /> Quote accepted</p>
              <p className="text-sm text-gray-500 mt-1">We&apos;ll be in touch shortly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
