import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: Promise<{ id: string }> };

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
  const { name, items } = body;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) update.name = name;

  const { data, error } = await supabase
    .from('quote_templates')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (items !== undefined) {
    const { error: deleteError } = await supabase.from('quote_template_items').delete().eq('template_id', id);
    if (deleteError) return NextResponse.json({ error: 'Failed to remove existing template items' }, { status: 500 });
    const lineItems: { description: string; quantity: number; unit_price_cents: number }[] = items;
    if (lineItems.length > 0) {
      const { error: insertError } = await supabase.from('quote_template_items').insert(
        lineItems.map((item, idx) => ({
          template_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          sort_order: idx,
        })),
      );
      if (insertError) return NextResponse.json({ error: 'Failed to update template items' }, { status: 500 });
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('quote_templates')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
