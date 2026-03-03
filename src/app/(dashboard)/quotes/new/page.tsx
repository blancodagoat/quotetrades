import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import QuoteForm from '@/components/QuoteForm';

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: { lead_id?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: leads }, { data: templates }] = await Promise.all([
    supabase.from('leads').select('id, name').eq('user_id', user!.id).order('name'),
    supabase.from('quote_templates').select('*, quote_template_items(*)').eq('user_id', user!.id).order('name'),
  ]);

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/quotes" className="text-gray-500 hover:text-gray-700 text-sm"><ArrowLeft className="w-4 h-4 inline" /> Quotes</Link>
        <h1 className="text-2xl font-bold">New quote</h1>
      </div>
      <div className="bg-white rounded-lg border p-6">
        <QuoteForm
          leads={leads ?? []}
          templates={templates ?? []}
          defaultLeadId={searchParams.lead_id}
        />
      </div>
    </div>
  );
}
