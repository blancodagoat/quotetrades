import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ count: leadCount }, { count: quoteCount }, { data: recentLeads }] =
    await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('quotes').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
      supabase.from('leads').select('id, name, status, job_type, created_at')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  const statusColor: Record<string, string> = {
    new:      'bg-blue-100 text-blue-700',
    quoted:   'bg-yellow-100 text-yellow-700',
    accepted: 'bg-green-100 text-green-700',
    declined: 'bg-red-100 text-red-700',
    done:     'bg-gray-100 text-gray-600',
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Total leads</p>
          <p className="text-3xl font-bold mt-1">{leadCount ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg border p-5">
          <p className="text-sm text-gray-500">Total quotes</p>
          <p className="text-3xl font-bold mt-1">{quoteCount ?? 0}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8">
        <a href="/leads/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          + New lead
        </a>
        <a href="/quotes/new"
          className="bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
          + New quote
        </a>
      </div>

      <h2 className="font-semibold text-gray-700 mb-3">Recent leads</h2>
      {recentLeads && recentLeads.length > 0 ? (
        <div className="bg-white rounded-lg border divide-y">
          {recentLeads.map((lead) => (
            <a key={lead.id} href={`/leads/${lead.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div>
                <p className="font-medium">{lead.name}</p>
                {lead.job_type && (
                  <p className="text-sm text-gray-500">{lead.job_type}</p>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[lead.status]}`}>
                {lead.status}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No leads yet. <a href="/leads/new" className="text-blue-600 hover:underline">Add your first lead.</a></p>
      )}
    </div>
  );
}
