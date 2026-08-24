'use client';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { EmailComposer } from '@/components/admin/EmailComposer';
import { TemplateList, useTemplates } from '@/components/admin/TemplateList';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime } from '@/lib/utils';
import type { EmailLogEntry } from '@/lib/admin-types';

type Tab = 'compose' | 'templates' | 'log';

const TABS: { id: Tab; label: string }[] = [
  { id: 'compose', label: 'Compose' },
  { id: 'templates', label: 'Templates' },
  { id: 'log', label: 'Log' },
];

function statusClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('sent') || s.includes('ok') || s.includes('deliver')) return 'bg-green-950 text-green-300 border-green-900';
  if (s.includes('fail') || s.includes('error') || s.includes('bounce')) return 'bg-red-950 text-red-300 border-red-900';
  return 'bg-zinc-800 text-zinc-300 border-zinc-700';
}

export default function EmailsPage() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('compose');
  const { templates, reload } = useTemplates();
  const [log, setLog] = useState<EmailLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const loadLog = useCallback(() => {
    setLogLoading(true);
    fetch('/api/admin/emails/log', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: EmailLogEntry[]) => setLog(Array.isArray(data) ? data : []))
      .catch(() => toast('error', 'Failed to load email log.'))
      .finally(() => setLogLoading(false));
  }, [toast]);

  useEffect(() => {
    if (tab === 'log') loadLog();
  }, [tab, loadLog]);

  const logColumns: Column<EmailLogEntry>[] = [
    { key: 'to', header: 'To', render: (e) => <span className="text-fg">{e.to}</span> },
    { key: 'subject', header: 'Subject', render: (e) => <span className="text-fg-muted">{e.subject}</span> },
    {
      key: 'status',
      header: 'Status',
      render: (e) => (
        <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium', statusClass(e.status))}>
          {e.status}
        </span>
      ),
    },
    { key: 'sentAt', header: 'Sent', render: (e) => <span className="text-fg-subtle">{formatDateTime(e.sentAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Emails</h1>
        <p className="mt-1 text-sm text-fg-muted">Compose messages, manage templates and review the send log.</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.id ? 'border-accent text-fg' : 'border-transparent text-fg-muted hover:text-fg'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'compose' && <EmailComposer templates={templates} />}
      {tab === 'templates' && <TemplateList templates={templates} onChange={reload} />}
      {tab === 'log' &&
        (logLoading ? (
          <div className="text-fg-muted">Loading…</div>
        ) : (
          <DataTable columns={logColumns} rows={log} rowKey={(e) => e.id} empty="No emails sent yet." />
        ))}
    </div>
  );
}
