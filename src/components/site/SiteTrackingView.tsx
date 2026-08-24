'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

interface TEvent { id: string; status: string; location: string; note?: string | null; occurredAt: string; }
interface ShipmentView {
  trackingNumber: string; status: string; origin: string; destination: string;
  service?: string | null; estimatedDelivery?: string | null; events: TEvent[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending', PICKED_UP: 'Picked up', IN_TRANSIT: 'In transit',
  CUSTOMS: 'Customs', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', EXCEPTION: 'Exception',
};
const PIPELINE = ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'CUSTOMS', 'OUT_FOR_DELIVERY', 'DELIVERED'];

function fmt(d: string) {
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

function Inner() {
  const params = useSearchParams();
  const initial = params.get('n') ?? '';
  const [num, setNum] = useState(initial || 'CTL-4830-2291');
  const [shipment, setShipment] = useState<ShipmentView | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'notfound' | 'found'>('idle');

  const lookup = useCallback((n: string) => {
    if (!n.trim()) return;
    setState('loading');
    setShipment(null);
    const es = new EventSource(`/api/tracking/${encodeURIComponent(n.trim())}/stream`);
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.error === 'not_found') { setState('notfound'); es.close(); }
      else if (data.shipment) { setShipment(data.shipment); setState('found'); }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  useEffect(() => {
    const n = initial || 'CTL-4830-2291';
    const cleanup = lookup(n);
    return cleanup;
  }, [initial, lookup]);

  const submit = (e: React.FormEvent) => { e.preventDefault(); lookup(num); };

  const events = shipment ? [...shipment.events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()) : [];
  const currentIdx = shipment ? PIPELINE.indexOf(shipment.status) : -1;

  return (
    <div className="track track--page">
      <div className="track__head">
        <h3><span className="pulse" /> Track &amp; Trace</h3>
        <span className="track__badge">Real-time · CTL</span>
      </div>
      <div className="track__body">
        <form onSubmit={submit}>
          <label className="track__label" htmlFor="tnum">Tracking number</label>
          <div className="track__input">
            <input id="tnum" type="text" value={num} onChange={(e) => setNum(e.target.value)} spellCheck={false} aria-label="Tracking number" />
            <button type="submit" aria-label="Track">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
          <div className="track__hint">Enter your number, or try demo <b>CTL-4830-2291</b></div>
        </form>

        {state === 'loading' && <div className="track__state">Locating your shipment…</div>}
        {state === 'notfound' && <div className="track__state">No shipment found for that tracking number.</div>}

        {state === 'found' && shipment && (
          <div className="result">
            <div className="result__top">
              <div>
                <span className="result__k">Shipment</span>
                <span className="result__id">{shipment.trackingNumber}</span>
              </div>
              <span className={`chip-status s-${shipment.status}`}>{STATUS_LABELS[shipment.status] ?? shipment.status}</span>
            </div>

            <div className="route">
              <div className="route__end"><b>{shipment.origin}</b></div>
              <div className="route__bar"><span style={{ width: `${Math.max(6, (currentIdx / (PIPELINE.length - 1)) * 100)}%` }} /></div>
              <div className="route__end route__end--r"><b>{shipment.destination}</b></div>
            </div>

            <ol className="tl">
              {events.map((e, i) => (
                <li key={e.id} className={i === 0 ? 'tl__cur' : undefined}>
                  <span className="tl__dot" />
                  <div>
                    <b>{STATUS_LABELS[e.status] ?? e.status}</b>
                    <span className="tl__loc">{e.location}</span>
                    {e.note && <p>{e.note}</p>}
                    <time>{fmt(e.occurredAt)}</time>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

export function SiteTrackingView() {
  return <Suspense fallback={<div className="track__state">Loading…</div>}><Inner /></Suspense>;
}
