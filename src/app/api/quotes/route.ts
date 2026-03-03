import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('quotes')
    .select('*, leads(name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { lead_id, title, valid_until, notes, items } = body;

  if (!lead_id || !title)
    return NextResponse.json({ error: 'lead_id and title are required' }, { status: 400 });

  // Verify the lead belongs to this user
  const { data: lead, error: leadErr } = await supabase
    .from('leads')
    .select('id')
    .eq('id', lead_id)
    .eq('user_id', user.id)
    .single();

  if (leadErr || !lead)
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });

  const lineItems: { description: string; quantity: number; unit_price_cents: number }[] =
    items || [];

  const total_cents = lineItems.reduce(
    (sum, i) => sum + Math.round(i.quantity * i.unit_price_cents),
    0,
  );

  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .insert({
      user_id: user.id,
      lead_id,
      title,
      total_cents,
      valid_until: valid_until || null,
      notes: notes || null,
    })
    .select()
    .single();

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  if (lineItems.length > 0) {
    const rows = lineItems.map((item, idx) => ({
      quote_id: quote.id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      sort_order: idx,
    }));
    const { error: iErr } = await supabase.from('quote_items').insert(rows);
    if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });
  }

  return NextResponse.json(quote, { status: 201 });
}
