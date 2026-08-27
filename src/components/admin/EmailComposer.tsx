'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { EmailTemplate } from '@/lib/admin-types';

interface ShipmentOption {
  id: string;
  trackingNumber: string;
  status: string;
  receiverName: string;
}

interface DocumentLite {
  id: string;
  number: string;
  type: string;
}

type Mode = 'smart' | 'legacy';

export function EmailComposer({ templates }: { templates: EmailTemplate[] }) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('smart');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);

  // Smart mode state
  const [shipments, setShipments] = useState<ShipmentOption[]>([]);
  const [shipmentId, setShipmentId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [documents, setDocuments] = useState<DocumentLite[]>([]);
  const [attachDoc, setAttachDoc] = useState(false);
  const [attachDocumentId, setAttachDocumentId] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');

  // Legacy mode state
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');

  // Load shipment list for the picker once.
  useEffect(() => {
    fetch('/api/admin/shipments', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) => {
        if (!Array.isArray(data)) return;
        setShipments(
          data.map((s) => {
            const row = s as Record<string, unknown>;
            return {
              id: String(row.id ?? ''),
              trackingNumber: String(row.trackingNumber ?? ''),
              status: String(row.status ?? ''),
              receiverName: String(row.receiverName ?? ''),
            };
          }),
        );
      })
      .catch(() => {
        /* dropdown just stays empty */
      });
  }, []);

  // When a shipment is selected, load its documents (for the attach option)
  // and prefill the recipient with the shipment's receiver, if we have an email.
  useEffect(() => {
    setAttachDoc(false);
    setAttachDocumentId('');
    setDocuments([]);
    if (!shipmentId) return;
    fetch(`/api/admin/shipments/${shipmentId}`, { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!data || typeof data !== 'object') return;
        const docs = (data as { documents?: unknown }).documents;
        if (Array.isArray(docs)) {
          setDocuments(
            docs.map((d) => {
              const row = d as Record<string, unknown>;
              return {
                id: String(row.id ?? ''),
                number: String(row.number ?? ''),
                type: String(row.type ?? ''),
              };
            }),
          );
        }
      })
      .catch(() => {
        /* no documents available */
      });
  }, [shipmentId]);

  // Live preview: ask the server to render (templateId + shipmentId) without sending.
  useEffect(() => {
    if (mode !== 'smart' || !templateId) {
      setPreviewHtml('');
      setPreviewSubject('');
      return;
    }
    const controller = new AbortController();
    fetch('/api/admin/emails/send?preview=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      signal: controller.signal,
      body: JSON.stringify({ templateId, shipmentId: shipmentId || undefined }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!data || typeof data !== 'object') return;
        const d = data as { subject?: unknown; html?: unknown };
        setPreviewSubject(typeof d.subject === 'string' ? d.subject : '');
        setPreviewHtml(typeof d.html === 'string' ? d.html : '');
      })
      .catch(() => {
        /* aborted or failed — leave preview as-is */
      });
    return () => controller.abort();
  }, [mode, templateId, shipmentId]);

  function loadLegacyTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setHtml(t.bodyHtml);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const payload =
        mode === 'smart'
          ? {
              to,
              templateId,
              shipmentId: shipmentId || undefined,
              attachDocumentId: attachDoc && attachDocumentId ? attachDocumentId : undefined,
            }
          : { to, subject, html };

      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('send failed');
      toast('success', 'Email queued / sent.');
      setTo('');
    } catch {
      toast('error', 'Failed to send email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={send} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === 'smart' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('smart')}
          >
            Smart sender
          </Button>
          <Button
            type="button"
            variant={mode === 'legacy' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('legacy')}
          >
            Free-form
          </Button>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-fg-muted">To</span>
          <Input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
            required
          />
        </label>

        {mode === 'smart' ? (
          <>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Shipment (optional)</span>
              <Select value={shipmentId} onChange={(e) => setShipmentId(e.target.value)}>
                <option value="">— No shipment (generic) —</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.trackingNumber} · {s.receiverName} · {s.status}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Template</span>
              <Select value={templateId} onChange={(e) => setTemplateId(e.target.value)} required>
                <option value="">— Select a template —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </label>

            {documents.length > 0 && (
              <div className="space-y-2 rounded-lg border border-border p-3">
                <label className="flex items-center gap-2 text-sm text-fg">
                  <input
                    type="checkbox"
                    checked={attachDoc}
                    onChange={(e) => {
                      setAttachDoc(e.target.checked);
                      if (e.target.checked && !attachDocumentId) {
                        setAttachDocumentId(documents[0].id);
                      }
                    }}
                  />
                  Attach document (PDF)
                </label>
                {attachDoc && (
                  <Select
                    value={attachDocumentId}
                    onChange={(e) => setAttachDocumentId(e.target.value)}
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.number} · {d.type}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {templates.length > 0 && (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-fg-muted">Load template</span>
                <Select defaultValue="" onChange={(e) => loadLegacyTemplate(e.target.value)}>
                  <option value="">— Select a template —</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </Select>
              </label>
            )}
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">Subject</span>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-fg-muted">HTML body</span>
              <Textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                className="min-h-[220px] font-mono text-xs"
                required
              />
            </label>
          </>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={busy}>
            {busy ? 'Sending…' : 'Send email'}
          </Button>
        </div>
      </div>

      {/* Live preview (smart mode) */}
      {mode === 'smart' && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-fg-muted">Preview</span>
          {previewSubject && (
            <p className="text-sm text-fg">
              <span className="text-fg-muted">Subject:</span> {previewSubject}
            </p>
          )}
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            {previewHtml ? (
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                className="h-[560px] w-full"
                sandbox=""
              />
            ) : (
              <div className="flex h-[560px] items-center justify-center text-sm text-fg-subtle">
                Select a template to preview
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
