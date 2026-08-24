'use client';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import { FIELD_ORDER, orderKeys } from '@/lib/content-order';
import type { ContentArray, ContentObject, ContentValue } from '@/lib/admin-types';

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

const TEXTAREA_KEYS = new Set(['desc', 'description', 'body', 'a', 'note']);

/**
 * Edits an array of flat objects (stats, services, features, faq).
 * Each row edits the same set of fields; new rows clone the shape of row 0 (blanked).
 */
export function ArrayEditor({
  value,
  onChange,
  sectionKey,
}: {
  value: ContentArray;
  onChange: (next: ContentArray) => void;
  sectionKey?: string;
}) {
  // Derive the field template from the union of keys across rows, then apply
  // the explicit per-section field order (e.g. FAQ: question before answer).
  const fieldKeys = orderKeys(
    Array.from(new Set(value.flatMap((row) => Object.keys(row)))),
    sectionKey ? FIELD_ORDER[sectionKey] : undefined
  );

  function updateRow(i: number, k: string, v: ContentValue) {
    const next = value.map((row, idx) => (idx === i ? { ...row, [k]: v } : row));
    onChange(next);
  }

  function removeRow(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function addRow() {
    const blank: ContentObject = {};
    for (const k of fieldKeys) blank[k] = '';
    onChange([...value, blank]);
  }

  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <div key={i} className="relative rounded-[10px] border border-border bg-bg-elev/40 p-4 pr-12">
          <div className="grid gap-3 sm:grid-cols-2">
            {fieldKeys.map((k) => {
              const raw = row[k];
              const str = typeof raw === 'string' ? raw : String(raw ?? '');
              const useTextarea = TEXTAREA_KEYS.has(k.toLowerCase()) || str.length > 80;
              return (
                <label key={k} className={`block space-y-1.5 ${useTextarea ? 'sm:col-span-2' : ''}`}>
                  <span className="text-xs font-medium text-fg-muted">{humanize(k)}</span>
                  {useTextarea ? (
                    <Textarea value={str} onChange={(e) => updateRow(i, k, e.target.value)} className="min-h-[70px]" />
                  ) : (
                    <Input value={str} onChange={(e) => updateRow(i, k, e.target.value)} />
                  )}
                </label>
              );
            })}
          </div>
          <button
            onClick={() => removeRow(i)}
            aria-label="Remove row"
            className="absolute right-3 top-3 text-fg-subtle transition-colors hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <Button variant="secondary" size="sm" onClick={addRow} type="button">
        <Plus size={15} /> Add row
      </Button>
    </div>
  );
}
