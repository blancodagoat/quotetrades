import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateSlug } from '@/lib/slug';

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch quote + lead + business profile for snapshot
  const [{ data: quote, error: qErr }, { data: profile }] = await Promise.all([
    supabase
      .from('quotes')
      .select('*, leads(name, phone, email, address)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('business_profiles')
      .select('company_name, phone, email')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (qErr || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  const lead = (quote as { leads: { name: string; phone: string | null; email: string | null; address: string | null } | null }).leads;

  const slug = quote.public_slug ?? generateSlug();

  const { data, error } = await supabase
    .from('quotes')
    .update({
      status: 'sent',
      public_slug: slug,
      client_name:    lead?.name    ?? null,
      client_phone:   lead?.phone   ?? null,
      client_email:   lead?.email   ?? null,
      client_address: lead?.address ?? null,
      biz_name:  profile?.company_name ?? null,
      biz_phone: profile?.phone        ?? null,
      biz_email: profile?.email        ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
