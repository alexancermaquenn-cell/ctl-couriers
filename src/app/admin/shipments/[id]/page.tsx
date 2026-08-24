'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { ShipmentForm, type ShipmentFormValues } from '@/components/admin/ShipmentForm';
import { EventForm, type EventFormValues } from '@/components/admin/EventForm';
import { StatusPipeline } from '@/components/admin/StatusPipeline';
import { formatDateTime } from '@/lib/utils';
import { ArrowLeft, Trash2, FileText } from 'lucide-react';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '@/lib/admin-types';
import type { DocumentType, Shipment, TrackingEvent } from '@/lib/admin-types';

function buildPayload(v: ShipmentFormValues) {
  return {
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

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const toast = useToast();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [genType, setGenType] = useState<DocumentType | null>(null);

  const load = useCallback(() => {
    fetch(`/api/admin/shipments/${id}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Shipment | null) => setShipment(data))
      .catch(() => toast('error', 'Failed to load shipment.'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => load(), [load]);

  async function saveFields(v: ShipmentFormValues) {
    const res = await fetch(`/api/admin/shipments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(buildPayload(v)),
    });
    if (!res.ok) {
      toast('error', 'Failed to save shipment.');
      return;
    }
    toast('success', 'Shipment updated.');
    load();
  }

  async function addEvent(v: EventFormValues) {
    const res = await fetch(`/api/admin/shipments/${id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ status: v.status, location: v.location, note: v.note || undefined }),
    });
    if (!res.ok) {
      toast('error', 'Failed to add event.');
      return;
    }
    toast('success', 'Event added.');
    load();
  }

  async function remove() {
    if (!confirm('Delete this shipment permanently?')) return;
    const res = await fetch(`/api/admin/shipments/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!res.ok) {
      toast('error', 'Failed to delete shipment.');
      return;
    }
    toast('success', 'Shipment deleted.');
    router.push('/admin/shipments');
  }

  async function generateDoc(type: DocumentType) {
    setGenType(type);
    try {
      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ type, shipmentId: id }),
      });
      if (!res.ok) throw new Error();
      const doc: { id: string } = await res.json();
      window.open(`/api/admin/documents/${doc.id}/pdf`, '_blank');
      toast('success', `${DOCUMENT_TYPE_LABELS[type]} generated.`);
    } catch {
      toast('error', 'Failed to generate document.');
    } finally {
      setGenType(null);
    }
  }

  if (loading) return <div className="text-fg-muted">Loading…</div>;
  if (!shipment) return <div className="text-fg-muted">Shipment not found.</div>;

  const events: TrackingEvent[] = [...(shipment.events ?? [])].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push('/admin/shipments')}
        className="flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <ArrowLeft size={15} /> Back to shipments
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-mono text-2xl font-semibold text-fg">{shipment.trackingNumber}</h1>
          <Badge status={shipment.status} />
        </div>
        <Button variant="danger" size="sm" onClick={remove}><Trash2 size={15} /> Delete</Button>
      </div>

      <Card>
        <CardTitle className="mb-4">Status pipeline</CardTitle>
        <StatusPipeline current={shipment.status} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle className="mb-4">Details</CardTitle>
          <ShipmentForm initial={shipment} onSubmit={saveFields} submitLabel="Save changes" />
        </Card>

        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">Documents</CardTitle>
            <div className="flex flex-col gap-2">
              {DOCUMENT_TYPES.map((t) => (
                <Button
                  key={t}
                  variant="secondary"
                  size="sm"
                  onClick={() => generateDoc(t)}
                  disabled={genType === t}
                  className="justify-start"
                >
                  <FileText size={15} /> {genType === t ? 'Generating…' : DOCUMENT_TYPE_LABELS[t]}
                </Button>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-4">Add event</CardTitle>
            <EventForm defaultStatus={shipment.status} onSubmit={addEvent} />
          </Card>
        </div>
      </div>

      <Card>
        <CardTitle className="mb-4">Timeline</CardTitle>
        {events.length === 0 ? (
          <p className="text-sm text-fg-subtle">No events recorded.</p>
        ) : (
          <ol className="relative space-y-5 border-l border-border pl-6">
            {events.map((ev) => (
              <li key={ev.id} className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-accent bg-bg" />
                <div className="flex flex-wrap items-center gap-2">
                  <Badge status={ev.status} />
                  <span className="text-sm font-medium text-fg">{ev.location}</span>
                  <span className="text-xs text-fg-subtle">{formatDateTime(ev.occurredAt)}</span>
                </div>
                {ev.note && <p className="mt-1 text-sm text-fg-muted">{ev.note}</p>}
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
