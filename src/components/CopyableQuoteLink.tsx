'use client';

import { useState } from 'react';

export default function CopyableQuoteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-blue-600 font-medium mb-1">Shareable link</p>
        <p className="text-sm text-blue-800 truncate">{url}</p>
      </div>
      <button onClick={copy}
        className="shrink-0 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700">
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
