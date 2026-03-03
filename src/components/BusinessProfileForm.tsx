'use client';

import { useState } from 'react';
import type { BusinessProfile } from '@/types';

type Props = { profile: BusinessProfile | null };

export default function BusinessProfileForm({ profile }: Props) {
  const [companyName, setCompanyName] = useState(profile?.company_name ?? '');
  const [email, setEmail] = useState(profile?.email ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setSuccess(false); setError('');
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_name: companyName, email, phone, address }),
    });
    if (res.ok) { setSuccess(true); }
    else { const j = await res.json(); setError(j.error ?? 'Error saving profile.'); }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && <p className="text-green-600 text-sm bg-green-50 rounded-lg px-3 py-2">Profile saved.</p>}
      {error  && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      <div>
        <label className="block text-sm font-medium mb-1">Company name</label>
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Plumbing"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <p className="text-xs text-gray-400">This info is copied onto quotes when you send them.</p>
      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
        {loading ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
