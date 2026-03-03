import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createElement } from 'react';
import { createClient } from '@/lib/supabase/server';
import { QuotePDF } from '@/lib/pdf';
import type { QuoteItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('quotes')
    .select('*, quote_items(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Quote not found' }, { status: 404 });

  const items: QuoteItem[] = (data.quote_items ?? []).sort(
    (a: QuoteItem, b: QuoteItem) => a.sort_order - b.sort_order,
  );

  const buffer = await renderToBuffer(createElement(QuotePDF, { quote: data, items }));

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="quote-${data.id.slice(0, 8)}.pdf"`,
    },
  });
}
