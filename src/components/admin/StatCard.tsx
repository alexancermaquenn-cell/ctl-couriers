import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: boolean;
}) {
  return (
    <div className={cn('card p-5', accent && 'glow-red')}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-fg">{value}</div>
        </div>
        {Icon && (
          <div className={cn('rounded-[10px] p-2', accent ? 'bg-accent/15 text-accent' : 'bg-white/5 text-fg-muted')}>
            <Icon size={18} />
          </div>
        )}
      </div>
    </div>
  );
}
