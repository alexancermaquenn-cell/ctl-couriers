'use client';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { CURRENCIES, currencySymbol, formatMoney } from '@/lib/currency';
import { Plus, Trash2, ArrowLeft, FileDown } from 'lucide-react';
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type Client,
  type DocAsset,
} from '@/lib/admin-types';
import type {
  DocumentDesign,
  Party,
  LineItem,
  BolGood,
  ChecklistItem,
  Vehicle,
  BankDetails,
  OriginalBank,
  InvoiceSummary,
  InvoiceData,
  BillOfLadingData,
  InspectionData,
  DocumentData,
  CompanyProfile,
} from '@/lib/doc-types';

// ---------- small field wrappers ----------
function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 block text-xs font-medium text-fg-muted">
      {children}
      {hint && <span className="ml-1 text-fg-subtle">({hint})</span>}
    </span>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-fg-subtle">{title}</h3>
      {children}
    </div>
  );
}

// ---------- party editor ----------
function PartyEditor({
  value,
  onChange,
}: {
  value: Party;
  onChange: (p: Party) => void;
}) {
  const set = (k: keyof Party, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <label className="sm:col-span-2">
        <Label>Name</Label>
        <Input value={value.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
      </label>
      <label>
        <Label hint="optional">Company</Label>
        <Input value={value.company ?? ''} onChange={(e) => set('company', e.target.value)} />
      </label>
      <label>
        <Label hint="optional">VAT</Label>
        <Input value={value.vat ?? ''} onChange={(e) => set('vat', e.target.value)} />
      </label>
      <label>
        <Label hint="optional">Email</Label>
        <Input value={value.email ?? ''} onChange={(e) => set('email', e.target.value)} />
      </label>
      <label>
        <Label hint="optional">Phone</Label>
        <Input value={value.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
      </label>
      <label className="sm:col-span-2">
        <Label hint="optional">Address</Label>
        <Input value={value.address ?? ''} onChange={(e) => set('address', e.target.value)} />
      </label>
    </div>
  );
}

// ---------- default builders ----------
const today = () => new Date().toISOString().slice(0, 10);
const emptyParty = (): Party => ({ name: '' });

function defaultInvoice(): InvoiceData {
  return {
    billTo: emptyParty(),
    docNumber: '',
    issueDate: today(),
    lineItems: [{ description: '', qty: 1, unitPrice: 0 }],
    taxRate: 0,
    placeSeal: true,
  };
}
function defaultBol(): BillOfLadingData {
  return {
    shipper: emptyParty(),
    consignee: emptyParty(),
    docNumber: '',
    date: today(),
    origin: '',
    destination: '',
    goods: [{ description: '', qty: 1 }],
    placeSeal: true,
  };
}
function defaultInspection(): InspectionData {
  return {
    vehicle: { make: '', model: '' },
    docNumber: '',
    date: today(),
    checklist: [
      { item: 'Exterior bodywork', condition: '' },
      { item: 'Interior', condition: '' },
      { item: 'Engine & mechanical', condition: '' },
      { item: 'Tyres', condition: '' },
    ],
    placeSeal: true,
  };
}

function partyFromClient(c: Client): Party {
  const p: Party = { name: c.fullName };
  if (c.company) p.company = c.company;
  if (c.address) p.address = c.address;
  if (c.email) p.email = c.email;
  if (c.phone) p.phone = c.phone;
  if (c.vatNumber) p.vat = c.vatNumber;
  return p;
}

// Compose a line-item description from vehicle fields, e.g. "2016 AUDI Q3 · VIN … · 35,464 KM".
// VIN and odometer are optional and omitted when blank.
function buildVehicleDescription(v: Vehicle): string {
  const head = [v.year?.trim(), v.make?.trim(), v.model?.trim()].filter(Boolean).join(' ');
  const parts: string[] = [];
  if (head) parts.push(head);
  if (v.vin?.trim()) parts.push(`VIN ${v.vin.trim()}`);
  if (v.odometer?.trim()) parts.push(`${v.odometer.trim()} KM`);
  return parts.join(' · ');
}

function emptyVehicle(): Vehicle {
  return { make: '', model: '' };
}

// Strip empty optional strings so the API/PDF never sees blank labels.
function cleanParty(p: Party): Party {
  const out: Party = { name: p.name.trim() };
  if (p.company?.trim()) out.company = p.company.trim();
  if (p.address?.trim()) out.address = p.address.trim();
  if (p.email?.trim()) out.email = p.email.trim();
  if (p.phone?.trim()) out.phone = p.phone.trim();
  if (p.vat?.trim()) out.vat = p.vat.trim();
  return out;
}

export function DocumentEditor() {
  const router = useRouter();
  const toast = useToast();
  const search = useSearchParams();
  const initialType = (search.get('type') as DocumentType) || 'INVOICE';
  const initialClientId = search.get('clientId') || '';

  const [type, setType] = useState<DocumentType>(
    DOCUMENT_TYPES.includes(initialType) ? initialType : 'INVOICE'
  );
  const [design, setDesign] = useState<DocumentDesign>('A');
  const [currency, setCurrency] = useState<string>('EUR');
  const [clientId, setClientId] = useState<string>(initialClientId);
  const [clients, setClients] = useState<Client[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [stampAssets, setStampAssets] = useState<DocAsset[]>([]);
  const [signatureAssets, setSignatureAssets] = useState<DocAsset[]>([]);
  const [stampAssetId, setStampAssetId] = useState<string>('');
  const [signatureAssetId, setSignatureAssetId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // One state object per type; kept independent so switching type doesn't lose data.
  const [invoice, setInvoice] = useState<InvoiceData>(defaultInvoice);
  const [bol, setBol] = useState<BillOfLadingData>(defaultBol);
  const [inspection, setInspection] = useState<InspectionData>(defaultInspection);

  // Load clients + settings.
  useEffect(() => {
    fetch('/api/admin/clients', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d: Client[]) => setClients(Array.isArray(d) ? d : []))
      .catch(() => {});
    fetch('/api/admin/settings', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((s: { 'company.profile': CompanyProfile } | null) => {
        if (s) setProfile(s['company.profile']);
      })
      .catch(() => {});
    (['STAMP', 'SIGNATURE'] as const).forEach((kind) => {
      fetch(`/api/admin/doc-assets?kind=${kind}`, { credentials: 'same-origin' })
        .then((r) => (r.ok ? r.json() : []))
        .then((list: DocAsset[]) => {
          const assets = Array.isArray(list) ? list : [];
          if (kind === 'STAMP') {
            setStampAssets(assets);
            setStampAssetId((prev) => prev || assets[0]?.id || '');
          } else {
            setSignatureAssets(assets);
            setSignatureAssetId((prev) => prev || assets[0]?.id || '');
          }
        })
        .catch(() => {});
    });
  }, []);

  // Prefill billTo / consignee / inspection client when a client is chosen.
  const applyClient = useCallback((c: Client) => {
    const party = partyFromClient(c);
    setInvoice((v) => ({ ...v, billTo: party }));
    setBol((v) => ({ ...v, consignee: party }));
    setInspection((v) => ({ ...v, client: { name: c.fullName, ...(c.company ? { company: c.company } : {}) } }));
  }, []);

  // Apply the pre-selected client once clients are loaded.
  useEffect(() => {
    if (!initialClientId || clients.length === 0) return;
    const c = clients.find((x) => x.id === initialClientId);
    if (c) applyClient(c);
    // run once when clients arrive
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients]);

  function onPickClient(id: string) {
    setClientId(id);
    const c = clients.find((x) => x.id === id);
    if (c) applyClient(c);
  }

  // ---------- invoice totals (derived, never stored) ----------
  const totals = useMemo(() => {
    const subtotal = invoice.lineItems.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
    const tax = subtotal * ((Number(invoice.taxRate) || 0) / 100);
    return { subtotal, tax, total: subtotal + tax };
  }, [invoice.lineItems, invoice.taxRate]);

  const placeSeal =
    type === 'INVOICE' ? invoice.placeSeal : type === 'BILL_OF_LADING' ? bol.placeSeal : inspection.placeSeal;
  function setPlaceSeal(v: boolean) {
    if (type === 'INVOICE') setInvoice((s) => ({ ...s, placeSeal: v }));
    else if (type === 'BILL_OF_LADING') setBol((s) => ({ ...s, placeSeal: v }));
    else setInspection((s) => ({ ...s, placeSeal: v }));
  }

  // ---------- build payload + generate ----------
  function buildDataJson(): DocumentData {
    if (type === 'INVOICE') {
      const veh = invoice.vehicle;
      return {
        ...invoice,
        billTo: cleanParty(invoice.billTo),
        shipper: invoice.shipper && invoice.shipper.name.trim() ? cleanParty(invoice.shipper) : undefined,
        vehicle: veh && (veh.make.trim() || veh.model.trim()) ? veh : undefined,
        lineItems: invoice.lineItems.filter((it) => it.description.trim() || it.qty || it.unitPrice),
        taxRate: Number(invoice.taxRate) || 0,
      };
    }
    if (type === 'BILL_OF_LADING') {
      return {
        ...bol,
        shipper: cleanParty(bol.shipper),
        consignee: cleanParty(bol.consignee),
        goods: bol.goods.filter((g) => g.description.trim()),
      };
    }
    return {
      ...inspection,
      checklist: inspection.checklist.filter((c) => c.item.trim()),
    };
  }

  async function generate() {
    setSaving(true);
    const res = await fetch('/api/admin/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        type,
        design,
        currency,
        clientId: clientId || undefined,
        stampAssetId: stampAssetId || undefined,
        signatureAssetId: signatureAssetId || undefined,
        dataJson: buildDataJson(),
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast('error', 'Failed to generate document.');
      return;
    }
    const doc: { id: string } = await res.json();
    toast('success', 'Document generated.');
    window.open(`/api/admin/documents/${doc.id}/pdf`, '_blank');
    router.push('/admin/documents');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <h1 className="text-2xl font-semibold text-fg">New document</h1>
          <p className="mt-1 text-sm text-fg-muted">Pick a type and design, fill the fields, then generate the PDF.</p>
        </div>
        <Button onClick={generate} disabled={saving} size="lg">
          <FileDown size={17} /> {saving ? 'Generating…' : 'Generate PDF'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_minmax(300px,380px)] lg:grid-cols-[1fr_minmax(320px,420px)]">
        {/* ---------------- FORM COLUMN ---------------- */}
        <div className="space-y-6">
          {/* type + design + client */}
          <Section title="Document">
            <div className="space-y-4">
              <div>
                <Label>Type</Label>
                <div className="flex flex-wrap gap-2">
                  {DOCUMENT_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setType(t)}
                      className={cn(
                        'rounded-[10px] border px-4 py-2 text-sm font-medium transition-all',
                        type === t
                          ? 'border-accent/50 bg-accent/10 text-accent'
                          : 'border-border bg-bg-elev text-fg-muted hover:text-fg'
                      )}
                    >
                      {DOCUMENT_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Design</Label>
                <div className="inline-flex overflow-hidden rounded-[10px] border border-border">
                  {(['ORIGINAL', 'A', 'B'] as DocumentDesign[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDesign(d)}
                      className={cn(
                        'px-5 py-2 text-sm font-medium transition-colors',
                        design === d ? 'bg-accent text-white' : 'bg-bg-elev text-fg-muted hover:text-fg'
                      )}
                    >
                      {d === 'ORIGINAL' ? 'Original · Faithful' : d === 'A' ? 'A · Corporate' : 'B · Minimal'}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <Label>Currency</Label>
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)} className="max-w-[220px]">
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code === c.symbol ? c.code : `${c.code} — ${c.symbol}`}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="block">
                <Label hint="optional">Client</Label>
                <Select value={clientId} onChange={(e) => onPickClient(e.target.value)}>
                  <option value="">— No client —</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company ? `${c.company} · ${c.fullName}` : c.fullName}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          </Section>

          {/* per-type fields */}
          {type === 'INVOICE' && (
            <InvoiceFields
              data={invoice}
              onChange={setInvoice}
              totals={totals}
              currency={currency}
            />
          )}
          {type === 'BILL_OF_LADING' && <BolFields data={bol} onChange={setBol} />}
          {type === 'INSPECTION' && <InspectionFields data={inspection} onChange={setInspection} />}

          {/* stamp + signature */}
          <Section title="Stamp & signature">
            <label className="mb-4 flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={!!placeSeal}
                onChange={(e) => setPlaceSeal(e.target.checked)}
                className="h-4 w-4 accent-[#e11d2a]"
              />
              <span className="text-sm text-fg">Place stamp &amp; signature on this document</span>
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SealPicker
                label="Stamp"
                assets={stampAssets}
                value={stampAssetId}
                onChange={setStampAssetId}
              />
              <SealPicker
                label="Signature"
                assets={signatureAssets}
                value={signatureAssetId}
                onChange={setSignatureAssetId}
              />
            </div>
            <p className="mt-3 text-xs text-fg-subtle">
              Manage the library in{' '}
              <Link href="/admin/assets" className="text-accent hover:underline">
                Stamps &amp; Signatures
              </Link>
              .
            </p>
          </Section>
        </div>

        {/* ---------------- PREVIEW COLUMN ---------------- */}
        {/* Below md the preview stacks first with a capped, scrollable height so it
            stays reachable while editing; from md up it becomes the sticky side column. */}
        <div className="order-first max-h-[55vh] overflow-y-auto md:order-none md:max-h-none md:overflow-visible lg:sticky lg:top-6 lg:self-start">
          <Preview
            type={type}
            design={design}
            currency={currency}
            profile={profile}
            invoice={invoice}
            bol={bol}
            inspection={inspection}
            totals={totals}
            placeSeal={!!placeSeal}
            stampUrl={stampAssets.find((a) => a.id === stampAssetId)?.dataUrl ?? null}
            signatureUrl={signatureAssets.find((a) => a.id === signatureAssetId)?.dataUrl ?? null}
          />
        </div>
      </div>
    </div>
  );
}

// =================== SEAL (STAMP / SIGNATURE) PICKER ===================
function SealPicker({
  label,
  assets,
  value,
  onChange,
}: {
  label: string;
  assets: DocAsset[];
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = assets.find((a) => a.id === value);
  return (
    <div className="rounded-[10px] border border-border bg-bg-elev p-3">
      <div className="mb-2 text-xs font-medium text-fg-muted">{label}</div>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— None —</option>
        {assets.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </Select>
      <div className="checker mt-3 flex h-16 items-center justify-center overflow-hidden rounded p-1.5">
        {selected ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.dataUrl} alt={selected.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-fg-subtle">None selected</span>
        )}
      </div>
    </div>
  );
}

// =================== SHARED VEHICLE SECTION ===================
// Lifted out of the inspection form so every document type reuses the same fields.
function VehicleSection({ value, onChange }: { value: Vehicle; onChange: (v: Vehicle) => void }) {
  const set = (patch: Partial<Vehicle>) => onChange({ ...value, ...patch });
  return (
    <Section title="Vehicle">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label>
          <Label>Make</Label>
          <Input value={value.make} onChange={(e) => set({ make: e.target.value })} />
        </label>
        <label>
          <Label>Model</Label>
          <Input value={value.model} onChange={(e) => set({ model: e.target.value })} />
        </label>
        <label>
          <Label hint="optional">Year</Label>
          <Input value={value.year ?? ''} onChange={(e) => set({ year: e.target.value })} />
        </label>
        <label>
          <Label hint="optional">VIN</Label>
          <Input value={value.vin ?? ''} onChange={(e) => set({ vin: e.target.value })} />
        </label>
        <label>
          <Label hint="optional">Registration</Label>
          <Input value={value.registration ?? ''} onChange={(e) => set({ registration: e.target.value })} />
        </label>
        <label>
          <Label hint="optional">Colour</Label>
          <Input value={value.colour ?? ''} onChange={(e) => set({ colour: e.target.value })} />
        </label>
        <label>
          <Label hint="optional">Odometer</Label>
          <Input value={value.odometer ?? ''} onChange={(e) => set({ odometer: e.target.value })} />
        </label>
        <label>
          <Label hint="optional">Fuel</Label>
          <Input value={value.fuel ?? ''} onChange={(e) => set({ fuel: e.target.value })} />
        </label>
        <label>
          <Label hint="optional">Keys</Label>
          <Input value={value.keys ?? ''} onChange={(e) => set({ keys: e.target.value })} />
        </label>
      </div>
    </Section>
  );
}

// =================== INVOICE FIELDS ===================
function InvoiceFields({
  data,
  onChange,
  totals,
  currency,
}: {
  data: InvoiceData;
  onChange: (d: InvoiceData) => void;
  totals: { subtotal: number; tax: number; total: number };
  currency: string;
}) {
  // Tracks whether the user manually edited the first line's description; once true we
  // never clobber it from the vehicle (until an explicit "Re-fill from vehicle").
  const descTouched = useRef(false);
  const set = <K extends keyof InvoiceData>(k: K, v: InvoiceData[K]) => onChange({ ...data, [k]: v });
  const setItem = (i: number, patch: Partial<LineItem>) => {
    // If the user edits the first description, stop auto-filling it from the vehicle.
    if (i === 0 && patch.description !== undefined) descTouched.current = true;
    const lineItems = data.lineItems.map((it, idx) => (idx === i ? { ...it, ...patch } : it));
    onChange({ ...data, lineItems });
  };
  const bank: BankDetails = data.bankDetails ?? { bank: '', iban: '', bic: '', ref: '' };
  const setBank = (patch: Partial<BankDetails>) => onChange({ ...data, bankDetails: { ...bank, ...patch } });

  // ORIGINAL-only bank extras (accountName / bankAddress / accountAddress).
  const bankOrig: OriginalBank = data.bank ?? {};
  const setBankOrig = (patch: Partial<OriginalBank>) => onChange({ ...data, bank: { ...bankOrig, ...patch } });

  // ORIGINAL-only SUMMARY breakdown.
  const summary: InvoiceSummary = data.summary ?? {};
  const setSummary = (patch: Partial<InvoiceSummary>) => onChange({ ...data, summary: { ...summary, ...patch } });
  const numOrUndef = (s: string): number | undefined => {
    const t = s.trim();
    if (t === '') return undefined;
    const n = Number(t);
    return Number.isFinite(n) ? n : undefined;
  };

  const vehicle = data.vehicle ?? emptyVehicle();
  // Auto-fill the FIRST line-item description from the vehicle, unless the user typed one.
  const applyVehicle = (v: Vehicle) => {
    const desc = buildVehicleDescription(v);
    const first = data.lineItems[0];
    const canAutofill = first && !descTouched.current;
    const lineItems =
      canAutofill && desc
        ? data.lineItems.map((it, idx) => (idx === 0 ? { ...it, description: desc } : it))
        : data.lineItems;
    onChange({ ...data, vehicle: v, lineItems });
  };
  // Explicit re-fill: overwrite the first description from the vehicle, re-arming auto-fill.
  const refillFromVehicle = () => {
    const desc = buildVehicleDescription(vehicle);
    if (!desc || data.lineItems.length === 0) return;
    descTouched.current = false;
    onChange({ ...data, lineItems: data.lineItems.map((it, idx) => (idx === 0 ? { ...it, description: desc } : it)) });
  };

  return (
    <>
      <VehicleSection value={vehicle} onChange={applyVehicle} />

      <Section title="Bill to">
        <PartyEditor value={data.billTo} onChange={(p) => set('billTo', p)} />
      </Section>

      <Section title="Shipper (optional)">
        <PartyEditor value={data.shipper ?? { name: '' }} onChange={(p) => set('shipper', p)} />
      </Section>

      <Section title="Invoice details">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label>
            <Label>Issue date</Label>
            <Input type="date" value={data.issueDate} onChange={(e) => set('issueDate', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Due date</Label>
            <Input type="date" value={data.dueDate ?? ''} onChange={(e) => set('dueDate', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Service</Label>
            <Input value={data.service ?? ''} onChange={(e) => set('service', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Origin</Label>
            <Input value={data.origin ?? ''} onChange={(e) => set('origin', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Destination</Label>
            <Input value={data.destination ?? ''} onChange={(e) => set('destination', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Incoterm</Label>
            <Input value={data.incoterm ?? ''} onChange={(e) => set('incoterm', e.target.value)} />
          </label>
        </div>
      </Section>

      <Section title="Line items">
        <div className="space-y-2">
          {data.lineItems.map((it, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_100px_36px] items-center gap-2">
              <Input
                placeholder="Description"
                value={it.description}
                onChange={(e) => setItem(i, { description: e.target.value })}
              />
              <Input
                type="number"
                min={0}
                placeholder="Qty"
                value={it.qty}
                onChange={(e) => setItem(i, { qty: Number(e.target.value) })}
              />
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder={`Unit ${currencySymbol(currency)}`}
                value={it.unitPrice}
                onChange={(e) => setItem(i, { unitPrice: Number(e.target.value) })}
              />
              <button
                onClick={() => onChange({ ...data, lineItems: data.lineItems.filter((_, idx) => idx !== i) })}
                className="flex h-9 items-center justify-center rounded-[10px] text-fg-subtle hover:text-red-400"
                aria-label="Remove line"
                disabled={data.lineItems.length === 1}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange({ ...data, lineItems: [...data.lineItems, { description: '', qty: 1, unitPrice: 0 }] })}
          >
            <Plus size={14} /> Add line
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={refillFromVehicle}
            disabled={!buildVehicleDescription(vehicle)}
            title="Overwrite the first line's description from the vehicle fields"
          >
            Re-fill from vehicle
          </Button>
        </div>

        <div className="mt-5 flex flex-col items-end gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex w-56 items-center justify-between text-fg-muted">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatMoney(totals.subtotal, currency)}</span>
          </div>
          <div className="flex w-56 items-center justify-between text-fg-muted">
            <span className="inline-flex items-center gap-2">
              Tax
              <Input
                type="number"
                min={0}
                step="0.1"
                value={data.taxRate}
                onChange={(e) => set('taxRate', Number(e.target.value))}
                className="h-7 w-16 px-2 text-xs"
              />
              %
            </span>
            <span className="tabular-nums">{formatMoney(totals.tax, currency)}</span>
          </div>
          <div className="flex w-56 items-center justify-between border-t border-border pt-2 text-base font-semibold text-fg">
            <span>Total</span>
            <span className="tabular-nums text-accent-bright">{formatMoney(totals.total, currency)}</span>
          </div>
        </div>
      </Section>

      <Section title="Bank details (optional)">
        <div className="grid grid-cols-2 gap-3">
          <label>
            <Label>Bank</Label>
            <Input value={bank.bank} onChange={(e) => setBank({ bank: e.target.value })} />
          </label>
          <label>
            <Label>Reference</Label>
            <Input value={bank.ref ?? ''} onChange={(e) => setBank({ ref: e.target.value })} />
          </label>
          <label>
            <Label>IBAN</Label>
            <Input value={bank.iban} onChange={(e) => setBank({ iban: e.target.value })} />
          </label>
          <label>
            <Label>BIC</Label>
            <Input value={bank.bic} onChange={(e) => setBank({ bic: e.target.value })} />
          </label>
        </div>
      </Section>

      <Section title="Bank — full block (ORIGINAL design only, optional)">
        <p className="mb-3 text-xs text-fg-subtle">Extra fields that appear on the ORIGINAL invoice&apos;s BANK TRANSFER INSTRUCTIONS panel. Leave blank to skip.</p>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <Label>Account name</Label>
            <Input value={bankOrig.accountName ?? ''} onChange={(e) => setBankOrig({ accountName: e.target.value })} />
          </label>
          <label>
            <Label>Bank address</Label>
            <Input value={bankOrig.bankAddress ?? ''} onChange={(e) => setBankOrig({ bankAddress: e.target.value })} />
          </label>
          <label className="col-span-2">
            <Label>Account address</Label>
            <Input value={bankOrig.accountAddress ?? ''} onChange={(e) => setBankOrig({ accountAddress: e.target.value })} />
          </label>
        </div>
      </Section>

      <Section title="Invoice extras (ORIGINAL design only, optional)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label>
            <Label hint="e.g. PO-2026-14">PO number</Label>
            <Input value={data.poNumber ?? ''} onChange={(e) => set('poNumber', e.target.value)} />
          </label>
          <label>
            <Label hint="e.g. DDP, Net 30">Terms</Label>
            <Input value={data.terms ?? ''} onChange={(e) => set('terms', e.target.value)} />
          </label>
          <label>
            <Label hint="e.g. Sale">Reason for export</Label>
            <Input value={data.reasonForExport ?? ''} onChange={(e) => set('reasonForExport', e.target.value)} />
          </label>
          <label>
            <Label hint="default: currency code">Country of origin</Label>
            <Input value={data.countryOfOrigin ?? ''} onChange={(e) => set('countryOfOrigin', e.target.value)} />
          </label>
        </div>
      </Section>

      <Section title="Summary breakdown (ORIGINAL design only, optional)">
        <p className="mb-3 text-xs text-fg-subtle">Populate to override the auto-computed SUMMARY panel. Leave blank to use line-item totals.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label>
            <Label>Prepaid value</Label>
            <Input type="number" step="0.01" value={summary.prepaidValue ?? ''} onChange={(e) => setSummary({ prepaidValue: numOrUndef(e.target.value) })} />
          </label>
          <label>
            <Label>Sale value</Label>
            <Input type="number" step="0.01" value={summary.saleValue ?? ''} onChange={(e) => setSummary({ saleValue: numOrUndef(e.target.value) })} />
          </label>
          <label>
            <Label>Shipping &amp; handling</Label>
            <Input type="number" step="0.01" value={summary.shippingHandling ?? ''} onChange={(e) => setSummary({ shippingHandling: numOrUndef(e.target.value) })} />
          </label>
          <label>
            <Label>Total value</Label>
            <Input type="number" step="0.01" value={summary.totalValue ?? ''} onChange={(e) => setSummary({ totalValue: numOrUndef(e.target.value) })} />
          </label>
          <label>
            <Label>Deposit value</Label>
            <Input type="number" step="0.01" value={summary.depositValue ?? ''} onChange={(e) => setSummary({ depositValue: numOrUndef(e.target.value) })} />
          </label>
          <label>
            <Label>Balance</Label>
            <Input type="number" step="0.01" value={summary.balance ?? ''} onChange={(e) => setSummary({ balance: numOrUndef(e.target.value) })} />
          </label>
          <label>
            <Label>Total to pay</Label>
            <Input type="number" step="0.01" value={summary.totalToPay ?? ''} onChange={(e) => setSummary({ totalToPay: numOrUndef(e.target.value) })} />
          </label>
          <label className="col-span-2">
            <Label hint="e.g. CTL-INV-2026-0001">Previous invoice</Label>
            <Input value={summary.previousInvoice ?? ''} onChange={(e) => setSummary({ previousInvoice: e.target.value || undefined })} />
          </label>
        </div>
      </Section>

      <Section title="Notes (optional)">
        <Textarea value={data.notes ?? ''} onChange={(e) => set('notes', e.target.value)} placeholder="Payment terms, remarks…" />
      </Section>
    </>
  );
}

// =================== BILL OF LADING FIELDS ===================
function BolFields({ data, onChange }: { data: BillOfLadingData; onChange: (d: BillOfLadingData) => void }) {
  const set = <K extends keyof BillOfLadingData>(k: K, v: BillOfLadingData[K]) => onChange({ ...data, [k]: v });
  const setGood = (i: number, patch: Partial<BolGood>) =>
    onChange({ ...data, goods: data.goods.map((g, idx) => (idx === i ? { ...g, ...patch } : g)) });

  return (
    <>
      <Section title="Shipper">
        <PartyEditor value={data.shipper} onChange={(p) => set('shipper', p)} />
      </Section>
      <Section title="Consignee">
        <PartyEditor value={data.consignee} onChange={(p) => set('consignee', p)} />
      </Section>

      <Section title="Shipment details">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label>
            <Label>Date</Label>
            <Input type="date" value={data.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Carrier</Label>
            <Input value={data.carrier ?? ''} onChange={(e) => set('carrier', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Tracking #</Label>
            <Input value={data.trackingNumber ?? ''} onChange={(e) => set('trackingNumber', e.target.value)} />
          </label>
          <label>
            <Label>Origin</Label>
            <Input value={data.origin} onChange={(e) => set('origin', e.target.value)} />
          </label>
          <label>
            <Label>Destination</Label>
            <Input value={data.destination} onChange={(e) => set('destination', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Service</Label>
            <Input value={data.service ?? ''} onChange={(e) => set('service', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Weight (kg)</Label>
            <Input
              type="number"
              value={data.weightKg ?? ''}
              onChange={(e) => set('weightKg', e.target.value ? Number(e.target.value) : undefined)}
            />
          </label>
          <label>
            <Label hint="optional">Pieces</Label>
            <Input
              type="number"
              value={data.pieces ?? ''}
              onChange={(e) => set('pieces', e.target.value ? Number(e.target.value) : undefined)}
            />
          </label>
          <label>
            <Label hint="optional">Incoterm</Label>
            <Input value={data.incoterm ?? ''} onChange={(e) => set('incoterm', e.target.value)} />
          </label>
        </div>
      </Section>

      <Section title="Goods">
        <div className="space-y-2">
          {data.goods.map((g, i) => (
            <div key={i} className="grid grid-cols-[80px_1fr_60px_80px_36px] items-center gap-2">
              <Input placeholder="Marks" value={g.marks ?? ''} onChange={(e) => setGood(i, { marks: e.target.value })} />
              <Input placeholder="Description" value={g.description} onChange={(e) => setGood(i, { description: e.target.value })} />
              <Input type="number" min={0} placeholder="Qty" value={g.qty} onChange={(e) => setGood(i, { qty: Number(e.target.value) })} />
              <Input placeholder="Weight" value={g.weight ?? ''} onChange={(e) => setGood(i, { weight: e.target.value })} />
              <button
                onClick={() => onChange({ ...data, goods: data.goods.filter((_, idx) => idx !== i) })}
                className="flex h-9 items-center justify-center rounded-[10px] text-fg-subtle hover:text-red-400"
                aria-label="Remove good"
                disabled={data.goods.length === 1}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => onChange({ ...data, goods: [...data.goods, { description: '', qty: 1 }] })}
        >
          <Plus size={14} /> Add goods row
        </Button>
      </Section>

      <Section title="Notes (optional)">
        <Textarea value={data.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </Section>
    </>
  );
}

// =================== INSPECTION FIELDS ===================
function InspectionFields({ data, onChange }: { data: InspectionData; onChange: (d: InspectionData) => void }) {
  const set = <K extends keyof InspectionData>(k: K, v: InspectionData[K]) => onChange({ ...data, [k]: v });
  const setRow = (i: number, patch: Partial<ChecklistItem>) =>
    onChange({ ...data, checklist: data.checklist.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });

  return (
    <>
      <VehicleSection value={data.vehicle} onChange={(v) => set('vehicle', v)} />

      <Section title="Inspection">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label>
            <Label>Date</Label>
            <Input type="date" value={data.date} onChange={(e) => set('date', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Location</Label>
            <Input value={data.location ?? ''} onChange={(e) => set('location', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Inspector</Label>
            <Input value={data.inspector ?? ''} onChange={(e) => set('inspector', e.target.value)} />
          </label>
          <label>
            <Label hint="optional">Overall grade</Label>
            <Input value={data.overallGrade ?? ''} onChange={(e) => set('overallGrade', e.target.value)} />
          </label>
        </div>
      </Section>

      <Section title="Checklist">
        <div className="space-y-2">
          {data.checklist.map((c, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_36px] items-center gap-2">
              <Input placeholder="Item" value={c.item} onChange={(e) => setRow(i, { item: e.target.value })} />
              <Input placeholder="Condition" value={c.condition} onChange={(e) => setRow(i, { condition: e.target.value })} />
              <button
                onClick={() => onChange({ ...data, checklist: data.checklist.filter((_, idx) => idx !== i) })}
                className="flex h-9 items-center justify-center rounded-[10px] text-fg-subtle hover:text-red-400"
                aria-label="Remove item"
                disabled={data.checklist.length === 1}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => onChange({ ...data, checklist: [...data.checklist, { item: '', condition: '' }] })}
        >
          <Plus size={14} /> Add checklist row
        </Button>
      </Section>

      <Section title="Notes (optional)">
        <Textarea value={data.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
      </Section>
    </>
  );
}

// =================== LIVE PREVIEW (simplified A4 mirror) ===================
function PartyBlock({ label, party }: { label: string; party: Party }) {
  const lines = [party.company, party.address, party.email, party.phone, party.vat ? `VAT ${party.vat}` : null].filter(
    Boolean
  ) as string[];
  return (
    <div>
      <div className="text-[8px] font-semibold uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="text-[11px] font-semibold text-neutral-900">{party.name || '—'}</div>
      {lines.map((l, i) => (
        <div key={i} className="text-[9px] text-neutral-600">
          {l}
        </div>
      ))}
    </div>
  );
}

function Preview({
  type,
  design,
  currency,
  profile,
  invoice,
  bol,
  inspection,
  totals,
  placeSeal,
  stampUrl,
  signatureUrl,
}: {
  type: DocumentType;
  design: DocumentDesign;
  currency: string;
  profile: CompanyProfile | null;
  invoice: InvoiceData;
  bol: BillOfLadingData;
  inspection: InspectionData;
  totals: { subtotal: number; tax: number; total: number };
  placeSeal: boolean;
  stampUrl: string | null;
  signatureUrl: string | null;
}) {
  const p = profile;
  const accent = design === 'ORIGINAL' ? '#1c1c1c' : design === 'A' ? '#0f2f57' : '#e11d2a';
  return (
    <div>
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-fg-subtle">Live preview</div>
      <div className="overflow-hidden rounded-lg bg-white text-neutral-900 shadow-2xl" style={{ aspectRatio: '1 / 1.414' }}>
        <div className="flex h-full flex-col p-5">
          {/* header */}
          <div
            className={cn('flex items-start justify-between pb-3', design === 'A' ? 'border-b-2' : 'border-b')}
            style={{ borderColor: accent }}
          >
            <div>
              <div className="text-[13px] font-bold" style={{ color: accent }}>
                {p?.short ?? 'CTL'}
              </div>
              <div className="text-[9px] text-neutral-500">{p?.name ?? 'CTL Couriers Ltd'}</div>
              {p && (
                <div className="mt-1 text-[8px] text-neutral-500">
                  {p.address}
                  <br />
                  {p.phone} · {p.email}
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-[12px] font-bold uppercase" style={{ color: accent }}>
                {DOCUMENT_TYPE_LABELS[type]}
              </div>
              <div className="text-[8px] text-neutral-500">
                {type === 'INVOICE' ? invoice.issueDate : type === 'BILL_OF_LADING' ? bol.date : inspection.date}
              </div>
            </div>
          </div>

          {/* body */}
          <div className="flex-1 overflow-hidden pt-3">
            {type === 'INVOICE' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <PartyBlock label="Bill to" party={invoice.billTo} />
                  {invoice.shipper?.name && <PartyBlock label="Shipper" party={invoice.shipper} />}
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-[8px] uppercase text-neutral-400">
                      <th className="py-1 text-left">Description</th>
                      <th className="py-1 text-right">Qty</th>
                      <th className="py-1 text-right">Unit</th>
                      <th className="py-1 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.slice(0, 8).map((it, i) => (
                      <tr key={i} className="border-t border-neutral-100 text-[9px]">
                        <td className="py-1">{it.description || '—'}</td>
                        <td className="py-1 text-right tabular-nums">{it.qty}</td>
                        <td className="py-1 text-right tabular-nums">{formatMoney(Number(it.unitPrice) || 0, currency)}</td>
                        <td className="py-1 text-right tabular-nums">{formatMoney((Number(it.qty) || 0) * (Number(it.unitPrice) || 0), currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="ml-auto w-32 space-y-0.5 text-[9px]">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatMoney(totals.subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Tax {invoice.taxRate}%</span>
                    <span className="tabular-nums">{formatMoney(totals.tax, currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-300 pt-0.5 font-bold" style={{ color: accent }}>
                    <span>Total</span>
                    <span className="tabular-nums">{formatMoney(totals.total, currency)}</span>
                  </div>
                </div>
              </div>
            )}

            {type === 'BILL_OF_LADING' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <PartyBlock label="Shipper" party={bol.shipper} />
                  <PartyBlock label="Consignee" party={bol.consignee} />
                </div>
                <div className="text-[9px] text-neutral-600">
                  {bol.origin || '—'} → {bol.destination || '—'}
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-[8px] uppercase text-neutral-400">
                      <th className="py-1 text-left">Description</th>
                      <th className="py-1 text-right">Qty</th>
                      <th className="py-1 text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bol.goods.slice(0, 8).map((g, i) => (
                      <tr key={i} className="border-t border-neutral-100 text-[9px]">
                        <td className="py-1">{g.description || '—'}</td>
                        <td className="py-1 text-right tabular-nums">{g.qty}</td>
                        <td className="py-1 text-right">{g.weight || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {type === 'INSPECTION' && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-neutral-900">
                  {inspection.vehicle.make || '—'} {inspection.vehicle.model} {inspection.vehicle.year}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[9px] text-neutral-600">
                  {inspection.vehicle.vin && <div>VIN: {inspection.vehicle.vin}</div>}
                  {inspection.vehicle.registration && <div>Reg: {inspection.vehicle.registration}</div>}
                  {inspection.vehicle.colour && <div>Colour: {inspection.vehicle.colour}</div>}
                  {inspection.vehicle.odometer && <div>Odo: {inspection.vehicle.odometer}</div>}
                </div>
                <table className="w-full">
                  <tbody>
                    {inspection.checklist.slice(0, 10).map((c, i) => (
                      <tr key={i} className="border-t border-neutral-100 text-[9px]">
                        <td className="py-1">{c.item || '—'}</td>
                        <td className="py-1 text-right text-neutral-600">{c.condition}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {inspection.overallGrade && (
                  <div className="text-[9px] font-semibold" style={{ color: accent }}>
                    Overall grade: {inspection.overallGrade}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* footer / seal */}
          <div className="flex items-end justify-between border-t border-neutral-200 pt-2">
            <div className="text-[7px] text-neutral-400">
              {p?.regLabel ?? 'Company No.'} {p?.reg} · VAT {p?.vat}
            </div>
            {placeSeal && (
              <div className="flex items-end gap-2">
                {signatureUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={signatureUrl} alt="signature" className="h-7 object-contain" />
                )}
                {stampUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stampUrl} alt="stamp" className="h-10 object-contain" />
                )}
                {!stampUrl && !signatureUrl && (
                  <div className="text-[8px] italic text-neutral-400">Stamp &amp; signature applied</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-fg-subtle">
        Simplified mirror — the generated PDF is the source of truth.
      </p>
    </div>
  );
}
