'use client';
import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { EmailTemplate } from '@/lib/admin-types';

export function EmailComposer({ templates }: { templates: EmailTemplate[] }) {
  const toast = useToast();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('');
  const [busy, setBusy] = useState(false);

  function loadTemplate(id: string) {
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setSubject(t.subject);
    setHtml(t.bodyHtml);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ to, subject, html }),
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
    <form onSubmit={send} className="max-w-2xl space-y-4">
      {templates.length > 0 && (
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-fg-muted">Load template</span>
          <Select defaultValue="" onChange={(e) => loadTemplate(e.target.value)}>
            <option value="">— Select a template —</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>
        </label>
      )}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-fg-muted">To</span>
        <Input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="recipient@example.com" required />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-fg-muted">Subject</span>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} required />
      </label>
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-fg-muted">HTML body</span>
        <Textarea value={html} onChange={(e) => setHtml(e.target.value)} className="min-h-[220px] font-mono text-xs" required />
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send email'}</Button>
      </div>
    </form>
  );
}
