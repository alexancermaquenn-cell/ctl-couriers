'use client';
import { useEffect, useState, useCallback, useRef, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { DocTypeBadge, DesignBadge } from '@/components/admin/DocBadge';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  FileText,
  ExternalLink,
  Plus,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  Building2,
} from 'lucide-react';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, type DocumentType, type Client } from '@/lib/admin-types';

interface EditForm {
  fullName: string;
  email: string;
  company: string;
  vatNumber: string;
  phone: string;
  address: string;
  country: string;
  paymentTerms: string;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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

function toForm(c: Client): EditForm {
  return {
    fullName: c.fullName,
    email: c.email,
    company: c.company ?? '',
    vatNumber: c.vatNumber ?? '',
    phone: c.phone ?? '',
    address: c.address ?? '',
    country: c.country ?? '',
    paymentTerms: c.paymentTerms ?? '',
  };
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'documents' | 'shipments'>('documents');
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const load = useCallback(() => {
    fetch(`/api/admin/clients/${id}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Client | null) => setClient(data))
      .catch(() => toast('error', 'Failed to load client.'))
      .finally(() => setLoading(false));
  }, [id, toast]);

  useEffect(() => load(), [load]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  function openEdit() {
    if (!client) return;
    setForm(toForm(client));
    setEditOpen(true);
  }

  async function saveEdit(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.fullName.trim() || !form.email.trim()) {
      toast('error', 'Full name and email are required.');
      return;
    }
    setSaving(true);
    const res = await fetch(`/api/admin/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      toast('error', 'Failed to save client.');
      return;
    }
    toast('success', 'Client updated.');
    setEditOpen(false);
    load();
  }

  async function remove() {
    if (!confirm('Delete this client? Documents and shipments will be unlinked.')) return;
    const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    if (!res.ok) {
      toast('error', 'Failed to delete client.');
      return;
    }
    toast('success', 'Client deleted.');
    router.push('/admin/clients');
  }

  function generate(type: DocumentType) {
    router.push(`/admin/documents/new?clientId=${id}&type=${type}`);
  }

  if (loading) return <div className="text-fg-muted">Loading…</div>;
  if (!client) return <div className="text-fg-muted">Client not found.</div>;

  const docs = client.documents ?? [];
  const shipments = client.shipments ?? [];

  // Info lines built from present values only — never render empty labels.
  const infoLines: { icon: typeof Mail; text: string }[] = [];
  if (client.company) infoLines.push({ icon: Building2, text: client.company });
  infoLines.push({ icon: Mail, text: client.email });
  if (client.phone) infoLines.push({ icon: Phone, text: client.phone });
  if (client.address) infoLines.push({ icon: MapPin, text: client.address });

  return (
    <div className="space-y-6">
      <Link href="/admin/clients" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg">
        <ArrowLeft size={15} /> Clients
      </Link>

      {/* Hero header */}
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/15 text-lg font-semibold text-accent">
              {client.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-fg">{client.fullName}</h1>
              <div className="mt-2 flex flex-col gap-1.5 text-sm text-fg-muted">
                {infoLines.map((l, i) => {
                  const Icon = l.icon;
                  return (
                    <span key={i} className="inline-flex items-center gap-2">
                      <Icon size={14} className="text-fg-subtle" />
                      {l.text}
                    </span>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {client.vatNumber && (
                  <span className="rounded-md border border-border bg-bg-elev px-2 py-0.5 text-xs text-fg-muted">
                    VAT {client.vatNumber}
                  </span>
                )}
                {client.country && (
                  <span className="rounded-md border border-border bg-bg-elev px-2 py-0.5 text-xs text-fg-muted">
                    {client.country}
                  </span>
                )}
                {client.paymentTerms && (
                  <span className="rounded-md border border-border bg-bg-elev px-2 py-0.5 text-xs text-fg-muted">
                    {client.paymentTerms}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Generate document split-menu */}
            <div className="relative" ref={menuRef}>
              <Button onClick={() => setMenuOpen((o) => !o)}>
                <Plus size={16} /> Generate document <ChevronDown size={15} />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-[10px] border border-border bg-bg-card shadow-xl glow-red">
                  {DOCUMENT_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setMenuOpen(false);
                        generate(t);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
                    >
                      <FileText size={15} className="text-fg-subtle" />
                      {DOCUMENT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant="secondary" onClick={openEdit}>
              <Pencil size={15} /> Edit
            </Button>
            <Button variant="danger" onClick={remove}>
              <Trash2 size={15} />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['documents', 'shipments'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium capitalize transition-colors',
              tab === t ? 'border-accent text-fg' : 'border-transparent text-fg-muted hover:text-fg'
            )}
          >
            {t} <span className="ml-1 text-fg-subtle">({t === 'documents' ? docs.length : shipments.length})</span>
          </button>
        ))}
      </div>

      {tab === 'documents' &&
        (docs.length === 0 ? (
          <div className="card p-10 text-center text-fg-subtle">
            No documents yet. Use “Generate document” to create one for {client.fullName}.
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
                    <th className="px-4 py-3 font-semibold">Number</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Design</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 text-right font-semibold"></th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-b border-border/60 last:border-0">
                      <td className="px-4 py-3 font-mono text-fg">{d.number}</td>
                      <td className="px-4 py-3">
                        <DocTypeBadge type={d.type} />
                      </td>
                      <td className="px-4 py-3">
                        <DesignBadge design={d.design} />
                      </td>
                      <td className="px-4 py-3 text-fg-subtle">{formatDate(d.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`/api/admin/documents/${d.id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
                        >
                          View PDF <ExternalLink size={13} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {tab === 'shipments' &&
        (shipments.length === 0 ? (
          <div className="card p-10 text-center text-fg-subtle">No shipments linked to this client.</div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-fg-subtle">
                    <th className="px-4 py-3 font-semibold">Tracking #</th>
                    <th className="px-4 py-3 font-semibold">Route</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => router.push(`/admin/shipments/${s.id}`)}
                      className="cursor-pointer border-b border-border/60 last:border-0 transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3 font-mono text-fg">{s.trackingNumber}</td>
                      <td className="px-4 py-3 text-fg-muted">
                        {s.origin} → {s.destination}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-fg-subtle">{formatDate(s.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

      {/* Edit modal */}
      {form && (
        <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit client" className="max-w-2xl">
          <form onSubmit={saveEdit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Company">
                <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Optional" />
              </Field>
              <Field label="VAT number">
                <Input value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} placeholder="Optional" />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Optional" />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Optional" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Optional" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Payment terms">
                  <Input value={form.paymentTerms} onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })} placeholder="Optional" />
                </Field>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
