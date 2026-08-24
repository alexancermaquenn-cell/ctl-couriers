'use client';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FIELD_ORDER, orderKeys } from '@/lib/content-order';
import type { ContentObject, ContentValue } from '@/lib/admin-types';

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase()).trim();
}

// Heuristic: long text fields render as Textarea.
const TEXTAREA_KEYS = new Set(['body', 'about', 'desc', 'description', 'subtitle', 'a', 'note']);

function ScalarField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ContentValue;
  onChange: (v: string) => void;
}) {
  const str = typeof value === 'string' ? value : String(value ?? '');
  const useTextarea = TEXTAREA_KEYS.has(label.toLowerCase()) || str.length > 80;
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-fg-muted">{humanize(label)}</span>
      {useTextarea ? (
        <Textarea value={str} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input value={str} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

/**
 * Renders a flat or one-level-nested object as labeled fields.
 * Nested objects (e.g. hero.ctaPrimary {label,href}) render as a bordered subgroup.
 */
export function ObjectEditor({
  value,
  onChange,
  sectionKey,
}: {
  value: ContentObject;
  onChange: (next: ContentObject) => void;
  sectionKey?: string;
}) {
  function setField(k: string, v: ContentValue) {
    onChange({ ...value, [k]: v });
  }

  // Apply explicit per-section field order (e.g. about: title before body).
  const orderedKeys = orderKeys(Object.keys(value), sectionKey ? FIELD_ORDER[sectionKey] : undefined);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {orderedKeys.map((k) => {
        const v = value[k];
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
          const nested = v as ContentObject;
          return (
            <div key={k} className="sm:col-span-2 rounded-[10px] border border-border bg-bg-elev/40 p-4">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-fg-subtle">{humanize(k)}</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Object.entries(nested).map(([nk, nv]) => (
                  <ScalarField
                    key={nk}
                    label={nk}
                    value={nv}
                    onChange={(val) => setField(k, { ...nested, [nk]: val })}
                  />
                ))}
              </div>
            </div>
          );
        }
        const isLong = typeof v === 'string' && (TEXTAREA_KEYS.has(k.toLowerCase()) || v.length > 80);
        return (
          <div key={k} className={isLong ? 'sm:col-span-2' : ''}>
            <ScalarField label={k} value={v} onChange={(val) => setField(k, val)} />
          </div>
        );
      })}
    </div>
  );
}
