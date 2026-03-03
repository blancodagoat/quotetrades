import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('quote_templates')
    .select('*, quote_template_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, items } = body;
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const { data: tmpl, error: tErr } = await supabase
    .from('quote_templates')
    .insert({ user_id: user.id, name })
    .select()
    .single();

  if (tErr) return NextResponse.json({ error: tErr.message }, { status: 500 });

  const lineItems: { description: string; quantity: number; unit_price_cents: number }[] =
    items || [];
  if (lineItems.length > 0) {
    await supabase.from('quote_template_items').insert(
      lineItems.map((item, idx) => ({
        template_id: tmpl.id,
        description: item.description,
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
        sort_order: idx,
      })),
    );
  }

  return NextResponse.json(tmpl, { status: 201 });
}
