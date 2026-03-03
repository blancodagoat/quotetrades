import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { name, items } = body;
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name !== undefined) update.name = name;

  const { data, error } = await supabase
    .from('quote_templates')
    .update(update)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (items !== undefined) {
    await supabase.from('quote_template_items').delete().eq('template_id', params.id);
    const lineItems: { description: string; quantity: number; unit_price_cents: number }[] = items;
    if (lineItems.length > 0) {
      await supabase.from('quote_template_items').insert(
        lineItems.map((item, idx) => ({
          template_id: params.id,
          description: item.description,
          quantity: item.quantity,
          unit_price_cents: item.unit_price_cents,
          sort_order: idx,
        })),
      );
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { error } = await supabase
    .from('quote_templates')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
