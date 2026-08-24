'use client';
import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { DataTable, type Column } from '@/components/admin/DataTable';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { Client } from '@/lib/admin-types';

interface NewClientForm {
  fullName: string;
  email: string;
  company: string;
  vatNumber: string;
  phone: string;
  address: string;
  country: string;
  paymentTerms: string;
}

const EMPTY: NewClientForm = {
  fullName: '',
  email: '',
  company: '',
  vatNumber: '',
  phone: '',
  address: '',
  country: '',
  paymentTerms: '',
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-fg-muted">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewClientForm>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/clients', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Client[]) => setRows(Array.isArray(data) ? data : []))
      .catch(() => toast('error', 'Failed to load clients.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => load(), [load]);

  function set<K extends keyof NewClientForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function create(e: FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast('error', 'Full name and email are required.');
      return;
    }
    setSaving(true);
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      toast('error', 'Failed to create client.');
      return;
    }
    toast('success', 'Client created.');
    setOpen(false);
    setForm(EMPTY);
    load();
  }

  const columns: Column<Client>[] = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-fg">{c.fullName}</span> },
    {
      key: 'company',
      header: 'Company',
      render: (c) => (c.company ? <span className="text-fg-muted">{c.company}</span> : <span className="text-fg-subtle">—</span>),
    },
    { key: 'email', header: 'Email', render: (c) => <span className="text-fg-muted">{c.email}</span> },
    {
      key: 'country',
      header: 'Country',
      render: (c) => (c.country ? <span className="text-fg-muted">{c.country}</span> : <span className="text-fg-subtle">—</span>),
    },
    { key: 'docs', header: 'Docs', className: 'text-right', render: (c) => <span className="tabular-nums text-fg-muted">{c._count?.documents ?? 0}</span> },
    { key: 'ships', header: 'Shipments', className: 'text-right', render: (c) => <span className="tabular-nums text-fg-muted">{c._count?.shipments ?? 0}</span> },
    { key: 'created', header: 'Created', render: (c) => <span className="text-fg-subtle">{formatDate(c.createdAt)}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Clients</h1>
          <p className="mt-1 text-sm text-fg-muted">Companies and individuals you issue documents for.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus size={16} /> New client
        </Button>
      </div>

      {loading ? (
        <div className="text-fg-muted">Loading…</div>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(c) => c.id}
          onRowClick={(c) => router.push(`/admin/clients/${c.id}`)}
          empty="No clients yet."
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New client" className="max-w-2xl">
        <form onSubmit={create} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Giulia Rossi" autoFocus />
            </Field>
            <Field label="Email" required>
              <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="giulia@example.com" />
            </Field>
            <Field label="Company">
              <Input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Optional — leave blank for individuals" />
            </Field>
            <Field label="VAT number">
              <Input value={form.vatNumber} onChange={(e) => set('vatNumber', e.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Country">
              <Input value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Optional" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address">
                <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Optional" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Payment terms">
                <Input value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} placeholder="Optional — e.g. Net 30" />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
