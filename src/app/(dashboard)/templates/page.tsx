import { createClient } from '@/lib/supabase/server';
import TemplateList from '@/components/TemplateList';

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: templates } = await supabase
    .from('quote_templates')
    .select('*, quote_template_items(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Quote templates</h1>
      <p className="text-sm text-gray-500 mb-6">
        Templates let you pre-fill line items when creating a new quote. Useful for standard jobs.
      </p>
      <TemplateList templates={templates ?? []} />
    </div>
  );
}
