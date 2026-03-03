import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { Quote, QuoteItem } from '@/types';

const s = StyleSheet.create({
  page:      { fontFamily: 'Helvetica', fontSize: 10, padding: 40, color: '#111' },
  header:    { marginBottom: 24 },
  biz:       { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  bizSub:    { color: '#555', marginBottom: 2 },
  divider:   { borderBottom: '1pt solid #ddd', marginVertical: 16 },
  row2:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  label:     { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  title:     { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  table:     { marginTop: 8 },
  th:        { flexDirection: 'row', backgroundColor: '#f3f4f6', padding: '6 8', fontFamily: 'Helvetica-Bold' },
  tr:        { flexDirection: 'row', padding: '6 8', borderBottom: '0.5pt solid #eee' },
  col1:      { flex: 1 },
  col2:      { width: 50, textAlign: 'right' },
  col3:      { width: 70, textAlign: 'right' },
  col4:      { width: 70, textAlign: 'right' },
  totals:    { marginTop: 12, alignItems: 'flex-end' },
  totalRow:  { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 4 },
  totalLabel:{ width: 80, fontFamily: 'Helvetica-Bold' },
  totalVal:  { width: 80, textAlign: 'right', fontFamily: 'Helvetica-Bold', fontSize: 12 },
  notes:     { marginTop: 20, color: '#444' },
  footer:    { marginTop: 32, textAlign: 'center', color: '#999', fontSize: 9 },
});

function cents(n: number): string {
  return `$${(n / 100).toFixed(2)}`;
}

type Props = { quote: Quote; items: QuoteItem[] };

export function QuotePDF({ quote, items }: Props) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Business header */}
        <View style={s.header}>
          {quote.biz_name ? <Text style={s.biz}>{quote.biz_name}</Text> : null}
          {quote.biz_phone ? <Text style={s.bizSub}>{quote.biz_phone}</Text> : null}
          {quote.biz_email ? <Text style={s.bizSub}>{quote.biz_email}</Text> : null}
        </View>

        <View style={s.divider} />

        {/* Quote title + client block */}
        <View style={s.row2}>
          <View>
            <Text style={s.title}>{quote.title}</Text>
            <Text style={{ color: '#555' }}>
              Date: {new Date(quote.created_at).toLocaleDateString()}
            </Text>
            {quote.valid_until ? (
              <Text style={{ color: '#555' }}>
                Valid until: {new Date(quote.valid_until).toLocaleDateString()}
              </Text>
            ) : null}
          </View>
          <View>
            <Text style={s.label}>Prepared for</Text>
            {quote.client_name  ? <Text>{quote.client_name}</Text>   : null}
            {quote.client_phone ? <Text>{quote.client_phone}</Text>  : null}
            {quote.client_email ? <Text>{quote.client_email}</Text>  : null}
            {quote.client_address ? <Text>{quote.client_address}</Text> : null}
          </View>
        </View>

        {/* Line items */}
        <View style={s.table}>
          <View style={s.th}>
            <Text style={s.col1}>Description</Text>
            <Text style={s.col2}>Qty</Text>
            <Text style={s.col3}>Unit price</Text>
            <Text style={s.col4}>Total</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={s.tr}>
              <Text style={s.col1}>{item.description}</Text>
              <Text style={s.col2}>{item.quantity}</Text>
              <Text style={s.col3}>{cents(item.unit_price_cents)}</Text>
              <Text style={s.col4}>
                {cents(Math.round(item.quantity * item.unit_price_cents))}
              </Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={s.totals}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalVal}>{cents(quote.total_cents)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes ? (
          <View style={s.notes}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>Notes</Text>
            <Text>{quote.notes}</Text>
          </View>
        ) : null}

        <Text style={s.footer}>Thank you for your business.</Text>
      </Page>
    </Document>
  );
}
