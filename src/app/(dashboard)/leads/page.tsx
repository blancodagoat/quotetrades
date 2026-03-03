import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { LeadStatus } from '@/types';
import { TableSkeleton } from '@/components/Skeleton';

const STATUS_COLORS: Record<LeadStatus, string> = {
  new:      'bg-blue-100 text-blue-700',
  quoted:   'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  done:     'bg-gray-100 text-gray-600',
};

async function LeadsContent({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  return (
    <>
      {/* Filters */}
      <form method="GET" className="flex gap-2 mb-5 flex-wrap">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search by name…"
          className="border rounded-lg px-3 py-2 text-sm flex-1 min-w-[160px]"
        />
        <select name="status" defaultValue={params.status ?? ''}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {['new', 'quoted', 'accepted', 'declined', 'done'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button type="submit"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700">
          Filter
        </button>
      </form>

      {/* Data */}
      <LeadsList status={params.status} q={params.q} />
    </>
  );
}

async function LeadsList({ status, q }: { status?: string; q?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('leads')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (q)      query = query.ilike('name', `%${q}%`);

  const { data: leads } = await query;

  if (leads && leads.length > 0) {
    return (
      <div className="bg-white rounded-lg border divide-y">
        {leads.map((lead) => (
          <Link key={lead.id} href={`/leads/${lead.id}`}
            className="flex items-center justify-between px-4 py-4 hover:bg-gray-50">
            <div className="min-w-0">
              <p className="font-medium truncate">{lead.name}</p>
              <p className="text-sm text-gray-500 truncate">
                {[lead.job_type, lead.phone, lead.email].filter(Boolean).join(' · ')}
              </p>
            </div>
            <div className="ml-4 flex flex-col items-end gap-1 shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status as LeadStatus]}`}>
                {lead.status}
              </span>
              {lead.scheduled_at && (
                <span className="text-xs text-gray-400">
                  {new Date(lead.scheduled_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-8 text-center">
      <p className="text-gray-500 text-sm mb-4">No leads found.</p>
      <Link href="/leads/new" className="text-blue-600 hover:underline text-sm">
        Create your first lead
      </Link>
    </div>
  );
}

export default function LeadsPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Leads</h1>
        <Link href="/leads/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New lead
        </Link>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <LeadsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
