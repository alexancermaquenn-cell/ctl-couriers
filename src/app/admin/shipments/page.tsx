'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { ShipmentForm, type ShipmentFormValues } from '@/components/admin/ShipmentForm';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { Shipment } from '@/lib/admin-types';

function buildPayload(v: ShipmentFormValues) {
  return {
    ...(v.trackingNumber ? { trackingNumber: v.trackingNumber } : {}),
    status: v.status,
    origin: v.origin,
    destination: v.destination,
    senderName: v.senderName,
    senderAddress: v.senderAddress || null,
    receiverName: v.receiverName,
    receiverAddress: v.receiverAddress || null,
    weightKg: v.weightKg ? Number(v.weightKg) : null,
    service: v.service || null,
    estimatedDelivery: v.estimatedDelivery || null,
  };
}

export default function ShipmentsPage() {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/shipments', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Shipment[]) => setRows(Array.isArray(data) ? data : []))
      .catch(() => toast('error', 'Failed to load shipments.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => load(), [load]);

  async function create(v: ShipmentFormValues) {
    const res = await fetch('/api/admin/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(buildPayload(v)),
    });
    if (!res.ok) {
      toast('error', 'Failed to create shipment.');
      return;
    }
    toast('success', 'Shipment created.');
    setOpen(false);
    load();
  }

  const columns: Column<Shipment>[] = [
    { key: 'tracking', header: 'Tracking #', render: (s) => <span className="font-mono text-sm text-fg">{s.trackingNumber}</span> },
    { key: 'route', header: 'Route', render: (s) => <span className="text-fg-muted">{s.origin} → {s.destination}</span> },
    { key: 'status', header: 'Status', render: (s) => <Badge status={s.status} /> },
    { key: 'created', header: 'Created', render: (s) => <span className="text-fg-subtle">{formatDate(s.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Shipments</h1>
          <p className="mt-1 text-sm text-fg-muted">Manage all shipments and tracking events.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus size={16} /> New shipment</Button>
      </div>

      {loading ? (
        <div className="text-fg-muted">Loading…</div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(s) => s.id}
          onRowClick={(s) => router.push(`/admin/shipments/${s.id}`)}
          empty="No shipments yet."
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New shipment" className="max-w-2xl">
        <ShipmentForm showTracking onSubmit={create} submitLabel="Create shipment" />
      </Modal>
    </div>
  );
}
