import { cn } from '@/lib/utils';
import { DOCUMENT_TYPE_LABELS, type DocumentType } from '@/lib/admin-types';

const TYPE_STYLES: Record<DocumentType, string> = {
  BILL_OF_LADING: 'bg-blue-950 text-blue-300 border-blue-900',
  INVOICE: 'bg-green-950 text-green-300 border-green-900',
  INSPECTION: 'bg-purple-950 text-purple-300 border-purple-900',
};

export function DocTypeBadge({ type, className }: { type: DocumentType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        TYPE_STYLES[type],
        className
      )}
    >
      {DOCUMENT_TYPE_LABELS[type]}
    </span>
  );
}

const DESIGN_STYLES: Record<string, string> = {
  ORIGINAL: 'bg-emerald-950/60 text-emerald-300 border-emerald-900',
  A: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  B: 'bg-amber-950/60 text-amber-300 border-amber-900',
};

export function DesignBadge({ design, className }: { design: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        DESIGN_STYLES[design] ?? DESIGN_STYLES.A,
        className
      )}
    >
      {design === 'ORIGINAL' ? 'Original' : `Design ${design}`}
    </span>
  );
}

export function CurrencyBadge({ code, className }: { code: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-300',
        className
      )}
    >
      {code}
    </span>
  );
}
