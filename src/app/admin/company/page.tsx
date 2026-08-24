'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface Profile {
  name: string;
  short: string;
  regLabel: string;
  reg: string;
  vat: string;
  address: string;
  phone: string;
  email: string;
  logo: string;
}

const EMPTY: Profile = {
  name: '', short: '', regLabel: 'Company No.', reg: '', vat: '',
  address: '', phone: '', email: '', logo: '/img/docs/logo.png',
};

const FIELDS: { key: keyof Profile; label: string; hint?: string; full?: boolean }[] = [
  { key: 'name', label: 'Company name', full: true },
  { key: 'short', label: 'Short name / initials' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Registered address', full: true },
  { key: 'regLabel', label: 'Reg. label', hint: 'e.g. "Company No."' },
  { key: 'reg', label: 'Company number' },
  { key: 'vat', label: 'VAT number' },
  { key: 'logo', label: 'Logo path', hint: '/img/... in public', full: true },
];

export default function CompanyProfilePage() {
  const toast = useToast();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/settings', { credentials: 'same-origin' });
        const data = await res.json();
        if (data['company.profile']) setProfile({ ...EMPTY, ...data['company.profile'] });
      } catch {
        toast('error', 'Failed to load company profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const set = (k: keyof Profile, v: string) => setProfile((p) => ({ ...p, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ key: 'company.profile', value: profile }),
      });
      if (!res.ok) throw new Error();
      toast('success', 'Company profile saved — applied across the site and documents');
    } catch {
      toast('error', 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-fg-muted">Loading…</div>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-fg">Company profile</h1>
      <p className="mt-1 text-sm text-fg-muted">
        Your company details. Used across the website (headers, footers, contact) and on every
        generated document (invoices, bills of lading, inspection reports).
      </p>

      <div className="mt-6 card p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <label key={f.key} className={`block space-y-1.5 ${f.full ? 'sm:col-span-2' : ''}`}>
            <span className="text-xs font-medium text-fg-muted">
              {f.label}
              {f.hint && <span className="text-fg-subtle"> — {f.hint}</span>}
            </span>
            <Input value={profile[f.key]} onChange={(e) => set(f.key, e.target.value)} />
          </label>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save company profile'}
        </Button>
        <span className="text-xs text-fg-subtle">
          Logo &amp; stamp images are managed under Assets.
        </span>
      </div>
    </div>
  );
}
