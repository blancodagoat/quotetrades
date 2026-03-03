'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Lead, LeadStatus, LeadSource } from '@/types';

const SOURCES: LeadSource[] = ['call', 'web', 'referral', 'other'];
const STATUSES: LeadStatus[] = ['new', 'quoted', 'accepted', 'declined', 'done'];

type Props = { lead?: Lead };

export default function LeadForm({ lead }: Props) {
  const router = useRouter();
  const [name, setName] = useState(lead?.name ?? '');
  const [phone, setPhone] = useState(lead?.phone ?? '');
  const [email, setEmail] = useState(lead?.email ?? '');
  const [address, setAddress] = useState(lead?.address ?? '');
  const [jobType, setJobType] = useState(lead?.job_type ?? '');
  const [notes, setNotes] = useState(lead?.notes ?? '');
  const [source, setSource] = useState<LeadSource>(lead?.source ?? 'call');
  const [status, setStatus] = useState<LeadStatus>(lead?.status ?? 'new');
  const [scheduledAt, setScheduledAt] = useState(
    lead?.scheduled_at ? lead.scheduled_at.slice(0, 16) : '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name, phone, email, address, job_type: jobType, notes, source, status,
      scheduled_at: scheduledAt || null,
    };

    const res = lead
      ? await fetch(`/api/leads/${lead.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      : await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });

    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? 'Something went wrong');
      setLoading(false);
      return;
    }

    const saved = await res.json();
    router.push(`/leads/${saved.id}`);
    router.refresh();
  }

  async function handleDelete() {
    if (!lead || !confirm('Delete this lead?')) return;
    await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' });
    router.push('/leads');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div>
        <label className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
        <input required value={name} onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Job type</label>
        <input value={jobType} onChange={(e) => setJobType(e.target.value)}
          placeholder="e.g. Drain blockage, Lawn mowing…"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Source</label>
          <select value={source} onChange={(e) => setSource(e.target.value as LeadSource)}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            {SOURCES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Schedule date / time</label>
        <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Saving…' : lead ? 'Save changes' : 'Create lead'}
        </button>
        {lead && (
          <button type="button" onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700">
            Delete lead
          </button>
        )}
      </div>
    </form>
  );
}
