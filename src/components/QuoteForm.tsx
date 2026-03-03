'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import type { QuoteTemplate, QuoteTemplateItem } from '@/types';

type Lead = { id: string; name: string };
type TemplateWithItems = QuoteTemplate & { quote_template_items: QuoteTemplateItem[] };
type LineItem = { description: string; quantity: string; unit_price: string };

type Props = {
  leads: Lead[];
  templates: TemplateWithItems[];
  defaultLeadId?: string;
};

function emptyItem(): LineItem {
  return { description: '', quantity: '1', unit_price: '' };
}

function cents(n: number) { return `$${(n / 100).toFixed(2)}`; }

export default function QuoteForm({ leads, templates, defaultLeadId }: Props) {
  const router = useRouter();
  const [leadId, setLeadId] = useState(defaultLeadId ?? (leads[0]?.id ?? ''));
  const [title, setTitle] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([emptyItem()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function loadTemplate(templateId: string) {
    const tmpl = templates.find((t) => t.id === templateId);
    if (!tmpl) return;
    const sorted = [...tmpl.quote_template_items].sort((a, b) => a.sort_order - b.sort_order);
    setItems(
      sorted.map((i) => ({
        description: i.description,
        quantity: String(i.quantity),
        unit_price: (i.unit_price_cents / 100).toFixed(2),
      })),
    );
  }

  function setItem(idx: number, field: keyof LineItem, value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  function addItem() { setItems((prev) => [...prev, emptyItem()]); }
  function removeItem(idx: number) { setItems((prev) => prev.filter((_, i) => i !== idx)); }

  const total = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = Math.round((parseFloat(it.unit_price) || 0) * 100);
    return sum + Math.round(qty * price);
  }, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      lead_id: leadId,
      title,
      valid_until: validUntil || null,
      notes: notes || null,
      items: items
        .filter((it) => it.description.trim())
        .map((it) => ({
          description: it.description,
          quantity: parseFloat(it.quantity) || 1,
          unit_price_cents: Math.round((parseFloat(it.unit_price) || 0) * 100),
        })),
    };

    const res = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const j = await res.json();
      setError(j.error ?? 'Something went wrong');
      setLoading(false);
      return;
    }

    const saved = await res.json();
    router.push(`/quotes/${saved.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Lead <span className="text-red-500">*</span></label>
          <select required value={leadId} onChange={(e) => setLeadId(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            <option value="">— Select lead —</option>
            {leads.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        {templates.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Load template</label>
            <select onChange={(e) => { if (e.target.value) loadTemplate(e.target.value); }}
              className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">— No template —</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Quote title <span className="text-red-500">*</span></label>
        <input required value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Drain repair — 14 Oak St"
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Valid until</label>
        <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {/* Line items */}
      <div>
        <label className="block text-sm font-medium mb-2">Line items</label>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                placeholder="Description"
                value={item.description}
                onChange={(e) => setItem(idx, 'description', e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number" min="0.01" step="0.01" placeholder="Qty"
                value={item.quantity}
                onChange={(e) => setItem(idx, 'quantity', e.target.value)}
                className="w-16 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number" min="0" step="0.01" placeholder="Unit $"
                value={item.unit_price}
                onChange={(e) => setItem(idx, 'unit_price', e.target.value)}
                className="w-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => removeItem(idx)}
                className="text-gray-400 hover:text-red-500 px-2 py-2"><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addItem}
          className="mt-2 text-sm text-blue-600 hover:underline">
          + Add line item
        </button>
        {total > 0 && (
          <p className="mt-3 text-right font-semibold text-sm">
            Total: {cents(total)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
        {loading ? 'Creating…' : 'Create quote'}
      </button>
    </form>
  );
}
