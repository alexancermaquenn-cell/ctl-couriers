import { prisma } from '@/lib/prisma';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Package, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { SHIPMENT_STATUSES } from '@/lib/admin-types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [total, statusGroups, emailsSent, documentsCount, recent] = await Promise.all([
    prisma.shipment.count(),
    prisma.shipment.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.emailLog.count(),
    prisma.document.count(),
    prisma.shipment.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);

  const byStatus = new Map<string, number>();
  for (const g of statusGroups) byStatus.set(g.status, g._count._all);
  const delivered = byStatus.get('DELIVERED') ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-fg-muted">Overview of shipments, documents and email activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total shipments" value={total} icon={Package} accent />
        <StatCard label="Delivered" value={delivered} icon={CheckCircle2} />
        <StatCard label="Emails sent" value={emailsSent} icon={Mail} />
        <StatCard label="Documents" value={documentsCount} icon={FileText} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardTitle className="mb-4">By status</CardTitle>
          <div className="space-y-2.5">
            {SHIPMENT_STATUSES.map((s) => (
              <div key={s} className="flex items-center justify-between">
                <Badge status={s} />
                <span className="text-sm font-medium text-fg">{byStatus.get(s) ?? 0}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <CardTitle>Recent shipments</CardTitle>
            <Link href="/admin/shipments" className="text-sm text-accent hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-fg-subtle">No shipments yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {recent.map((s) => (
                <Link
                  key={s.id}
                  href={`/admin/shipments/${s.id}`}
                  className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-white/[0.02] -mx-2 px-2 rounded"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-sm text-fg">{s.trackingNumber}</div>
                    <div className="truncate text-xs text-fg-subtle">{s.origin} → {s.destination}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge status={s.status} />
                    <span className="hidden sm:block text-xs text-fg-subtle">{formatDate(s.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
