'use client';
import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { EmailTemplate } from '@/lib/admin-types';

interface Draft {
  id?: string;
  name: string;
  subject: string;
  bodyHtml: string;
}

const EMPTY: Draft = { name: '', subject: '', bodyHtml: '' };

export function TemplateList({
  templates,
  onChange,
}: {
  templates: EmailTemplate[];
  onChange: () => void;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [busy, setBusy] = useState(false);

  function openNew() {
    setDraft(EMPTY);
    setOpen(true);
  }
  function openEdit(t: EmailTemplate) {
    setDraft({ id: t.id, name: t.name, subject: t.subject, bodyHtml: t.bodyHtml });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const url = draft.id ? `/api/admin/emails/templates/${draft.id}` : '/api/admin/emails/templates';
      const method = draft.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ name: draft.name, subject: draft.subject, bodyHtml: draft.bodyHtml }),
      });
      if (!res.ok) throw new Error();
      toast('success', draft.id ? 'Template updated.' : 'Template created.');
      setOpen(false);
      onChange();
    } catch {
      toast('error', 'Failed to save template.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/admin/emails/templates/${id}`, { method: 'DELETE', credentials: 'same-origin' });
      if (!res.ok) throw new Error();
      toast('success', 'Template deleted.');
      onChange();
    } catch {
      toast('error', 'Failed to delete template.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openNew}><Plus size={15} /> New template</Button>
      </div>

      {templates.length === 0 ? (
        <div className="card p-8 text-center text-fg-subtle">No templates yet.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <div key={t.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-fg">{t.name}</div>
                  <div className="mt-0.5 truncate text-sm text-fg-muted">{t.subject}</div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => openEdit(t)} aria-label="Edit" className="text-fg-subtle hover:text-fg">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => remove(t.id)} aria-label="Delete" className="text-fg-subtle hover:text-red-400">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={draft.id ? 'Edit template' : 'New template'}>
        <form onSubmit={save} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Name</span>
            <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Subject</span>
            <Input value={draft.subject} onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))} required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">HTML body</span>
            <Textarea
              value={draft.bodyHtml}
              onChange={(e) => setDraft((d) => ({ ...d, bodyHtml: e.target.value }))}
              className="min-h-[180px] font-mono text-xs"
              required
            />
          </label>
          <div className="flex justify-end">
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save template'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

// Small hook to fetch templates from the API, reused by the emails page.
export function useTemplates(): {
  templates: EmailTemplate[];
  reload: () => void;
} {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const reload = useCallback(() => {
    fetch('/api/admin/emails/templates', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: EmailTemplate[]) => setTemplates(Array.isArray(data) ? data : []))
      .catch(() => setTemplates([]));
  }, []);
  useEffect(() => reload(), [reload]);
  return { templates, reload };
}
