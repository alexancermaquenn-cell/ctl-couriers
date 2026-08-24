'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ObjectEditor } from '@/components/admin/ObjectEditor';
import { ArrayEditor } from '@/components/admin/ArrayEditor';
import { useToast } from '@/components/ui/Toast';
import { SECTION_ORDER } from '@/lib/content-order';
import type { ContentArray, ContentMap, ContentObject, ContentValue } from '@/lib/admin-types';

const KEY_LABELS: Record<string, string> = {
  brand: 'Brand',
  hero: 'Hero',
  stats: 'Stats',
  about: 'About',
  services: 'Services',
  features: 'Features',
  faq: 'FAQ',
  contact: 'Contact',
  footer: 'Footer',
};

function isArray(v: ContentValue): v is ContentArray {
  return Array.isArray(v);
}
function isObject(v: ContentValue): v is ContentObject {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

export default function ContentPage() {
  const toast = useToast();
  const [content, setContent] = useState<ContentMap>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/content', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: ContentMap) => setContent(data ?? {}))
      .catch(() => toast('error', 'Failed to load content.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => load(), [load]);

  function updateKey(key: string, value: ContentValue) {
    setContent((c) => ({ ...c, [key]: value }));
  }

  async function save(key: string) {
    setSavingKey(key);
    try {
      const res = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ key, value: content[key] }),
      });
      if (!res.ok) throw new Error();
      toast('success', `${KEY_LABELS[key] ?? key} saved.`);
    } catch {
      toast('error', `Failed to save ${key}.`);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return <div className="text-fg-muted">Loading content…</div>;
  }

  // Explicit section order (brand + hero first); any extra keys append at the end.
  const present = Object.keys(content);
  const keys = [
    ...SECTION_ORDER.filter((k) => k in content),
    ...present.filter((k) => !SECTION_ORDER.includes(k)),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Content</h1>
        <p className="mt-1 text-sm text-fg-muted">Edit every section of the public website. Changes go live immediately after saving.</p>
      </div>

      {keys.length === 0 && <div className="card p-8 text-center text-fg-subtle">No content keys found.</div>}

      {keys.map((key) => {
        const value = content[key];
        return (
          <Card key={key}>
            <div className="mb-4 flex items-center justify-between">
              <CardTitle>{KEY_LABELS[key] ?? key}</CardTitle>
              <Button size="sm" onClick={() => save(key)} disabled={savingKey === key}>
                {savingKey === key ? 'Saving…' : 'Save'}
              </Button>
            </div>

            {isArray(value) ? (
              <ArrayEditor value={value} sectionKey={key} onChange={(next) => updateKey(key, next)} />
            ) : isObject(value) ? (
              <ObjectEditor value={value} sectionKey={key} onChange={(next) => updateKey(key, next)} />
            ) : (
              <ObjectEditor value={{ value }} onChange={(next) => updateKey(key, next.value)} />
            )}
          </Card>
        );
      })}
    </div>
  );
}
