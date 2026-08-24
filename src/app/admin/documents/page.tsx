'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { DocTypeBadge, DesignBadge, CurrencyBadge } from '@/components/admin/DocBadge';
import { formatDate } from '@/lib/utils';
import { Plus, ExternalLink } from 'lucide-react';
import type { DocumentRecord } from '@/lib/admin-types';

export default function DocumentsPage() {
  const router = useRouter();
  const toast = useToast();
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/documents', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: DocumentRecord[]) => setDocs(Array.isArray(d) ? d : []))
      .catch(() => toast('error', 'Failed to load documents.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => load(), [load]);

  const columns: Column<DocumentRecord>[] = [
    { key: 'number', header: 'Number', render: (d) => <span className="font-mono text-sm text-fg">{d.number}</span> },
    { key: 'type', header: 'Type', render: (d) => <DocTypeBadge type={d.type} /> },
    {
      key: 'design',
      header: 'Design',
      render: (d) => (
        <span className="inline-flex items-center gap-1.5">
          <DesignBadge design={d.design} />
          <CurrencyBadge code={d.currency ?? 'EUR'} />
        </span>
      ),
    },
    {
      key: 'seal',
      header: 'Stamp / Signature',
      render: (d) =>
        d.stampAsset || d.signatureAsset ? (
          <span className="text-xs text-fg-muted">
            {d.stampAsset?.name ?? '—'}
            <span className="mx-1 text-fg-subtle">/</span>
            {d.signatureAsset?.name ?? '—'}
          </span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (d) =>
        d.client ? (
          <span className="text-fg-muted">
            {d.client.company ?? d.client.fullName}
            {d.client.company && <span className="ml-1.5 text-fg-subtle">· {d.client.fullName}</span>}
          </span>
        ) : (
          <span className="text-fg-subtle">—</span>
        ),
    },
    { key: 'created', header: 'Created', render: (d) => <span className="text-fg-subtle">{formatDate(d.createdAt)}</span> },
    {
      key: 'action',
      header: '',
      className: 'text-right',
      render: (d) => (
        <a
          href={`/api/admin/documents/${d.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
        >
          View PDF <ExternalLink size={13} />
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Documents</h1>
          <p className="mt-1 text-sm text-fg-muted">Bills of lading, invoices and inspection reports.</p>
        </div>
        <Button onClick={() => router.push('/admin/documents/new')}>
          <Plus size={16} /> New document
        </Button>
      </div>

      {loading ? (
        <div className="text-fg-muted">Loading…</div>
      ) : (
        <DataTable columns={columns} rows={docs} rowKey={(d) => d.id} empty="No documents yet." />
      )}
    </div>
  );
}
