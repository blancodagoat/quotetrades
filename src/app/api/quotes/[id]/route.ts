import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('quotes')
    .select('*, leads(name, phone, email, address), quote_items(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { title, valid_until, notes, items, status } = body;

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (title       !== undefined) update.title       = title;
  if (valid_until !== undefined) update.valid_until = valid_until || null;
  if (notes       !== undefined) update.notes       = notes || null;
  if (status      !== undefined) update.status      = status;

  if (items !== undefined) {
    const lineItems: { description: string; quantity: number; unit_price_cents: number }[] = items;
    update.total_cents = lineItems.reduce(
      (sum, i) => sum + Math.round(i.quantity * i.unit_price_cents),
      0,
    );

    // Replace all items
    const { error: deleteError } = await supabase.from('quote_items').delete().eq('quote_id', id);
    if (deleteError) return NextResponse.json({ error: 'Failed to remove existing line items' }, { status: 500 });
    if (lineItems.length > 0) {
      const { error: insertError } = await supabase.from('quote_items').insert(
        lineItems.map((item, idx) => ({
          quote_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          sort_order: idx,
        })),
      );
      if (insertError) return NextResponse.json({ error: 'Failed to update line items' }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from('quotes')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
