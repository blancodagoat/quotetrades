'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuoteTemplate, QuoteTemplateItem } from '@/types';

type TemplateWithItems = QuoteTemplate & { quote_template_items: QuoteTemplateItem[] };
type LineItem = { description: string; quantity: string; unit_price: string };

function emptyItem(): LineItem { return { description: '', quantity: '1', unit_price: '0' }; }

export default function TemplateList({ templates }: { templates: TemplateWithItems[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newItems, setNewItems] = useState<LineItem[]>([emptyItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setItem(idx: number, field: keyof LineItem, value: string) {
    setNewItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  }

  async function createTemplate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName,
        items: newItems.filter((it) => it.description.trim()).map((it) => ({
          description: it.description,
          quantity: parseFloat(it.quantity) || 1,
          unit_price_cents: Math.round((parseFloat(it.unit_price) || 0) * 100),
        })),
      }),
    });
    if (!res.ok) { const j = await res.json(); setError(j.error ?? 'Error'); }
    else { setCreating(false); setNewName(''); setNewItems([emptyItem()]); router.refresh(); }
    setSaving(false);
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Delete template?')) return;
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {templates.map((tmpl) => (
        <div key={tmpl.id} className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium">{tmpl.name}</p>
            <button onClick={() => deleteTemplate(tmpl.id)}
              className="text-xs text-red-500 hover:text-red-700">Delete</button>
          </div>
          {tmpl.quote_template_items.length > 0 ? (
            <ul className="text-sm text-gray-600 space-y-1">
              {tmpl.quote_template_items
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>${(item.unit_price_cents / 100).toFixed(2)} × {item.quantity}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No items.</p>
          )}
        </div>
      ))}

      {creating ? (
        <form onSubmit={createTemplate} className="bg-white rounded-lg border p-5 space-y-4">
          <h3 className="font-medium">New template</h3>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium mb-1">Template name</label>
            <input required value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Standard drain job"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Items</label>
            <div className="space-y-2">
              {newItems.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <input placeholder="Description" value={item.description}
                    onChange={(e) => setItem(idx, 'description', e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                  <input type="number" min="0.01" step="0.01" placeholder="Qty" value={item.quantity}
                    onChange={(e) => setItem(idx, 'quantity', e.target.value)}
                    className="w-16 border rounded-lg px-3 py-2 text-sm" />
                  <input type="number" min="0" step="0.01" placeholder="Unit $" value={item.unit_price}
                    onChange={(e) => setItem(idx, 'unit_price', e.target.value)}
                    className="w-24 border rounded-lg px-3 py-2 text-sm" />
                  <button type="button" onClick={() => setNewItems((p) => p.filter((_, i) => i !== idx))}
                    className="text-gray-400 hover:text-red-500 px-2">×</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setNewItems((p) => [...p, emptyItem()])}
              className="mt-2 text-sm text-blue-600 hover:underline">+ Add item</button>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save template'}
            </button>
            <button type="button" onClick={() => setCreating(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-2">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setCreating(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600">
          + New template
        </button>
      )}
    </div>
  );
}
