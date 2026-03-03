'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuoteStatus } from '@/types';

type Props = { quoteId: string; status: QuoteStatus; hasSlug: boolean };

export default function QuoteActions({ quoteId, status, hasSlug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  async function send() {
    setLoading('send'); setError('');
    const res = await fetch(`/api/quotes/${quoteId}/send`, { method: 'POST' });
    if (!res.ok) { const j = await res.json(); setError(j.error ?? 'Error'); }
    setLoading('');
    router.refresh();
  }

  async function setStatus(newStatus: QuoteStatus) {
    setLoading(newStatus); setError('');
    const res = await fetch(`/api/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) { const j = await res.json(); setError(j.error ?? 'Error'); }
    setLoading('');
    router.refresh();
  }

  async function deleteQuote() {
    if (!confirm('Delete this quote?')) return;
    await fetch(`/api/quotes/${quoteId}`, { method: 'DELETE' });
    router.push('/quotes');
    router.refresh();
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <div className="flex flex-wrap gap-2">
        {status === 'draft' && (
          <button onClick={send} disabled={loading === 'send'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {loading === 'send' ? 'Sending…' : 'Send quote'}
          </button>
        )}

        {status === 'sent' && !hasSlug && (
          <button onClick={send} disabled={loading === 'send'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 transition-colors">
            {loading === 'send' ? '…' : 'Re-generate link'}
          </button>
        )}

        {(status === 'sent') && (
          <button onClick={() => setStatus('accepted')} disabled={!!loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors">
            Mark accepted
          </button>
        )}

        {(status === 'sent') && (
          <button onClick={() => setStatus('declined')} disabled={!!loading}
            className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-60 transition-colors">
            Mark declined
          </button>
        )}

        <a href={`/api/quotes/${quoteId}/pdf`} target="_blank"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          Download PDF
        </a>

        <button onClick={deleteQuote}
          className="text-sm text-red-500 hover:text-red-700 px-2 py-2 transition-colors">
          Delete
        </button>
      </div>
    </div>
  );
}
