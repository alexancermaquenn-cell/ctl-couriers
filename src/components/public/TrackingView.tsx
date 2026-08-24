'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, PackageX, Loader2 } from 'lucide-react';
import { TrackingTimeline, ShipmentView } from './TrackingTimeline';

export function TrackingView() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get('n') ?? '';
  const [num, setNum] = useState(initial);
  const [shipment, setShipment] = useState<ShipmentView | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'notfound' | 'found'>('idle');

  const lookup = useCallback((n: string) => {
    if (!n.trim()) return;
    setState('loading');
    setShipment(null);
    // SSE gives us the shipment + live updates in one stream
    const es = new EventSource(`/api/tracking/${encodeURIComponent(n.trim())}/stream`);
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      if (data.error === 'not_found') {
        setState('notfound');
        es.close();
      } else if (data.shipment) {
        setShipment(data.shipment);
        setState('found');
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, []);

  useEffect(() => {
    if (initial) {
      const cleanup = lookup(initial);
      return cleanup;
    }
  }, [initial, lookup]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/tracking?n=${encodeURIComponent(num.trim())}`);
    lookup(num);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          value={num}
          onChange={(e) => setNum(e.target.value)}
          placeholder="Enter tracking number (e.g. CTL-4830-2291)"
          className="flex-1 h-12 rounded-[12px] bg-bg-elev border border-border px-4 text-fg placeholder:text-fg-subtle focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40"
        />
        <button className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-[12px] bg-accent text-white font-medium hover:bg-accent-bright transition-colors glow-red">
          <Search size={18} /> Track
        </button>
      </form>

      {state === 'loading' && (
        <div className="card p-10 text-center text-fg-muted flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-accent-bright" /> Locating your shipment…
        </div>
      )}
      {state === 'notfound' && (
        <div className="card p-10 text-center flex flex-col items-center gap-3">
          <PackageX className="text-fg-subtle" size={28} />
          <p className="text-fg-muted">No shipment found for that tracking number.</p>
        </div>
      )}
      {state === 'found' && shipment && <TrackingTimeline shipment={shipment} live />}
    </div>
  );
}
