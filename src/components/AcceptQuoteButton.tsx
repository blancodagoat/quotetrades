'use client';

import { useState } from 'react';

type Props = { quoteId: string; slug: string };

export default function AcceptQuoteButton({ quoteId, slug }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleAccept() {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/quotes/${quoteId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: slug }),
    });
    if (res.ok) {
      setAccepted(true);
    } else {
      const j = await res.json();
      setError(j.error ?? 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  if (accepted) {
    return (
      <div className="text-center">
        <p className="text-green-600 font-medium text-lg">✓ Quote accepted!</p>
        <p className="text-sm text-gray-500 mt-1">Thank you. We&apos;ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="text-gray-700 mb-4 text-sm">
        By clicking below, you confirm you&apos;d like to proceed with this quote.
      </p>
      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      <button onClick={handleAccept} disabled={loading}
        className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-60">
        {loading ? 'Accepting…' : 'Accept this quote'}
      </button>
    </div>
  );
}
