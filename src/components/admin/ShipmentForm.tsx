'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { STATUS_LABELS } from '@/components/ui/Badge';
import { SHIPMENT_STATUSES } from '@/lib/admin-types';
import type { Shipment } from '@/lib/admin-types';

export interface ShipmentFormValues {
  trackingNumber?: string;
  status: string;
  origin: string;
  destination: string;
  senderName: string;
  senderAddress: string;
  receiverName: string;
  receiverAddress: string;
  weightKg: string;
  service: string;
  estimatedDelivery: string;
}

function toForm(s?: Partial<Shipment>): ShipmentFormValues {
  return {
    trackingNumber: s?.trackingNumber ?? '',
    status: s?.status ?? 'PENDING',
    origin: s?.origin ?? '',
    destination: s?.destination ?? '',
    senderName: s?.senderName ?? '',
    senderAddress: s?.senderAddress ?? '',
    receiverName: s?.receiverName ?? '',
    receiverAddress: s?.receiverAddress ?? '',
    weightKg: s?.weightKg != null ? String(s.weightKg) : '',
    service: s?.service ?? '',
    estimatedDelivery: s?.estimatedDelivery ? s.estimatedDelivery.slice(0, 10) : '',
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-fg-muted">{label}</span>
      {children}
    </label>
  );
}

export function ShipmentForm({
  initial,
  submitLabel = 'Create shipment',
  showTracking = false,
  onSubmit,
}: {
  initial?: Partial<Shipment>;
  submitLabel?: string;
  showTracking?: boolean;
  onSubmit: (values: ShipmentFormValues) => Promise<void> | void;
}) {
  const [v, setV] = useState<ShipmentFormValues>(toForm(initial));
  const [busy, setBusy] = useState(false);

  function set<K extends keyof ShipmentFormValues>(k: K, val: ShipmentFormValues[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(v);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {showTracking && (
          <Field label="Tracking number">
            <Input value={v.trackingNumber} onChange={(e) => set('trackingNumber', e.target.value)} placeholder="CTL-0000-0000" />
          </Field>
        )}
        <Field label="Status">
          <Select value={v.status} onChange={(e) => set('status', e.target.value)}>
            {SHIPMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Origin">
          <Input value={v.origin} onChange={(e) => set('origin', e.target.value)} required />
        </Field>
        <Field label="Destination">
          <Input value={v.destination} onChange={(e) => set('destination', e.target.value)} required />
        </Field>
        <Field label="Sender name">
          <Input value={v.senderName} onChange={(e) => set('senderName', e.target.value)} required />
        </Field>
        <Field label="Receiver name">
          <Input value={v.receiverName} onChange={(e) => set('receiverName', e.target.value)} required />
        </Field>
        <Field label="Sender address">
          <Input value={v.senderAddress} onChange={(e) => set('senderAddress', e.target.value)} />
        </Field>
        <Field label="Receiver address">
          <Input value={v.receiverAddress} onChange={(e) => set('receiverAddress', e.target.value)} />
        </Field>
        <Field label="Weight (kg)">
          <Input type="number" step="any" value={v.weightKg} onChange={(e) => set('weightKg', e.target.value)} />
        </Field>
        <Field label="Service">
          <Input value={v.service} onChange={(e) => set('service', e.target.value)} placeholder="Cargo Transport" />
        </Field>
        <Field label="Estimated delivery">
          <Input type="date" value={v.estimatedDelivery} onChange={(e) => set('estimatedDelivery', e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  );
}
