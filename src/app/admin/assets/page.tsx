'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Upload, Pencil, Trash2, Stamp, PenTool } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { DocAsset, DocAssetKind } from '@/lib/admin-types';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('read failed'));
    r.readAsDataURL(file);
  });
}

interface PendingUpload {
  kind: DocAssetKind;
  dataUrl: string;
  name: string;
}

function AssetSection({
  kind,
  title,
  subtitle,
  icon: Icon,
  emptyLabel,
  assets,
  onUploadPick,
  onRename,
  onDelete,
}: {
  kind: DocAssetKind;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  emptyLabel: string;
  assets: DocAsset[];
  onUploadPick: (kind: DocAssetKind, file: File) => void;
  onRename: (asset: DocAsset) => void;
  onDelete: (asset: DocAsset) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <section className="card p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-accent/30 bg-accent/10 text-accent">
            <Icon size={17} />
          </span>
          <div>
            <h2 className="text-base font-semibold text-fg">{title}</h2>
            <p className="text-xs text-fg-muted">{subtitle}</p>
          </div>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onUploadPick(kind, f);
            e.target.value = '';
          }}
        />
        <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
          <Upload size={14} /> Upload
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[12px] border border-dashed border-border py-10 text-center">
          <Icon size={22} className="text-fg-subtle" />
          <p className="text-sm text-fg-muted">{emptyLabel}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((a) => (
            <div
              key={a.id}
              className="group overflow-hidden rounded-[12px] border border-border bg-bg-elev transition-colors hover:border-accent/40"
            >
              <div className="checker flex h-28 items-center justify-center p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.dataUrl} alt={a.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="border-t border-border p-3">
                <div className="truncate text-sm font-medium text-fg" title={a.name}>
                  {a.name}
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <button
                    onClick={() => onRename(a)}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-fg-muted transition-colors hover:bg-white/5 hover:text-fg"
                  >
                    <Pencil size={12} /> Rename
                  </button>
                  <button
                    onClick={() => onDelete(a)}
                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-fg-muted transition-colors hover:bg-red-950/40 hover:text-red-300"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function AssetsPage() {
  const toast = useToast();
  const [assets, setAssets] = useState<DocAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<PendingUpload | null>(null);
  const [renaming, setRenaming] = useState<DocAsset | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleting, setDeleting] = useState<DocAsset | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetch('/api/admin/doc-assets', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: DocAsset[]) => setAssets(Array.isArray(d) ? d : []))
      .catch(() => toast('error', 'Failed to load assets.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => load(), [load]);

  async function onUploadPick(kind: DocAssetKind, file: File) {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const base = file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
      setPending({ kind, dataUrl, name: base || (kind === 'STAMP' ? 'Stamp' : 'Signature') });
    } catch {
      toast('error', 'Could not read that file.');
    }
  }

  async function confirmUpload() {
    if (!pending || !pending.name.trim()) return;
    setBusy(true);
    const res = await fetch('/api/admin/doc-assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ name: pending.name.trim(), kind: pending.kind, dataUrl: pending.dataUrl }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast('error', j.error ?? 'Upload failed.');
      return;
    }
    setPending(null);
    toast('success', `${pending.kind === 'STAMP' ? 'Stamp' : 'Signature'} added.`);
    load();
  }

  async function confirmRename() {
    if (!renaming || !renameValue.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/admin/doc-assets/${renaming.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ name: renameValue.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      toast('error', 'Rename failed.');
      return;
    }
    setRenaming(null);
    toast('success', 'Renamed.');
    load();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    const res = await fetch(`/api/admin/doc-assets/${deleting.id}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    setBusy(false);
    if (!res.ok) {
      toast('error', 'Delete failed.');
      return;
    }
    setDeleting(null);
    toast('success', 'Deleted.');
    load();
  }

  const stamps = assets.filter((a) => a.kind === 'STAMP');
  const signatures = assets.filter((a) => a.kind === 'SIGNATURE');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Stamps &amp; Signatures</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Reusable images placed on generated documents. Transparent PNGs work best.
        </p>
      </div>

      {loading ? (
        <div className="text-fg-muted">Loading…</div>
      ) : (
        <>
          <AssetSection
            kind="STAMP"
            title="Stamps"
            subtitle="Company seals and round stamps."
            icon={Stamp}
            emptyLabel="No stamps yet — upload one."
            assets={stamps}
            onUploadPick={onUploadPick}
            onRename={(a) => {
              setRenaming(a);
              setRenameValue(a.name);
            }}
            onDelete={setDeleting}
          />
          <AssetSection
            kind="SIGNATURE"
            title="Signatures"
            subtitle="Handwritten signatures for the authorised-by line."
            icon={PenTool}
            emptyLabel="No signatures yet — upload one."
            assets={signatures}
            onUploadPick={onUploadPick}
            onRename={(a) => {
              setRenaming(a);
              setRenameValue(a.name);
            }}
            onDelete={setDeleting}
          />
        </>
      )}

      {/* name the new upload */}
      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title={pending?.kind === 'STAMP' ? 'New stamp' : 'New signature'}
      >
        {pending && (
          <div className="space-y-4">
            <div className="checker flex h-32 items-center justify-center rounded-[10px] border border-border p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={pending.dataUrl} alt="preview" className="max-h-full max-w-full object-contain" />
            </div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-fg-muted">Name</span>
              <Input
                value={pending.name}
                autoFocus
                onChange={(e) => setPending({ ...pending, name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && confirmUpload()}
                placeholder="e.g. CTL Round Stamp"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </Button>
              <Button onClick={confirmUpload} disabled={busy || !pending.name.trim()}>
                {busy ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* rename */}
      <Modal open={!!renaming} onClose={() => setRenaming(null)} title="Rename asset">
        <div className="space-y-4">
          <Input
            value={renameValue}
            autoFocus
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRenaming(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRename} disabled={busy || !renameValue.trim()}>
              {busy ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* delete confirm */}
      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Delete asset">
        <div className="space-y-4">
          <p className="text-sm text-fg-muted">
            Delete <span className="font-medium text-fg">{deleting?.name}</span>? Documents that already used it keep
            their generated PDF, but it can no longer be selected.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
