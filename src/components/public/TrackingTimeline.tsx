'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, STATUS_LABELS } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { MapPin, CheckCircle2, Truck } from 'lucide-react';

export interface TEvent {
  id: string;
  status: string;
  location: string;
  note?: string | null;
  occurredAt: string;
}
export interface ShipmentView {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  service?: string | null;
  estimatedDelivery?: string | null;
  events: TEvent[];
}

export function TrackingTimeline({ shipment, live }: { shipment: ShipmentView; live?: boolean }) {
  const events = [...shipment.events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-fg-subtle mb-1">Tracking number</p>
            <p className="font-mono text-lg font-semibold">{shipment.trackingNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            {live && (
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Live
              </span>
            )}
            <Badge status={shipment.status} />
          </div>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-fg-subtle text-xs">From</p>
            <p className="font-medium">{shipment.origin}</p>
          </div>
          <div>
            <p className="text-fg-subtle text-xs">To</p>
            <p className="font-medium">{shipment.destination}</p>
          </div>
          <div>
            <p className="text-fg-subtle text-xs">Est. delivery</p>
            <p className="font-medium">
              {shipment.estimatedDelivery ? formatDateTime(shipment.estimatedDelivery) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-5 flex items-center gap-2">
          <Truck size={16} className="text-accent-bright" /> Shipment progress
        </h3>
        <ol className="relative border-l border-border ml-3">
          <AnimatePresence initial={false}>
            {events.map((e, i) => (
              <motion.li
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.03 }}
                className="mb-6 ml-6 last:mb-0"
              >
                <span
                  className={`absolute -left-[9px] grid place-items-center h-4 w-4 rounded-full ${
                    i === 0 ? 'bg-accent glow-red' : 'bg-bg-elev border border-border'
                  }`}
                >
                  {i === 0 && <CheckCircle2 size={12} className="text-white" />}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-sm">{STATUS_LABELS[e.status] ?? e.status}</span>
                  <span className="text-fg-subtle text-xs flex items-center gap-1">
                    <MapPin size={11} /> {e.location}
                  </span>
                </div>
                {e.note && <p className="text-sm text-fg-muted mt-0.5">{e.note}</p>}
                <p className="text-xs text-fg-subtle mt-1">{formatDateTime(e.occurredAt)}</p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </div>
  );
}
