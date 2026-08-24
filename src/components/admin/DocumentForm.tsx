'use client';
import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '@/lib/admin-types';
import type { DocumentType, Shipment } from '@/lib/admin-types';

export interface DocumentFormValues {
  type: DocumentType;
  shipmentId: string;
}

export function DocumentForm({
  shipments,
  defaultShipmentId,
  onSubmit,
}: {
  shipments: Shipment[];
  defaultShipmentId?: string;
  onSubmit: (values: DocumentFormValues) => Promise<void> | void;
}) {
  const [type, setType] = useState<DocumentType>('BILL_OF_LADING');
  const [shipmentId, setShipmentId] = useState(defaultShipmentId ?? shipments[0]?.id ?? '');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!shipmentId) return;
    setBusy(true);
    try {
      await onSubmit({ type, shipmentId });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-fg-muted">Document type</span>
        <Select value={type} onChange={(e) => setType(e.target.value as DocumentType)}>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>{DOCUMENT_TYPE_LABELS[t]}</option>
          ))}
        </Select>
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-fg-muted">Shipment</span>
        <Select value={shipmentId} onChange={(e) => setShipmentId(e.target.value)}>
          {shipments.length === 0 && <option value="">No shipments</option>}
          {shipments.map((s) => (
            <option key={s.id} value={s.id}>
              {s.trackingNumber} — {s.origin} → {s.destination}
            </option>
          ))}
        </Select>
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy || !shipmentId}>{busy ? 'Generating…' : 'Generate document'}</Button>
      </div>
    </form>
  );
}
