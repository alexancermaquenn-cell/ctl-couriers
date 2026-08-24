'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { STATUS_LABELS } from '@/components/ui/Badge';
import { SHIPMENT_STATUSES } from '@/lib/admin-types';
import type { ShipmentStatus } from '@/lib/admin-types';

export interface EventFormValues {
  status: ShipmentStatus;
  location: string;
  note: string;
}

export function EventForm({
  defaultStatus = 'IN_TRANSIT',
  onSubmit,
}: {
  defaultStatus?: ShipmentStatus;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
}) {
  const [status, setStatus] = useState<ShipmentStatus>(defaultStatus);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!location.trim()) return;
    setBusy(true);
    try {
      await onSubmit({ status, location, note });
      setLocation('');
      setNote('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-fg-muted">Status</span>
          <Select value={status} onChange={(e) => setStatus(e.target.value as ShipmentStatus)}>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </label>
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-fg-muted">Location</span>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" required />
        </label>
      </div>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-fg-muted">Note (optional)</span>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} className="min-h-[70px]" />
      </label>
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={busy}>{busy ? 'Adding…' : 'Add event'}</Button>
      </div>
    </form>
  );
}
