import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { STATUS_LABELS } from '@/components/ui/Badge';
import type { ShipmentStatus } from '@/lib/admin-types';

// The happy-path pipeline. EXCEPTION is out-of-band and handled separately.
const PIPELINE: ShipmentStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'CUSTOMS',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function StatusPipeline({ current }: { current: ShipmentStatus }) {
  if (current === 'EXCEPTION') {
    return (
      <div className="rounded-[10px] border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
        Shipment flagged as <strong>Exception</strong> — pipeline halted.
      </div>
    );
  }

  const currentIdx = PIPELINE.indexOf(current);

  return (
    <div className="flex items-center overflow-x-auto pb-2">
      {PIPELINE.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-2 min-w-[68px]">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  done && 'border-accent bg-accent text-white',
                  active && 'border-accent bg-accent/15 text-accent glow-red',
                  !done && !active && 'border-border bg-bg-elev text-fg-subtle'
                )}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn('text-center text-[10px] leading-tight', active ? 'text-fg' : 'text-fg-subtle')}>
                {STATUS_LABELS[step]}
              </span>
            </div>
            {i < PIPELINE.length - 1 && (
              <div className={cn('mx-1 h-0.5 flex-1 rounded', i < currentIdx ? 'bg-accent' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
