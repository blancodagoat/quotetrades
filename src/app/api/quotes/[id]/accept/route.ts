import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json().catch(() => ({}));
  const token: string | undefined = body?.token;

  const { data: { user } } = await supabase.auth.getUser();

  const { data: quote, error: qErr } = await supabase
    .from('quotes')
    .select('id, public_slug, status, lead_id, user_id')
    .eq('id', id)
    .single();

  if (qErr || !quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  const isPublic = !!token;
  const isValidToken = token === quote.public_slug;
  const canAccept = (isPublic && isValidToken) || (!isPublic && user && quote.user_id === user.id);

  if (!canAccept) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (quote.status !== 'sent') {
    return NextResponse.json({ error: 'Quote cannot be accepted in current state' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('quotes')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update lead status to 'accepted' if quote accepted
  if (data?.lead_id) {
    const { error: leadError } = await supabase
      .from('leads')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', data.lead_id);
    if (leadError) console.error('Failed to update lead status:', leadError.message);
  }

  return NextResponse.json(data);
}
