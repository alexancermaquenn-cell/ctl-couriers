import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  PICKED_UP: 'bg-blue-950 text-blue-300 border-blue-900',
  IN_TRANSIT: 'bg-amber-950 text-amber-300 border-amber-900',
  CUSTOMS: 'bg-purple-950 text-purple-300 border-purple-900',
  OUT_FOR_DELIVERY: 'bg-orange-950 text-orange-300 border-orange-900',
  DELIVERED: 'bg-green-950 text-green-300 border-green-900',
  EXCEPTION: 'bg-red-950 text-red-300 border-red-900',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  CUSTOMS: 'Customs',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  EXCEPTION: 'Exception',
};

export function Badge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] ?? 'bg-zinc-800 text-zinc-300 border-zinc-700',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
