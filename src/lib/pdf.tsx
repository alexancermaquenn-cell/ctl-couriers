import React from 'react';
import fs from 'fs';
import path from 'path';
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Rect,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { DocumentType } from '@prisma/client';
import {
  CTL_PROFILE,
  DEFAULT_INVOICE_TERMS,
  type CompanyProfile,
  type DocumentData,
  type DocumentDesign,
  type InvoiceData,
  type BillOfLadingData,
  type InspectionData,
  type Party,
  type Vehicle,
} from '@/lib/doc-types';
import { CURRENCIES, formatMoney, currencySymbol } from '@/lib/currency';
import { code128b, qrMatrix } from '@/lib/barcode';

// CURRENCIES is re-exported so callers can source the list from the PDF module too.
export { CURRENCIES };

const ACCENT = '#dc2626';
const INK = '#1a1a1a';
const MUTED = '#6b6b6b';
const FAINT = '#9a9a9a';
const LINE = '#e2e2e2';
const DARK = '#1c2530';

// ── seal (stamp + signature) ─────────────────────────────────────────────
export interface Seal {
  stamp?: string | null;
  signature?: string | null;
}

const DOCS_DIR = path.join(process.cwd(), 'public', 'img', 'docs');

function fileDataUrl(file: string): string | null {
  try {
    const buf = fs.readFileSync(path.join(DOCS_DIR, file));
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

// Resolve the seal to actual image sources. Uploaded assets (passed in) win;
// otherwise fall back to the on-disk default stamp/signature so docs still seal.
function resolveSeal(seal?: Seal): { stamp: string | null; signature: string | null } {
  return {
    stamp: seal?.stamp ?? fileDataUrl('stamp.png'),
    signature: seal?.signature ?? fileDataUrl('signature.png'),
  };
}

function logoDataUrl(): string | null {
  return fileDataUrl('logo.png');
}

// ── formatting helpers ───────────────────────────────────────────────────
// Money value with the document's currency symbol before the amount
// ("€ 12,000.00", "CHF 12,000.00"). `code` is a currency code (EUR default).
function money(n: number, code?: string): string {
  return formatMoney(Number.isFinite(n) ? n : 0, code);
}

// Build a party block from ONLY present fields. If company absent → name is the
// bold headline. Never render an empty label (no bare "VAT:" etc.).
interface PartyLine {
  text: string;
  bold?: boolean;
  muted?: boolean;
}

function partyLines(p: Party): PartyLine[] {
  const lines: PartyLine[] = [];
  if (p.company) {
    lines.push({ text: p.company, bold: true });
    lines.push({ text: p.name });
  } else {
    lines.push({ text: p.name, bold: true });
  }
  if (p.address) lines.push({ text: p.address, muted: true });
  if (p.vat) lines.push({ text: `VAT ${p.vat}`, muted: true });
  if (p.email) lines.push({ text: p.email, muted: true });
  if (p.phone) lines.push({ text: p.phone, muted: true });
  return lines;
}

function computeTotals(items: { qty: number; unitPrice: number }[], taxRate: number) {
  const subtotal = items.reduce((s, it) => s + it.qty * it.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

// key/value inline metadata pairs (origin/destination/weight/...) — present only.
interface Meta {
  label: string;
  value: string;
}
function metaOf(pairs: [string, string | number | undefined | null][]): Meta[] {
  const out: Meta[] = [];
  for (const [label, value] of pairs) {
    if (value === undefined || value === null || value === '') continue;
    out.push({ label, value: String(value) });
  }
  return out;
}

// ═════════════════════════════════════════════════════════════════════════
// DESIGN A — formal corporate premium
// ═════════════════════════════════════════════════════════════════════════
const a = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 46,
    fontSize: 9,
    color: INK,
    fontFamily: 'Helvetica',
  },
  accentBar: { height: 6, backgroundColor: ACCENT },
  body: { paddingHorizontal: 40, paddingTop: 18 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  logo: { width: 116, height: 34, objectFit: 'contain' },
  companyBlock: { marginTop: 6 },
  companyName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK },
  companyLine: { fontSize: 7.5, color: MUTED, marginTop: 1.5 },
  docMeta: { alignItems: 'flex-end', maxWidth: 200 },
  docTitle: { fontSize: 18, fontFamily: 'Helvetica-Bold', color: DARK, letterSpacing: 1 },
  docNumber: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: ACCENT, marginTop: 4 },
  docDate: { fontSize: 8, color: MUTED, marginTop: 3 },

  panelRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  panel: {
    flex: 1,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 9,
  },
  panelLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 1,
    marginBottom: 5,
  },
  pName: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 1 },
  pLine: { fontSize: 8.5, color: INK, marginTop: 1 },
  pMuted: { fontSize: 8, color: MUTED, marginTop: 1 },

  routeStrip: {
    flexDirection: 'row',
    backgroundColor: '#f6f7f9',
    borderRadius: 4,
    padding: 9,
    marginBottom: 12,
    gap: 10,
  },
  routeCell: { flex: 1 },
  routeLabel: { fontSize: 6.5, color: FAINT, letterSpacing: 0.8, fontFamily: 'Helvetica-Bold' },
  routeValue: { fontSize: 9, color: DARK, marginTop: 2, fontFamily: 'Helvetica-Bold' },

  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    letterSpacing: 1,
    marginBottom: 6,
  },

  tHead: { flexDirection: 'row', backgroundColor: DARK, borderRadius: 3 },
  tHeadCell: { color: '#ffffff', fontSize: 7.5, fontFamily: 'Helvetica-Bold', padding: 6, letterSpacing: 0.5 },
  tRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: LINE },
  tCell: { fontSize: 8.5, padding: 6, color: INK },
  tCellMuted: { fontSize: 7, color: MUTED, marginTop: 1 },

  totalsWrap: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  totals: { width: 230 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, paddingHorizontal: 6 },
  totalLabel: { fontSize: 9, color: MUTED },
  totalValue: { fontSize: 9, color: INK, fontFamily: 'Helvetica-Bold' },
  grandBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: DARK,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  grandLabel: { fontSize: 10, color: '#ffffff', fontFamily: 'Helvetica-Bold', letterSpacing: 0.5 },
  grandValue: { fontSize: 12, color: '#ffffff', fontFamily: 'Helvetica-Bold' },

  bankBox: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 4,
    padding: 9,
    backgroundColor: '#fafafa',
  },
  notes: { marginTop: 12, fontSize: 8, color: MUTED, lineHeight: 1.4 },

  sealWrap: { marginTop: 18, flexDirection: 'row', justifyContent: 'flex-end' },
  sealBox: { alignItems: 'center', width: 200 },
  sigImg: { width: 120, height: 42, objectFit: 'contain', marginBottom: 2 },
  sigLine: { width: 160, borderTopWidth: 1, borderTopColor: '#333', marginTop: 2, paddingTop: 3 },
  sigName: { fontSize: 8, color: INK, textAlign: 'center', fontFamily: 'Helvetica-Bold' },
  sigRole: { fontSize: 7, color: MUTED, textAlign: 'center' },
  stampImg: { width: 88, height: 88, objectFit: 'contain', position: 'absolute', top: -18, right: 6, opacity: 0.9 },

  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingTop: 6,
    fontSize: 6.5,
    color: FAINT,
    textAlign: 'center',
  },
});

function HeaderA({ profile, title, number, date }: { profile: CompanyProfile; title: string; number: string; date: string }) {
  const logo = logoDataUrl();
  return (
    <View style={a.header}>
      <View>
        {logo ? <Image style={a.logo} src={logo} /> : null}
        <View style={a.companyBlock}>
          <Text style={a.companyName}>{profile.name}</Text>
          <Text style={a.companyLine}>{profile.address}</Text>
          <Text style={a.companyLine}>
            {profile.regLabel} {profile.reg}  ·  VAT {profile.vat}
          </Text>
          <Text style={a.companyLine}>
            {profile.phone}  ·  {profile.email}
          </Text>
        </View>
      </View>
      <View style={a.docMeta}>
        <Text style={a.docTitle}>{title}</Text>
        <Text style={a.docNumber}>{number}</Text>
        <Text style={a.docDate}>{date}</Text>
      </View>
    </View>
  );
}

function PanelA({ label, party }: { label: string; party: Party }) {
  const lines = partyLines(party);
  return (
    <View style={a.panel}>
      <Text style={a.panelLabel}>{label}</Text>
      {lines.map((l, i) => (
        <Text
          key={i}
          style={l.bold ? a.pName : l.muted ? a.pMuted : a.pLine}
        >
          {l.text}
        </Text>
      ))}
    </View>
  );
}

function RouteStripA({ meta }: { meta: Meta[] }) {
  if (meta.length === 0) return null;
  return (
    <View style={a.routeStrip}>
      {meta.map((m, i) => (
        <View style={a.routeCell} key={i}>
          <Text style={a.routeLabel}>{m.label.toUpperCase()}</Text>
          <Text style={a.routeValue}>{m.value}</Text>
        </View>
      ))}
    </View>
  );
}

function SealA({ seal, name, role }: { seal: { stamp: string | null; signature: string | null }; name?: string; role: string }) {
  if (!seal.stamp && !seal.signature) return null;
  return (
    <View style={a.sealWrap}>
      <View style={a.sealBox}>
        {seal.stamp ? <Image style={a.stampImg} src={seal.stamp} /> : null}
        {seal.signature ? <Image style={a.sigImg} src={seal.signature} /> : null}
        <View style={a.sigLine}>
          {name ? <Text style={a.sigName}>{name}</Text> : null}
          <Text style={a.sigRole}>{role}</Text>
        </View>
      </View>
    </View>
  );
}

function FooterA({ profile }: { profile: CompanyProfile }) {
  return (
    <Text style={a.footer} fixed>
      {profile.name}  ·  {profile.regLabel} {profile.reg}  ·  {profile.address}  ·  {profile.phone}  ·  {profile.email}
    </Text>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// DESIGN B — modern minimalist
// ═════════════════════════════════════════════════════════════════════════
const b = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 46,
    paddingHorizontal: 52,
    fontSize: 9,
    color: INK,
    fontFamily: 'Helvetica',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  wordmark: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: DARK, letterSpacing: -0.5 },
  wordmarkAccent: { color: ACCENT },
  wordmarkSub: { fontSize: 7.5, color: MUTED, marginTop: 3, letterSpacing: 1.5 },
  docMeta: { alignItems: 'flex-end' },
  docTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: MUTED, letterSpacing: 3 },
  docNumber: { fontSize: 15, fontFamily: 'Helvetica-Bold', color: DARK, marginTop: 3 },
  docDate: { fontSize: 8, color: MUTED, marginTop: 4 },

  partyRow: { flexDirection: 'row', gap: 40, marginBottom: 26 },
  partyCol: { flex: 1 },
  partyLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: ACCENT, letterSpacing: 2, marginBottom: 6 },
  pName: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: DARK, marginBottom: 1 },
  pLine: { fontSize: 9, color: INK, marginTop: 1.5 },
  pMuted: { fontSize: 8.5, color: MUTED, marginTop: 1.5 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 26, marginBottom: 24 },
  metaCell: {},
  metaLabel: { fontSize: 6.5, color: FAINT, letterSpacing: 1.2, fontFamily: 'Helvetica-Bold' },
  metaValue: { fontSize: 9.5, color: DARK, marginTop: 2 },

  sectionLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: FAINT,
    letterSpacing: 2,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: DARK,
    paddingBottom: 5,
  },
  itemRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    paddingVertical: 7,
  },
  itemHead: { flexDirection: 'row', paddingBottom: 5 },
  itemHeadCell: { fontSize: 6.5, color: FAINT, letterSpacing: 1, fontFamily: 'Helvetica-Bold' },
  itemCell: { fontSize: 9, color: INK },
  itemNote: { fontSize: 7.5, color: MUTED, marginTop: 2 },

  totalsWrap: { alignItems: 'flex-end', marginTop: 18 },
  totals: { width: 240 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  totalLabel: { fontSize: 9, color: MUTED },
  totalValue: { fontSize: 9, color: INK },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: DARK,
    marginTop: 4,
    paddingTop: 8,
    alignItems: 'baseline',
  },
  grandLabel: { fontSize: 10, color: DARK, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  grandValue: { fontSize: 20, color: ACCENT, fontFamily: 'Helvetica-Bold' },

  bank: { marginTop: 26 },
  bankLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: FAINT, letterSpacing: 2, marginBottom: 5 },
  bankLine: { fontSize: 8.5, color: INK, marginTop: 1.5 },
  notes: { marginTop: 22, fontSize: 8.5, color: MUTED, lineHeight: 1.5 },

  sealWrap: { marginTop: 30, flexDirection: 'row', justifyContent: 'flex-end' },
  sealBox: { alignItems: 'flex-end', width: 200 },
  sigImg: { width: 130, height: 44, objectFit: 'contain', marginBottom: 4 },
  stampImg: { width: 84, height: 84, objectFit: 'contain', position: 'absolute', top: -20, right: -6, opacity: 0.9 },
  sigLine: { width: 170, borderTopWidth: 1, borderTopColor: '#333', paddingTop: 4, alignItems: 'flex-end' },
  sigName: { fontSize: 8.5, color: INK, fontFamily: 'Helvetica-Bold' },
  sigRole: { fontSize: 7.5, color: MUTED, marginTop: 1 },

  footer: {
    position: 'absolute',
    bottom: 22,
    left: 52,
    right: 52,
    fontSize: 6.5,
    color: FAINT,
    textAlign: 'center',
  },
});

// Split a wordmark so one accent letter is coloured (e.g. "CT" + "L").
function HeaderB({ profile, title, number, date }: { profile: CompanyProfile; title: string; number: string; date: string }) {
  const short = profile.short;
  const head = short.slice(0, -1);
  const tail = short.slice(-1);
  return (
    <View style={b.header}>
      <View>
        <Text style={b.wordmark}>
          {head}
          <Text style={b.wordmarkAccent}>{tail}</Text>
        </Text>
        <Text style={b.wordmarkSub}>{profile.name.toUpperCase()}</Text>
      </View>
      <View style={b.docMeta}>
        <Text style={b.docTitle}>{title}</Text>
        <Text style={b.docNumber}>{number}</Text>
        <Text style={b.docDate}>{date}</Text>
      </View>
    </View>
  );
}

function PartyColB({ label, party }: { label: string; party: Party }) {
  const lines = partyLines(party);
  return (
    <View style={b.partyCol}>
      <Text style={b.partyLabel}>{label}</Text>
      {lines.map((l, i) => (
        <Text key={i} style={l.bold ? b.pName : l.muted ? b.pMuted : b.pLine}>
          {l.text}
        </Text>
      ))}
    </View>
  );
}

function MetaRowB({ meta }: { meta: Meta[] }) {
  if (meta.length === 0) return null;
  return (
    <View style={b.metaRow}>
      {meta.map((m, i) => (
        <View style={b.metaCell} key={i}>
          <Text style={b.metaLabel}>{m.label.toUpperCase()}</Text>
          <Text style={b.metaValue}>{m.value}</Text>
        </View>
      ))}
    </View>
  );
}

function SealB({ seal, name, role }: { seal: { stamp: string | null; signature: string | null }; name?: string; role: string }) {
  if (!seal.stamp && !seal.signature) return null;
  return (
    <View style={b.sealWrap}>
      <View style={b.sealBox}>
        {seal.stamp ? <Image style={b.stampImg} src={seal.stamp} /> : null}
        {seal.signature ? <Image style={b.sigImg} src={seal.signature} /> : null}
        <View style={b.sigLine}>
          {name ? <Text style={b.sigName}>{name}</Text> : null}
          <Text style={b.sigRole}>{role}</Text>
        </View>
      </View>
    </View>
  );
}

function FooterB({ profile }: { profile: CompanyProfile }) {
  return (
    <Text style={b.footer} fixed>
      {profile.name}  ·  {profile.regLabel} {profile.reg}  ·  {profile.vat}  ·  {profile.address}  ·  {profile.phone}
    </Text>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// INVOICE
// ═════════════════════════════════════════════════════════════════════════
function InvoiceA({ profile, data, seal, currency }: { profile: CompanyProfile; data: InvoiceData; seal: { stamp: string | null; signature: string | null }; currency: string }) {
  const { subtotal, tax, total } = computeTotals(data.lineItems, data.taxRate);
  const route = metaOf([
    ['Origin', data.origin],
    ['Destination', data.destination],
    ['Weight', data.weightKg ? `${data.weightKg} kg` : undefined],
    ['Service', data.service],
    ['Incoterm', data.incoterm],
    ['Tracking', data.trackingNumber],
  ]);
  const dateLine = `Issued ${data.issueDate}${data.dueDate ? `  ·  Due ${data.dueDate}` : ''}`;
  const showSeal = data.placeSeal !== false;
  return (
    <Document title={`Invoice ${data.docNumber}`}>
      <Page size="A4" style={a.page}>
        <View style={a.accentBar} />
        <View style={a.body}>
          <HeaderA profile={profile} title="INVOICE" number={data.docNumber} date={dateLine} />
          <View style={a.panelRow}>
            <PanelA label="BILL TO" party={data.billTo} />
            {data.shipper ? <PanelA label="SHIPPER" party={data.shipper} /> : null}
          </View>
          <RouteStripA meta={route} />
          <Text style={a.sectionTitle}>LINE ITEMS</Text>
          <View style={a.tHead}>
            <Text style={[a.tHeadCell, { flex: 5 }]}>DESCRIPTION</Text>
            <Text style={[a.tHeadCell, { flex: 1, textAlign: 'right' }]}>QTY</Text>
            <Text style={[a.tHeadCell, { flex: 1.5, textAlign: 'right' }]}>UNIT</Text>
            <Text style={[a.tHeadCell, { flex: 1.5, textAlign: 'right' }]}>AMOUNT</Text>
          </View>
          {data.lineItems.map((it, i) => (
            <View style={a.tRow} key={i}>
              <View style={{ flex: 5, padding: 6 }}>
                <Text style={{ fontSize: 8.5, color: INK }}>{it.description}</Text>
                {it.note ? <Text style={a.tCellMuted}>{it.note}</Text> : null}
              </View>
              <Text style={[a.tCell, { flex: 1, textAlign: 'right' }]}>{it.qty}</Text>
              <Text style={[a.tCell, { flex: 1.5, textAlign: 'right' }]}>{money(it.unitPrice, currency)}</Text>
              <Text style={[a.tCell, { flex: 1.5, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
                {money(it.qty * it.unitPrice, currency)}
              </Text>
            </View>
          ))}
          <View style={a.totalsWrap}>
            <View style={a.totals}>
              <View style={a.totalRow}>
                <Text style={a.totalLabel}>Subtotal</Text>
                <Text style={a.totalValue}>{money(subtotal, currency)}</Text>
              </View>
              <View style={a.totalRow}>
                <Text style={a.totalLabel}>VAT ({data.taxRate}%)</Text>
                <Text style={a.totalValue}>{money(tax, currency)}</Text>
              </View>
              <View style={a.grandBox}>
                <Text style={a.grandLabel}>TOTAL DUE</Text>
                <Text style={a.grandValue}>{money(total, currency)}</Text>
              </View>
            </View>
          </View>
          {data.bankDetails ? (
            <View style={a.bankBox}>
              <Text style={a.panelLabel}>BANK DETAILS</Text>
              <Text style={a.pLine}>{data.bankDetails.bank}</Text>
              <Text style={a.pMuted}>IBAN {data.bankDetails.iban}  ·  BIC {data.bankDetails.bic}</Text>
              {data.bankDetails.ref ? <Text style={a.pMuted}>Reference: {data.bankDetails.ref}</Text> : null}
            </View>
          ) : null}
          {data.notes ? <Text style={a.notes}>{data.notes}</Text> : null}
          {showSeal ? <SealA seal={seal} name={profile.short} role="Authorised Signatory" /> : null}
        </View>
        <FooterA profile={profile} />
      </Page>
    </Document>
  );
}

function InvoiceB({ profile, data, seal, currency }: { profile: CompanyProfile; data: InvoiceData; seal: { stamp: string | null; signature: string | null }; currency: string }) {
  const { subtotal, tax, total } = computeTotals(data.lineItems, data.taxRate);
  const meta = metaOf([
    ['Issued', data.issueDate],
    ['Due', data.dueDate],
    ['Origin', data.origin],
    ['Destination', data.destination],
    ['Weight', data.weightKg ? `${data.weightKg} kg` : undefined],
    ['Service', data.service],
    ['Incoterm', data.incoterm],
    ['Tracking', data.trackingNumber],
  ]);
  const showSeal = data.placeSeal !== false;
  return (
    <Document title={`Invoice ${data.docNumber}`}>
      <Page size="A4" style={b.page}>
        <HeaderB profile={profile} title="INVOICE" number={data.docNumber} date={data.issueDate} />
        <View style={b.partyRow}>
          <PartyColB label="BILL TO" party={data.billTo} />
          {data.shipper ? <PartyColB label="SHIPPER" party={data.shipper} /> : null}
        </View>
        <MetaRowB meta={meta} />
        <Text style={b.sectionLabel}>LINE ITEMS</Text>
        <View style={b.itemHead}>
          <Text style={[b.itemHeadCell, { flex: 5 }]}>DESCRIPTION</Text>
          <Text style={[b.itemHeadCell, { flex: 1, textAlign: 'right' }]}>QTY</Text>
          <Text style={[b.itemHeadCell, { flex: 1.5, textAlign: 'right' }]}>UNIT</Text>
          <Text style={[b.itemHeadCell, { flex: 1.5, textAlign: 'right' }]}>AMOUNT</Text>
        </View>
        {data.lineItems.map((it, i) => (
          <View style={b.itemRow} key={i}>
            <View style={{ flex: 5 }}>
              <Text style={b.itemCell}>{it.description}</Text>
              {it.note ? <Text style={b.itemNote}>{it.note}</Text> : null}
            </View>
            <Text style={[b.itemCell, { flex: 1, textAlign: 'right' }]}>{it.qty}</Text>
            <Text style={[b.itemCell, { flex: 1.5, textAlign: 'right' }]}>{money(it.unitPrice, currency)}</Text>
            <Text style={[b.itemCell, { flex: 1.5, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>
              {money(it.qty * it.unitPrice, currency)}
            </Text>
          </View>
        ))}
        <View style={b.totalsWrap}>
          <View style={b.totals}>
            <View style={b.totalRow}>
              <Text style={b.totalLabel}>Subtotal</Text>
              <Text style={b.totalValue}>{money(subtotal, currency)}</Text>
            </View>
            <View style={b.totalRow}>
              <Text style={b.totalLabel}>VAT ({data.taxRate}%)</Text>
              <Text style={b.totalValue}>{money(tax, currency)}</Text>
            </View>
            <View style={b.grandRow}>
              <Text style={b.grandLabel}>TOTAL DUE</Text>
              <Text style={b.grandValue}>{money(total, currency)}</Text>
            </View>
          </View>
        </View>
        {data.bankDetails ? (
          <View style={b.bank}>
            <Text style={b.bankLabel}>PAYMENT</Text>
            <Text style={b.bankLine}>{data.bankDetails.bank}</Text>
            <Text style={b.bankLine}>IBAN {data.bankDetails.iban}  ·  BIC {data.bankDetails.bic}</Text>
            {data.bankDetails.ref ? <Text style={b.bankLine}>Reference: {data.bankDetails.ref}</Text> : null}
          </View>
        ) : null}
        {data.notes ? <Text style={b.notes}>{data.notes}</Text> : null}
        {showSeal ? <SealB seal={seal} name={profile.short} role="Authorised Signatory" /> : null}
        <FooterB profile={profile} />
      </Page>
    </Document>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// BILL OF LADING
// ═════════════════════════════════════════════════════════════════════════
function BolA({ profile, data, seal }: { profile: CompanyProfile; data: BillOfLadingData; seal: { stamp: string | null; signature: string | null } }) {
  const route = metaOf([
    ['Origin', data.origin],
    ['Destination', data.destination],
    ['Weight', data.weightKg ? `${data.weightKg} kg` : undefined],
    ['Pieces', data.pieces],
    ['Service', data.service],
    ['Incoterm', data.incoterm],
  ]);
  const showSeal = data.placeSeal !== false;
  const carrierParty: Party | null = data.carrier ? { name: data.carrier } : null;
  return (
    <Document title={`Bill of Lading ${data.docNumber}`}>
      <Page size="A4" style={a.page}>
        <View style={a.accentBar} />
        <View style={a.body}>
          <HeaderA profile={profile} title="BILL OF LADING" number={data.docNumber} date={data.date} />
          <View style={a.panelRow}>
            <PanelA label="SHIPPER" party={data.shipper} />
            <PanelA label="CONSIGNEE" party={data.consignee} />
            {carrierParty ? <PanelA label="CARRIER" party={carrierParty} /> : null}
          </View>
          <RouteStripA meta={route} />
          {data.trackingNumber ? (
            <RouteStripA meta={[{ label: 'Tracking Number', value: data.trackingNumber }]} />
          ) : null}
          <Text style={a.sectionTitle}>GOODS</Text>
          <View style={a.tHead}>
            <Text style={[a.tHeadCell, { flex: 2 }]}>MARKS</Text>
            <Text style={[a.tHeadCell, { flex: 5 }]}>DESCRIPTION</Text>
            <Text style={[a.tHeadCell, { flex: 1, textAlign: 'right' }]}>QTY</Text>
            <Text style={[a.tHeadCell, { flex: 1.6, textAlign: 'right' }]}>WEIGHT</Text>
          </View>
          {data.goods.map((g, i) => (
            <View style={a.tRow} key={i}>
              <Text style={[a.tCell, { flex: 2 }]}>{g.marks ?? '—'}</Text>
              <Text style={[a.tCell, { flex: 5 }]}>{g.description}</Text>
              <Text style={[a.tCell, { flex: 1, textAlign: 'right' }]}>{g.qty}</Text>
              <Text style={[a.tCell, { flex: 1.6, textAlign: 'right' }]}>{g.weight ?? '—'}</Text>
            </View>
          ))}
          {data.notes ? (
            <>
              <Text style={[a.sectionTitle, { marginTop: 14 }]}>TERMS &amp; NOTES</Text>
              <Text style={a.notes}>{data.notes}</Text>
            </>
          ) : null}
          {showSeal ? <SealA seal={seal} name={profile.short} role="For the Carrier" /> : null}
        </View>
        <FooterA profile={profile} />
      </Page>
    </Document>
  );
}

function BolB({ profile, data, seal }: { profile: CompanyProfile; data: BillOfLadingData; seal: { stamp: string | null; signature: string | null } }) {
  const meta = metaOf([
    ['Date', data.date],
    ['Origin', data.origin],
    ['Destination', data.destination],
    ['Weight', data.weightKg ? `${data.weightKg} kg` : undefined],
    ['Pieces', data.pieces],
    ['Service', data.service],
    ['Incoterm', data.incoterm],
    ['Tracking', data.trackingNumber],
  ]);
  const showSeal = data.placeSeal !== false;
  return (
    <Document title={`Bill of Lading ${data.docNumber}`}>
      <Page size="A4" style={b.page}>
        <HeaderB profile={profile} title="BILL OF LADING" number={data.docNumber} date={data.date} />
        <View style={b.partyRow}>
          <PartyColB label="SHIPPER" party={data.shipper} />
          <PartyColB label="CONSIGNEE" party={data.consignee} />
        </View>
        {data.carrier ? (
          <View style={[b.partyRow, { marginTop: -14 }]}>
            <View style={b.partyCol}>
              <Text style={b.partyLabel}>CARRIER</Text>
              <Text style={b.pName}>{data.carrier}</Text>
            </View>
            <View style={b.partyCol} />
          </View>
        ) : null}
        <MetaRowB meta={meta} />
        <Text style={b.sectionLabel}>GOODS</Text>
        <View style={b.itemHead}>
          <Text style={[b.itemHeadCell, { flex: 2 }]}>MARKS</Text>
          <Text style={[b.itemHeadCell, { flex: 5 }]}>DESCRIPTION</Text>
          <Text style={[b.itemHeadCell, { flex: 1, textAlign: 'right' }]}>QTY</Text>
          <Text style={[b.itemHeadCell, { flex: 1.6, textAlign: 'right' }]}>WEIGHT</Text>
        </View>
        {data.goods.map((g, i) => (
          <View style={b.itemRow} key={i}>
            <Text style={[b.itemCell, { flex: 2 }]}>{g.marks ?? '—'}</Text>
            <Text style={[b.itemCell, { flex: 5 }]}>{g.description}</Text>
            <Text style={[b.itemCell, { flex: 1, textAlign: 'right' }]}>{g.qty}</Text>
            <Text style={[b.itemCell, { flex: 1.6, textAlign: 'right' }]}>{g.weight ?? '—'}</Text>
          </View>
        ))}
        {data.notes ? (
          <>
            <Text style={[b.sectionLabel, { marginTop: 22 }]}>TERMS &amp; NOTES</Text>
            <Text style={b.notes}>{data.notes}</Text>
          </>
        ) : null}
        {showSeal ? <SealB seal={seal} name={profile.short} role="For the Carrier" /> : null}
        <FooterB profile={profile} />
      </Page>
    </Document>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// INSPECTION
// ═════════════════════════════════════════════════════════════════════════
function vehicleMeta(data: InspectionData): Meta[] {
  const v = data.vehicle;
  return metaOf([
    ['Make', v.make],
    ['Model', v.model],
    ['Year', v.year],
    ['VIN', v.vin],
    ['Registration', v.registration],
    ['Colour', v.colour],
    ['Odometer', v.odometer],
    ['Fuel', v.fuel],
    ['Keys', v.keys],
  ]);
}

function InspectionA({ profile, data, seal }: { profile: CompanyProfile; data: InspectionData; seal: { stamp: string | null; signature: string | null } }) {
  const vm = vehicleMeta(data);
  const showSeal = data.placeSeal !== false;
  const footerMeta = metaOf([
    ['Inspector', data.inspector],
    ['Location', data.location],
    ['Overall Grade', data.overallGrade],
  ]);
  return (
    <Document title={`Inspection ${data.docNumber}`}>
      <Page size="A4" style={a.page}>
        <View style={a.accentBar} />
        <View style={a.body}>
          <HeaderA profile={profile} title="INSPECTION" number={data.docNumber} date={data.date} />
          {data.client ? (
            <View style={a.panelRow}>
              <PanelA label="CLIENT / OWNER" party={{ name: data.client.name, company: data.client.company }} />
            </View>
          ) : null}
          <Text style={a.sectionTitle}>VEHICLE</Text>
          <View style={[a.routeStrip, { flexWrap: 'wrap' }]}>
            {vm.map((m, i) => (
              <View style={{ width: '30%', marginBottom: 4 }} key={i}>
                <Text style={a.routeLabel}>{m.label.toUpperCase()}</Text>
                <Text style={a.routeValue}>{m.value}</Text>
              </View>
            ))}
          </View>
          <Text style={a.sectionTitle}>INSPECTION CHECKLIST</Text>
          <View style={a.tHead}>
            <Text style={[a.tHeadCell, { flex: 3 }]}>ITEM</Text>
            <Text style={[a.tHeadCell, { flex: 2 }]}>CONDITION</Text>
          </View>
          {data.checklist.map((c, i) => (
            <View style={a.tRow} key={i}>
              <Text style={[a.tCell, { flex: 3 }]}>{c.item}</Text>
              <Text style={[a.tCell, { flex: 2, fontFamily: 'Helvetica-Bold' }]}>{c.condition}</Text>
            </View>
          ))}
          {footerMeta.length ? (
            <View style={[a.routeStrip, { marginTop: 12 }]}>
              {footerMeta.map((m, i) => (
                <View style={a.routeCell} key={i}>
                  <Text style={a.routeLabel}>{m.label.toUpperCase()}</Text>
                  <Text style={a.routeValue}>{m.value}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {data.notes ? <Text style={a.notes}>{data.notes}</Text> : null}
          {showSeal ? <SealA seal={seal} name={data.inspector ?? profile.short} role="Inspector" /> : null}
        </View>
        <FooterA profile={profile} />
      </Page>
    </Document>
  );
}

function InspectionB({ profile, data, seal }: { profile: CompanyProfile; data: InspectionData; seal: { stamp: string | null; signature: string | null } }) {
  const vm = vehicleMeta(data);
  const showSeal = data.placeSeal !== false;
  return (
    <Document title={`Inspection ${data.docNumber}`}>
      <Page size="A4" style={b.page}>
        <HeaderB profile={profile} title="INSPECTION" number={data.docNumber} date={data.date} />
        {data.client ? (
          <View style={b.partyRow}>
            <PartyColB label="CLIENT / OWNER" party={{ name: data.client.name, company: data.client.company }} />
            <View style={b.partyCol} />
          </View>
        ) : null}
        <Text style={b.sectionLabel}>VEHICLE</Text>
        <View style={b.metaRow}>
          {vm.map((m, i) => (
            <View style={b.metaCell} key={i}>
              <Text style={b.metaLabel}>{m.label.toUpperCase()}</Text>
              <Text style={b.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>
        <Text style={b.sectionLabel}>INSPECTION CHECKLIST</Text>
        <View style={b.itemHead}>
          <Text style={[b.itemHeadCell, { flex: 3 }]}>ITEM</Text>
          <Text style={[b.itemHeadCell, { flex: 2, textAlign: 'right' }]}>CONDITION</Text>
        </View>
        {data.checklist.map((c, i) => (
          <View style={b.itemRow} key={i}>
            <Text style={[b.itemCell, { flex: 3 }]}>{c.item}</Text>
            <Text style={[b.itemCell, { flex: 2, textAlign: 'right', fontFamily: 'Helvetica-Bold' }]}>{c.condition}</Text>
          </View>
        ))}
        {data.overallGrade ? (
          <View style={b.grandRow}>
            <Text style={b.grandLabel}>OVERALL GRADE</Text>
            <Text style={[b.grandValue, { fontSize: 16 }]}>{data.overallGrade}</Text>
          </View>
        ) : null}
        <View style={[b.metaRow, { marginTop: 22 }]}>
          {metaOf([
            ['Inspector', data.inspector],
            ['Location', data.location],
            ['Date', data.date],
          ]).map((m, i) => (
            <View style={b.metaCell} key={i}>
              <Text style={b.metaLabel}>{m.label.toUpperCase()}</Text>
              <Text style={b.metaValue}>{m.value}</Text>
            </View>
          ))}
        </View>
        {data.notes ? <Text style={b.notes}>{data.notes}</Text> : null}
        {showSeal ? <SealB seal={seal} name={data.inspector ?? profile.short} role="Inspector" /> : null}
        <FooterB profile={profile} />
      </Page>
    </Document>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// DESIGN ORIGINAL — faithful replica of the approved classic templates
// (Times-metric serif + Courier-metric mono, full bordered grids, real
//  Code128 barcode + real QR). One compact A4 page each.
// ═════════════════════════════════════════════════════════════════════════
const SERIF = 'Times-Roman';
const SERIF_B = 'Times-Bold';
const MONO = 'Courier';
const MONO_B = 'Courier-Bold';
const SANS_B = 'Helvetica-Bold'; // condensed-sans stand-in for Barlow header
const BLACK = '#000000';
const BAND = '#d9d9d9';

// ── shared graphics ────────────────────────────────────────────────────────
// Real Code128B barcode drawn as SVG rects (bars only). Scales to fit `width`.
function Barcode128({ value, width, height }: { value: string; width: number; height: number }) {
  const { bars, width: units } = code128b(value, 6);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${units} ${height}`}>
      {bars.map((bar, i) => (
        <Rect key={i} x={bar.x} y={0} width={bar.width} height={height} fill={BLACK} />
      ))}
    </Svg>
  );
}

// Real QR (byte mode, ECC-M) drawn as SVG module rects. Falls back to a
// faithful finder-pattern placeholder if encoding throws.
function QrCode({ value, size }: { value: string; size: number }) {
  let matrix: boolean[][] | null = null;
  try {
    matrix = qrMatrix(value, 'M');
  } catch {
    matrix = null;
  }
  const margin = 2;
  if (matrix) {
    const count = matrix.length;
    const dim = count + margin * 2;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${dim} ${dim}`}>
        <Rect x={0} y={0} width={dim} height={dim} fill="#ffffff" />
        {matrix.flatMap((row, r) =>
          row.map((on, c) =>
            on ? <Rect key={`${r}-${c}`} x={c + margin} y={r + margin} width={1} height={1} fill={BLACK} /> : null,
          ),
        )}
      </Svg>
    );
  }
  // Placeholder: 3 finder patterns on a 21-module grid (NOTE: not scannable).
  const dim = 21 + margin * 2;
  const finder = (fr: number, fc: number): React.ReactElement[] => {
    const cells: React.ReactElement[] = [];
    for (let dr = 0; dr < 7; dr++) {
      for (let dc = 0; dc < 7; dc++) {
        const border = dr === 0 || dr === 6 || dc === 0 || dc === 6;
        const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
        if (border || core) cells.push(<Rect key={`${fr}-${fc}-${dr}-${dc}`} x={fc + dc + margin} y={fr + dr + margin} width={1} height={1} fill={BLACK} />);
      }
    }
    return cells;
  };
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${dim} ${dim}`}>
      <Rect x={0} y={0} width={dim} height={dim} fill="#ffffff" />
      {finder(0, 0)}
      {finder(0, 14)}
      {finder(14, 0)}
    </Svg>
  );
}

// A solid black / empty square for inspection P·R·N-A cells and select-all boxes.
function Square({ on, size = 8 }: { on: boolean; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: 1,
        borderColor: BLACK,
        backgroundColor: on ? BLACK : '#ffffff',
      }}
    />
  );
}

// ── ORIGINAL: INVOICE ───────────────────────────────────────────────────────
const oi = StyleSheet.create({
  page: { paddingTop: 16, paddingBottom: 12, paddingHorizontal: 20, fontSize: 9, fontFamily: SERIF, color: BLACK, display: 'flex', flexDirection: 'column' },
  titleBar: { textAlign: 'center', paddingBottom: 4 },
  title: { fontSize: 12.5, fontFamily: SERIF_B, textAlign: 'center' },
  shipId: { fontSize: 9.5, fontFamily: SERIF_B, textAlign: 'center', marginTop: 1 },
  shipIdMono: { fontFamily: MONO_B },
  box: { borderWidth: 1, borderColor: BLACK },
  hdrRow: { flexDirection: 'row' },
  hdrCol: { borderRightWidth: 1, borderRightColor: BLACK },
  hdrColLast: {},
  colhead: { fontFamily: SERIF_B, fontSize: 9.5, paddingHorizontal: 6, paddingVertical: 2, borderBottomWidth: 1, borderBottomColor: BLACK },
  cellBody: { paddingHorizontal: 6, paddingTop: 4, paddingBottom: 6 },
  addrMono: { fontFamily: MONO, fontSize: 8.5, lineHeight: 1.4, textTransform: 'uppercase' },
  barcodeWrap: { alignItems: 'center', paddingHorizontal: 4, paddingTop: 4, paddingBottom: 1 },
  hrText: { fontFamily: MONO, fontSize: 8, letterSpacing: 2, marginTop: 1, textAlign: 'center' },
  kv: { paddingHorizontal: 6, paddingTop: 3, paddingBottom: 4, fontSize: 9, lineHeight: 1.5 },
  kvLine: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 1 },
  kvB: { fontFamily: SERIF_B, fontSize: 9 },
  kvV: { fontFamily: MONO_B, fontSize: 9 },

  items: { borderTopWidth: 1, borderTopColor: BLACK },
  itHead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BLACK },
  itHeadCell: { fontFamily: SANS_B, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.3, paddingHorizontal: 5, paddingVertical: 2, borderRightWidth: 1, borderRightColor: BLACK },
  itRow: { flexDirection: 'row' },
  itCell: { fontFamily: MONO, fontSize: 8.5, paddingHorizontal: 5, paddingVertical: 3, borderRightWidth: 1, borderRightColor: BLACK },
  itDesc: { fontFamily: MONO, fontSize: 8.5, lineHeight: 1.3 },
  itDescSmall: { fontFamily: MONO_B, fontSize: 7 },

  secH: { fontFamily: SERIF_B, fontSize: 9.5, borderTopWidth: 1, borderTopColor: BLACK, borderBottomWidth: 1, borderBottomColor: BLACK, paddingHorizontal: 6, paddingVertical: 2 },
  tcBody: { paddingHorizontal: 6, paddingVertical: 4, fontSize: 8, lineHeight: 1.4, fontFamily: SERIF },
  tcP: { marginBottom: 1 },
  bankIntro: { fontFamily: SERIF, fontSize: 8, paddingTop: 4, paddingBottom: 1, paddingLeft: 20, paddingRight: 6 },
  bankTable: { marginLeft: 20, marginTop: 1, marginBottom: 3 },
  bankRow: { flexDirection: 'row', marginVertical: 0.4 },
  bankLbl: { fontFamily: SERIF_B, fontSize: 8.5, width: 108 },
  bankVal: { fontFamily: MONO, fontSize: 8.5 },
  bankNote: { fontFamily: SERIF, fontSize: 8, paddingTop: 2, paddingBottom: 3, paddingLeft: 20, paddingRight: 6, lineHeight: 1.45 },

  bottom: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BLACK },
  bcellL: { width: '50%', borderRightWidth: 1, borderRightColor: BLACK },
  bcellR: { width: '50%' },
  bcellH: { fontFamily: SERIF_B, fontSize: 9.5, borderBottomWidth: 1, borderBottomColor: BLACK, paddingHorizontal: 6, paddingVertical: 2 },
  warrantsBody: { paddingHorizontal: 6, paddingVertical: 4, fontSize: 7.5, lineHeight: 1.4, fontFamily: SERIF },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 2, fontSize: 9 },
  sumLbl: { fontFamily: SERIF_B, fontSize: 9 },
  sumVal: { fontFamily: MONO_B, fontSize: 9, textAlign: 'right' },
  sumTotalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingTop: 3, paddingBottom: 3, borderTopWidth: 2, borderTopColor: BLACK },
  sumTotalLbl: { fontFamily: SERIF_B, fontSize: 10 },
  sumTotalVal: { fontFamily: MONO_B, fontSize: 10, textAlign: 'right', backgroundColor: '#c9c9c9', paddingHorizontal: 4 },

  signs: { marginTop: 24, position: 'relative' },
  signGrid: { flexDirection: 'row' },
  signCell: { width: '50%', paddingHorizontal: 18 },
  signDate: { textAlign: 'center', fontFamily: SERIF_B, fontSize: 10, marginBottom: 2 },
  signLine: { borderTopWidth: 1, borderTopColor: BLACK, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2, fontSize: 8 },
  sigImg: { position: 'absolute', width: 120, height: 40, objectFit: 'contain', left: 30, top: -30 },
  stamp: { position: 'absolute', width: 118, height: 118, objectFit: 'contain', left: 150, bottom: -6, opacity: 0.88 },

  footer: { textAlign: 'center', fontSize: 7, marginTop: 'auto', paddingTop: 8 },
});

function InvoiceOriginal({ profile, data, seal, currency }: { profile: CompanyProfile; data: InvoiceData; seal: { stamp: string | null; signature: string | null }; currency: string }) {
  const code = currency;
  const sym = currencySymbol(code);
  const lineItems = data.lineItems ?? [];
  const { subtotal, total } = computeTotals(lineItems, data.taxRate ?? 0);
  const shipmentId = data.shipmentId ?? data.trackingNumber ?? data.docNumber ?? '';
  // Adapter: if the ORIGINAL-specific `bank` block is missing but the simpler
  // `bankDetails` (used by A/B designs and the admin form's default section)
  // is present, map its fields so the ORIGINAL invoice still renders the
  // bank transfer instructions instead of blank.
  const bank: InvoiceData['bank'] = data.bank ?? (data.bankDetails ? {
    bankName: data.bankDetails.bank,
    iban: data.bankDetails.iban,
    bicSwift: data.bankDetails.bic,
    reference: data.bankDetails.ref,
  } : undefined);
  const sum = data.summary;
  const co = data.countryOfOrigin ?? code;
  const showSeal = data.placeSeal !== false;
  // Fallback SUMMARY numbers derived from line items when not explicitly given.
  const saleValue = sum?.saleValue ?? subtotal;
  const shipping = sum?.shippingHandling ?? 0;
  const totalValue = sum?.totalValue ?? total;
  const totalToPay = sum?.totalToPay ?? totalValue;
  const shipFrom = data.shipper;
  return (
    <Document title={`Invoice ${data.docNumber}`}>
      <Page size="A4" style={oi.page}>
        <View style={oi.titleBar}>
          <Text style={oi.title}>{profile.name} — INVOICE #{data.docNumber}</Text>
          <Text style={oi.shipId}>SHIPMENT ID <Text style={oi.shipIdMono}>{shipmentId}</Text></Text>
        </View>

        <View style={oi.box}>
          {/* 3-column header */}
          <View style={oi.hdrRow}>
            <View style={[oi.hdrCol, { width: '31%' }]}>
              <Text style={oi.colhead}>SHIP FROM</Text>
              <View style={oi.cellBody}>
                {shipFrom
                  ? originalAddrLines(shipFrom).map((t, i) => <Text key={i} style={oi.addrMono}>{t}</Text>)
                  : <Text style={oi.addrMono}>{profile.name}</Text>}
              </View>
            </View>
            <View style={[oi.hdrCol, { width: '31%' }]}>
              <Text style={oi.colhead}>SHIP/SELL TO</Text>
              <View style={oi.cellBody}>
                {originalAddrLines(data.billTo).map((t, i) => <Text key={i} style={oi.addrMono}>{t}</Text>)}
              </View>
            </View>
            <View style={[oi.hdrColLast, { width: '38%' }]}>
              <Text style={oi.colhead}>INVOICE INFORMATION</Text>
              <View style={oi.barcodeWrap}>
                <Barcode128 value={shipmentId} width={280} height={58} />
                <Text style={oi.hrText}>{shipmentId}</Text>
              </View>
              <View style={oi.kv}>
                <View style={oi.kvLine}><Text style={oi.kvB}>Invoice No: </Text><Text style={oi.kvV}>{data.docNumber}</Text></View>
                <View style={oi.kvLine}><Text style={oi.kvB}>Date: </Text><Text style={oi.kvV}>{data.issueDate}</Text></View>
                {data.poNumber ? <View style={oi.kvLine}><Text style={oi.kvB}>PO No: </Text><Text style={oi.kvV}>{data.poNumber}</Text></View> : null}
                <View style={oi.kvLine}>
                  {data.terms ? <><Text style={oi.kvB}>Terms: </Text><Text style={oi.kvV}>{data.terms}   </Text></> : null}
                  {data.reasonForExport ? <><Text style={oi.kvB}>Reason for Export: </Text><Text style={oi.kvV}>{data.reasonForExport}</Text></> : null}
                </View>
              </View>
            </View>
          </View>

          {/* line-item table */}
          <View style={oi.items}>
            <View style={oi.itHead}>
              <Text style={[oi.itHeadCell, { width: '6%' }]}>Units</Text>
              <Text style={[oi.itHeadCell, { width: '11%' }]}>Type</Text>
              <Text style={[oi.itHeadCell, { flex: 1 }]}>Description/Part No.</Text>
              <Text style={[oi.itHeadCell, { width: '8%' }]}>C/O</Text>
              <Text style={[oi.itHeadCell, { width: '14%', textAlign: 'right' }]}>Price Value</Text>
              <Text style={[oi.itHeadCell, { width: '14%', textAlign: 'right' }]}>Shipping Fee</Text>
              <Text style={[oi.itHeadCell, { width: '14%', textAlign: 'right', borderRightWidth: 0 }]}>Total Value</Text>
            </View>
            {lineItems.map((it, i) => (
              <View style={oi.itRow} key={i}>
                <Text style={[oi.itCell, { width: '6%', textAlign: 'center' }]}>{it.qty}</Text>
                <Text style={[oi.itCell, { width: '11%' }]}>Vehicle</Text>
                <View style={[oi.itCell, { flex: 1 }]}>
                  <Text style={oi.itDesc}>{it.description}</Text>
                  {it.note ? <Text style={oi.itDescSmall}>{it.note}</Text> : null}
                </View>
                <Text style={[oi.itCell, { width: '8%', textAlign: 'center' }]}>{co}</Text>
                <Text style={[oi.itCell, { width: '14%', textAlign: 'right' }]}>{`${sym} ${originalAmount(it.unitPrice)}`}</Text>
                <Text style={[oi.itCell, { width: '14%', textAlign: 'right' }]}>{`${sym} ${originalAmount(0)}`}</Text>
                <Text style={[oi.itCell, { width: '14%', textAlign: 'right', borderRightWidth: 0 }]}>{`${sym} ${originalAmount(it.qty * it.unitPrice)}`}</Text>
              </View>
            ))}
          </View>

          {/* Terms & Conditions — always rendered; long default explains
              the 50%-deposit policy, editable via data.termsAndConditions
              (falls back to legacy data.notes for older docs). */}
          <Text style={oi.secH}>TERMS AND CONDITIONS</Text>
          <View style={oi.tcBody}>
            <Text style={oi.tcP}>{data.termsAndConditions ?? data.notes ?? DEFAULT_INVOICE_TERMS}</Text>
          </View>

          {/* bank transfer instructions */}
          {bank ? (
            <>
              <Text style={oi.secH}>BANK TRANSFER INSTRUCTIONS</Text>
              <Text style={oi.bankIntro}>Use the following information for international bank to bank transfers:</Text>
              <View style={oi.bankTable}>
                {originalBankRows(bank, code).map((r, i) => (
                  <View style={oi.bankRow} key={i}>
                    <Text style={oi.bankLbl}>{r.label}</Text>
                    <Text style={oi.bankVal}>{r.value}</Text>
                  </View>
                ))}
              </View>
              {data.dueDate ? (
                <Text style={oi.bankNote}>Fax or e-mail proof of transfer to confirm your deposit until {data.dueDate}, along with a signed copy of this page. Recommendation: print this page and use it in your local bank office to remit transfer.</Text>
              ) : null}
            </>
          ) : null}

          {/* WARRANTS | SUMMARY */}
          <View style={oi.bottom}>
            <View style={oi.bcellL}>
              <Text style={oi.bcellH}>WARRANTS</Text>
              <Text style={oi.warrantsBody}>Seller is the sole owner of the vehicle; such vehicle is free of all encumbrances, security interests, and other defenses against seller; all disclosures to buyer and other matters in connection with such transaction are in accordance with all applicable laws and regulations. The vehicle is being sold with implied warranty about condition and working order, through the annexed Vehicle Inspection Report.</Text>
            </View>
            <View style={oi.bcellR}>
              <Text style={oi.bcellH}>SUMMARY</Text>
              <View style={{ paddingVertical: 2 }}>
                <View style={oi.sumRow}><Text style={oi.sumLbl}>Prepaid value:</Text><Text style={oi.sumVal}>{originalAmount(sum?.prepaidValue ?? 0)}</Text></View>
                {sum?.previousInvoice ? <View style={oi.sumRow}><Text style={oi.sumLbl}>Previous Invoice #:</Text><Text style={oi.sumVal}>{sum.previousInvoice}</Text></View> : null}
                <View style={oi.sumRow}><Text style={oi.sumLbl}>Sale value:</Text><Text style={oi.sumVal}>{originalAmount(saleValue)}</Text></View>
                <View style={oi.sumRow}><Text style={oi.sumLbl}>Shipping and handling:</Text><Text style={oi.sumVal}>{originalAmount(shipping)}</Text></View>
                <View style={oi.sumRow}><Text style={oi.sumLbl}>Total value:</Text><Text style={oi.sumVal}>{originalAmount(totalValue)}</Text></View>
                {sum?.depositValue !== undefined ? <View style={oi.sumRow}><Text style={oi.sumLbl}>Deposit value:</Text><Text style={oi.sumVal}>{originalAmount(sum.depositValue)}</Text></View> : null}
                {sum?.balance !== undefined ? <View style={oi.sumRow}><Text style={oi.sumLbl}>Balance:</Text><Text style={oi.sumVal}>{originalAmount(sum.balance)}</Text></View> : null}
                <View style={oi.sumTotalRow}><Text style={oi.sumTotalLbl}>Total to pay:</Text><Text style={oi.sumTotalVal}>{`${sym} ${originalAmount(totalToPay)}`}</Text></View>
              </View>
            </View>
          </View>
        </View>

        {/* signatures — issuer (us) only. Invoices are not client-signed. */}
        <View style={oi.signs}>
          <View style={oi.signGrid}>
            <View style={oi.signCell}>
              <Text style={oi.signDate}>{data.issueDate}</Text>
              {showSeal && seal.signature ? <Image style={oi.sigImg} src={seal.signature} /> : null}
              <View style={oi.signLine}><Text>Authorised signature</Text><Text>Date</Text></View>
            </View>
          </View>
          {showSeal && seal.stamp ? <Image style={oi.stamp} src={seal.stamp} /> : null}
        </View>

        <Text style={oi.footer} fixed>
          {profile.name} — Tax ID/VAT# {profile.reg} — {profile.address} — Tel: {profile.phone}
        </Text>
      </Page>
    </Document>
  );
}

// Address block for the ORIGINAL invoice/BoL: uppercase mono lines, present-only.
function originalAddrLines(p: Party | undefined): string[] {
  if (!p) return ['—'];
  const out: string[] = [];
  if (p.company) out.push(p.company);
  if (p.name) out.push(p.name);
  if (p.address) out.push(p.address);
  if (p.vat) out.push(`VAT ${p.vat}`);
  if (p.email) out.push(p.email);
  if (p.phone) out.push(p.phone);
  return out.length ? out : ['—'];
}

// Bare "12,000.00" (two decimals, no symbol) for the ORIGINAL money columns.
function originalAmount(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Bank rows (labels bold, values normal); TOTAL DEBIT carries the currency code.
function originalBankRows(b: NonNullable<InvoiceData['bank']>, code: string): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  if (b.accountName) rows.push({ label: 'ACCOUNT NAME:', value: b.accountName.toUpperCase() });
  if (b.bankName) rows.push({ label: 'BANK NAME:', value: b.bankName.toUpperCase() });
  if (b.iban) rows.push({ label: 'IBAN:', value: b.iban });
  if (b.bicSwift) rows.push({ label: 'BIC/SWIFT CODE:', value: b.bicSwift });
  if (b.bankAddress) rows.push({ label: 'BANK ADDRESS:', value: b.bankAddress.toUpperCase() });
  if (b.accountAddress) rows.push({ label: 'ACCOUNT ADDRESS:', value: b.accountAddress.toUpperCase() });
  if (b.totalDebit !== undefined) rows.push({ label: 'TOTAL DEBIT:', value: `${originalAmount(b.totalDebit)} ${code}` });
  if (b.reference) rows.push({ label: 'REFERENCE:', value: b.reference });
  return rows;
}

// ── ORIGINAL: BILL OF LADING ────────────────────────────────────────────────
const ob = StyleSheet.create({
  page: { padding: 14, fontSize: 8.5, fontFamily: SERIF, color: BLACK },
  outer: { borderWidth: 1.2, borderColor: BLACK, padding: 6 },
  toprow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: BLACK, paddingHorizontal: 6, paddingVertical: 3 },
  topDate: { fontFamily: SERIF_B, fontSize: 9 },
  topDateMono: { fontFamily: MONO },
  topTitle: { flex: 1, textAlign: 'center', fontFamily: SERIF_B, fontSize: 10 },
  topPg: { fontFamily: SERIF_B, fontSize: 9, textAlign: 'right' },

  body2: { flexDirection: 'row', borderWidth: 1, borderColor: BLACK, borderTopWidth: 0 },
  colLeft: { width: '50%', borderRightWidth: 1, borderRightColor: BLACK },
  colRight: { width: '50%' },
  subband: { backgroundColor: BAND, fontFamily: SERIF_B, fontSize: 9, textAlign: 'center', paddingVertical: 1.5, borderBottomWidth: 1, borderBottomColor: BLACK },
  party: { paddingHorizontal: 8, paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: BLACK },
  ln: { flexDirection: 'row', paddingVertical: 0.6, fontSize: 8.5 },
  lnLbl: { fontFamily: SERIF_B },
  lnVal: { fontFamily: MONO },
  special: { paddingHorizontal: 8, paddingVertical: 5, fontFamily: SERIF_B, fontSize: 9, height: 40 },

  rc: { paddingHorizontal: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: BLACK },
  rcLbl: { fontFamily: SERIF_B, fontSize: 9, marginBottom: 2 },
  bcHr: { fontFamily: MONO, fontSize: 8, letterSpacing: 2, marginTop: 1, textAlign: 'center' },
  rcRow: { fontSize: 8.5, paddingVertical: 1 },
  rcMono: { fontFamily: MONO_B },
  qrWrap: { alignItems: 'center' },

  band: { backgroundColor: BAND, textAlign: 'center', fontFamily: SERIF_B, fontSize: 9, paddingVertical: 1.5, borderWidth: 1, borderColor: BLACK, borderTopWidth: 0 },
  tbl: { borderWidth: 1, borderColor: BLACK, borderTopWidth: 0 },
  tr: { flexDirection: 'row' },
  th: { fontFamily: SERIF_B, fontSize: 8, borderWidth: 0.5, borderColor: BLACK, paddingHorizontal: 4, paddingVertical: 2 },
  td: { fontSize: 8, borderWidth: 0.5, borderColor: BLACK, paddingHorizontal: 4, paddingVertical: 2 },
  tdData: { fontFamily: MONO_B, fontSize: 8, borderWidth: 0.5, borderColor: BLACK, paddingHorizontal: 4, paddingVertical: 2 },
  grpH: { fontFamily: SERIF_B, fontSize: 8, textAlign: 'center', borderWidth: 0.5, borderColor: BLACK, paddingVertical: 1.5 },
  emptyFill: { backgroundColor: BLACK },
  rowband: { backgroundColor: BAND },

  codrow: { flexDirection: 'row', borderWidth: 1, borderColor: BLACK, borderTopWidth: 0 },
  codL: { width: '50%', paddingHorizontal: 6, paddingVertical: 3, fontSize: 6.5, lineHeight: 1.3, borderRightWidth: 1, borderRightColor: BLACK },
  codR: { width: '50%', paddingHorizontal: 8, paddingVertical: 3, fontSize: 8.5 },
  codLn: { paddingVertical: 1.5 },
  u: { fontFamily: MONO },

  liab: { borderWidth: 1, borderColor: BLACK, borderTopWidth: 0, paddingHorizontal: 6, paddingVertical: 2.5, fontFamily: SERIF_B, fontSize: 9 },
  liabVal: { fontFamily: MONO },

  disc: { flexDirection: 'row', borderWidth: 1, borderColor: BLACK, borderTopWidth: 0 },
  discL: { width: '50%', paddingHorizontal: 6, paddingVertical: 3, fontSize: 6.5, lineHeight: 1.35, borderRightWidth: 1, borderRightColor: BLACK },
  discR: { width: '50%', paddingHorizontal: 8, paddingVertical: 5, fontFamily: SERIF_B, fontSize: 9 },

  sigs: { flexDirection: 'row', borderWidth: 1, borderColor: BLACK, borderTopWidth: 0, position: 'relative' },
  sig: { paddingHorizontal: 6, paddingVertical: 4, position: 'relative' },
  sigBorder: { borderLeftWidth: 1, borderLeftColor: BLACK },
  sigH: { fontFamily: SERIF_B, fontSize: 8.5, marginBottom: 2 },
  sigFine: { fontSize: 5.5, lineHeight: 1.35 },
  sigChecks: { fontSize: 8, lineHeight: 1.7, marginTop: 2 },
  sigSpace: { height: 50, position: 'relative' },
  sigLine: { borderTopWidth: 1, borderTopColor: BLACK, flexDirection: 'row', justifyContent: 'space-between', fontSize: 6, paddingTop: 1 },
  sigDateBig: { fontFamily: MONO, fontSize: 10, position: 'absolute', bottom: 3, left: 22 },
  sigHand: { position: 'absolute', left: 6, bottom: 12, width: 120, height: 40, objectFit: 'contain' },
  stamp: { position: 'absolute', width: 110, left: '52%', top: -34, opacity: 0.9, objectFit: 'contain', zIndex: 2 },
});

function BolOriginal({ profile, data, seal, currency }: { profile: CompanyProfile; data: BillOfLadingData; seal: { stamp: string | null; signature: string | null }; currency: string }) {
  const code = currency;
  const shipmentId = data.shipmentId ?? data.trackingNumber ?? data.docNumber ?? '';
  // billTo (client-prefilled) is the shipper-side info in our data model; use it as the party fallback.
  const billTo = (data as { billTo?: Party }).billTo;
  const shipper = data.shipper ?? billTo;
  const consignee = data.consignee ?? billTo;
  const third = data.thirdParty ?? consignee;
  const veh = data.vehicle;
  const cod = data.codAmount;
  const sh = data.shippingHandling ?? 0;
  const showSeal = data.placeSeal !== false;
  const vehDesc = veh ? (veh.vin ? `${veh.description ?? ''} VIN ${veh.vin}` : (veh.description ?? '')) : '';
  const bolLines = (p: Party | undefined): { label: string; value: string }[] => {
    if (!p) return [{ label: 'Name:', value: '—' }];
    const rows: { label: string; value: string }[] = [];
    rows.push({ label: 'Name:', value: p.company ? `${p.company} — ${p.name ?? ''}` : (p.name ?? '—') });
    if (p.address) rows.push({ label: 'Address:', value: p.address });
    if (p.vat) rows.push({ label: 'VAT:', value: p.vat });
    if (p.phone) rows.push({ label: 'Phone:', value: p.phone });
    return rows;
  };
  return (
    <Document title={`Bill of Lading ${data.docNumber}`}>
      <Page size="A4" style={ob.page}>
        <View style={ob.outer}>
          <View style={ob.toprow}>
            <Text style={ob.topDate}>Date  <Text style={ob.topDateMono}>{data.date}</Text></Text>
            <Text style={ob.topTitle}>{profile.name} - Bill of Lading</Text>
            <Text style={ob.topPg}>Page 1 of 1</Text>
          </View>

          <View style={ob.body2}>
            <View style={ob.colLeft}>
              <Text style={ob.subband}>Ship From</Text>
              <View style={ob.party}>
                {bolLines(shipper).map((r, i) => (
                  <View style={ob.ln} key={i}><Text style={ob.lnLbl}>{r.label}  </Text><Text style={ob.lnVal}>{r.value}</Text></View>
                ))}
              </View>
              <Text style={ob.subband}>Ship To</Text>
              <View style={ob.party}>
                {bolLines(consignee).map((r, i) => (
                  <View style={ob.ln} key={i}><Text style={ob.lnLbl}>{r.label}  </Text><Text style={ob.lnVal}>{r.value}</Text></View>
                ))}
              </View>
              <Text style={ob.subband}>Third Party Freight Charges Bill to:</Text>
              <View style={ob.party}>
                {bolLines(third).map((r, i) => (
                  <View style={ob.ln} key={i}><Text style={ob.lnLbl}>{r.label}  </Text><Text style={ob.lnVal}>{r.value}</Text></View>
                ))}
              </View>
              <Text style={ob.special}>Special Instructions: {data.specialInstructions ?? ''}</Text>
            </View>

            <View style={ob.colRight}>
              <View style={[ob.rc, { alignItems: 'center' }]}>
                <Text style={[ob.rcLbl, { alignSelf: 'flex-start' }]}>Barcode</Text>
                <Barcode128 value={shipmentId} width={240} height={50} />
                <Text style={ob.bcHr}>{shipmentId.split('').join(' ')}</Text>
              </View>
              <View style={ob.rc}>
                <Text style={ob.rcLbl}>Carrier Name: {profile.name}</Text>
                {data.trailerNumber ? <Text style={ob.rcRow}>Trailer number:  <Text style={ob.rcMono}>{data.trailerNumber}</Text></Text> : null}
                {data.serialNumber ? <Text style={ob.rcRow}>Serial number(s):  <Text style={ob.rcMono}>{data.serialNumber}</Text></Text> : null}
              </View>
              <View style={ob.rc}>
                {data.referenceNumber ? <Text style={ob.rcLbl}>Reference Number:  <Text style={ob.rcMono}>{data.referenceNumber}</Text></Text> : null}
                <View style={ob.qrWrap}>
                  <QrCode value={`https://ctlcouriers.com/tracking?n=${shipmentId}`} size={82} />
                </View>
              </View>
              <View style={[ob.rc, { borderBottomWidth: 0 }]}>
                <Text style={ob.rcLbl}>Freight Charge Terms:</Text>
                <Text style={ob.rcRow}>Prepaid:  <Text style={ob.rcMono}>X</Text>    Collect:    3rd Party:</Text>
                <Text style={[ob.rcRow, { fontSize: 7, borderTopWidth: 1, borderTopColor: BLACK, paddingTop: 2 }]}>Master bill of lading with attached underlying bills of lading.</Text>
              </View>
            </View>
          </View>

          {/* Customer Order Information */}
          <Text style={ob.band}>Customer Order Information</Text>
          <View style={ob.tbl}>
            <View style={ob.tr}>
              <Text style={[ob.th, { width: '38%' }]}>Customer Order No.</Text>
              <Text style={[ob.th, { width: '13%', textAlign: 'center' }]}>No. Packages</Text>
              <Text style={[ob.th, { width: '11%' }]}>Weight</Text>
              <Text style={[ob.th, { width: '12%', textAlign: 'center' }]}>Pallet/Slip</Text>
              <Text style={[ob.th, { flex: 1 }]}>Additional Shipper Information</Text>
            </View>
            <View style={ob.tr}>
              <Text style={[ob.tdData, { width: '38%' }]}>{shipmentId}</Text>
              <Text style={[ob.tdData, { width: '13%', textAlign: 'center' }]}>{data.pieces ?? 1}</Text>
              <Text style={[ob.tdData, { width: '11%' }]}>{data.weightKg ?? veh?.weight ?? ''}</Text>
              <Text style={[ob.tdData, { width: '12%', textAlign: 'center' }]}>X</Text>
              <Text style={[ob.td, { flex: 1 }]}> </Text>
            </View>
            <View style={ob.tr}>
              <Text style={[ob.td, { width: '38%' }]}>Grand Total</Text>
              <Text style={[ob.td, { width: '13%' }]}> </Text>
              <Text style={[ob.td, { flex: 1, textAlign: 'right', fontFamily: SERIF_B }, ob.rowband]}>Shipping &amp; Handling:  <Text style={ob.rcMono}>{originalAmount(sh)} {code}</Text></Text>
            </View>
          </View>

          {/* Carrier Information */}
          <Text style={ob.band}>Carrier Information</Text>
          <View style={ob.tbl}>
            <View style={ob.tr}>
              <Text style={[ob.grpH, { width: '16%' }]}>Handling Unit</Text>
              <Text style={[ob.grpH, { flex: 1 }]}>Package</Text>
              <Text style={[ob.grpH, { width: '22%' }]}>LTL Only</Text>
            </View>
            <View style={ob.tr}>
              <Text style={[ob.th, { width: '4%', textAlign: 'center' }]}>Qty</Text>
              <Text style={[ob.th, { width: '12%', textAlign: 'center' }]}>Type</Text>
              <Text style={[ob.th, { width: '4%', textAlign: 'center' }]}>Qty</Text>
              <Text style={[ob.th, { width: '12%', textAlign: 'center' }]}>Type</Text>
              <Text style={[ob.th, { width: '7%', textAlign: 'center' }]}>Weight</Text>
              <Text style={[ob.th, { width: '6%', textAlign: 'center' }]}>U/M</Text>
              <Text style={[ob.th, { flex: 1, textAlign: 'center' }]}>Description</Text>
              <Text style={[ob.th, { width: '11%', textAlign: 'center' }]}>NMFC No.</Text>
              <Text style={[ob.th, { width: '11%', textAlign: 'center' }]}>Class</Text>
            </View>
            {veh ? (
              <View style={ob.tr}>
                <Text style={[ob.tdData, { width: '4%', textAlign: 'center' }]}>{veh.qty ?? 1}</Text>
                <Text style={[ob.tdData, { width: '12%', textAlign: 'center' }]}>{veh.type ?? 'Vehicle'}</Text>
                <Text style={[ob.tdData, { width: '4%', textAlign: 'center' }]}>{veh.qty ?? 1}</Text>
                <Text style={[ob.tdData, { width: '12%', textAlign: 'center' }]}>{veh.type ?? 'Vehicle'}</Text>
                <Text style={[ob.tdData, { width: '7%', textAlign: 'center' }]}>{veh.weight ?? ''}</Text>
                <Text style={[ob.tdData, { width: '6%', textAlign: 'center' }]}>{veh.unit ?? 'KG'}</Text>
                <Text style={[ob.tdData, { flex: 1, textAlign: 'center' }]}>{vehDesc}</Text>
                <Text style={[ob.tdData, { width: '11%', textAlign: 'center' }]}>{veh.nmfc ?? ''}</Text>
                <Text style={[ob.tdData, { width: '11%', textAlign: 'center' }]}>{veh.packageClass ?? ''}</Text>
              </View>
            ) : null}
            <View style={ob.tr}>
              <Text style={[ob.td, { width: '4%' }]}> </Text>
              <Text style={[ob.td, { width: '12%' }, ob.emptyFill]}> </Text>
              <Text style={[ob.td, { width: '4%' }]}> </Text>
              <Text style={[ob.td, { width: '12%' }, ob.emptyFill]}> </Text>
              <Text style={[ob.td, { width: '7%' }]}> </Text>
              <Text style={[ob.td, { width: '6%' }]}> </Text>
              <Text style={[ob.td, { flex: 1 }]}> </Text>
              <Text style={[ob.td, { width: '11%' }]}> </Text>
              <Text style={[ob.td, { width: '11%' }]}> </Text>
            </View>
          </View>

          {/* COD */}
          <View style={ob.codrow}>
            <Text style={ob.codL}>Where the rate is dependent on value, shippers are required to state specifically in writing the agreed or declared value of the property as follows: &ldquo;The agreed or declared value of the property is specifically stated by the shipper to be not exceeding {cod !== undefined ? `${cod} ${code}` : '________'}.&rdquo;</Text>
            <View style={ob.codR}>
              <Text style={ob.codLn}>COD Amount:  <Text style={ob.u}>{cod !== undefined ? `${cod} ${code}` : '________'}</Text></Text>
              <Text style={ob.codLn}>Free terms: Collect <Text style={ob.rcMono}>X</Text>, Prepaid <Text style={ob.rcMono}>__</Text>, Customer check acceptable <Text style={ob.rcMono}>__</Text></Text>
            </View>
          </View>

          {/* Liability */}
          <Text style={ob.liab}>Liability limitation for loss or damage in this shipment is:  <Text style={ob.liabVal}>NOT APPLICABLE</Text></Text>

          {/* Disclaimer + delivery note */}
          <View style={ob.disc}>
            <Text style={ob.discL}>Received, subject to individually determined rates or contracts that have been agreed upon in writing between the carrier and shipper, if applicable, otherwise to the rates, classifications and rules that have been established by the carrier and are available to the shipper, on request, and to all applicable state and federal regulations.</Text>
            <Text style={ob.discR}>The carrier shall not make delivery of this shipment without full payment.</Text>
          </View>

          {/* Signature blocks */}
          <View style={ob.sigs}>
            {showSeal && seal.stamp ? <Image style={ob.stamp} src={seal.stamp} /> : null}
            <View style={[ob.sig, { width: '34%' }]}>
              <Text style={ob.sigH}>Shipper Signature/Date</Text>
              <Text style={ob.sigFine}>This is to certify that the above named materials are properly classified, packaged, marked and labeled, and are in proper condition for transportation according to the applicable regulations.</Text>
              <View style={ob.sigSpace}>
                {showSeal && seal.signature ? <Image style={ob.sigHand} src={seal.signature} /> : null}
                <Text style={ob.sigDateBig}>{data.date}</Text>
              </View>
              <View style={ob.sigLine}><Text>Signature</Text><Text>Date</Text></View>
            </View>
            <View style={[ob.sig, ob.sigBorder, { width: '13%' }]}>
              <Text style={ob.sigH}>Trailer Loaded:</Text>
              <Text style={ob.sigChecks}><Text style={ob.rcMono}>_</Text> By shipper{'\n'}<Text style={ob.rcMono}>X</Text> By driver</Text>
            </View>
            <View style={[ob.sig, ob.sigBorder, { width: '19%' }]}>
              <Text style={ob.sigH}>Freight Counted:</Text>
              <Text style={ob.sigChecks}><Text style={ob.rcMono}>_</Text> By shipper{'\n'}<Text style={ob.rcMono}>X</Text> By driver/pallets{'\n'}<Text style={ob.rcMono}>_</Text> By driver/pieces</Text>
            </View>
            <View style={[ob.sig, ob.sigBorder, { width: '34%' }]}>
              <Text style={ob.sigH}>Carrier Signature/Pickup Date</Text>
              <Text style={ob.sigFine}>Carrier acknowledges receipt of packages and required placards. Property described above is received in good order, except as noted.</Text>
              <View style={ob.sigSpace}>
                <Text style={ob.sigDateBig}>{data.date}</Text>
              </View>
              <View style={ob.sigLine}><Text>Signature</Text><Text>Date</Text></View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ── ORIGINAL: INSPECTION ─────────────────────────────────────────────────────
// 46 standard checklist item names, in order (left 1-23, right 24-46).
const INSPECTION_ITEMS = [
  'Headlights', 'Parking Lights', 'Tail Light', 'Brake Light', 'Directional Signal',
  'Hazardous Warning Signal', 'Clearance Lamp', 'Side Marker Lamp', 'Identification Lamp',
  'Reflectors', 'Brakes', 'Steering System', 'Suspension', 'Windshield Wiper', 'Horns',
  'Exhaust System', 'Fuel System', 'Engine Compartment', 'Service Door', 'Emergency Door',
  'Emergency Exit', 'Inside Rearview Mirror', 'Outside Rearview Mirror', 'Sideview Mirror',
  'Crossover Mirror', 'Fire Extinguisher', 'First Aid Kid', 'Emergency Warning Device',
  'Windshield', 'Windows', 'Rub Rails', 'Bumpers', 'Pupil Warning Lamp System', 'Stop Arm',
  'Drive Shaft Guards', 'Neutral Safety Switch', 'Tires', 'Wheels', 'Seating / Driver Seat Belt',
  'Interior Lights', 'Unsecured Items', 'Bus Condition', 'Electrical System', 'Tag / Registration',
  'Tag Light', 'Liability Insurance',
];

const os = StyleSheet.create({
  page: { paddingTop: 22, paddingBottom: 20, paddingHorizontal: 26, fontSize: 8.5, fontFamily: SERIF, color: BLACK, position: 'relative' },
  title: { textAlign: 'center', fontFamily: SERIF_B, fontSize: 16, marginBottom: 1 },
  subhead: { textAlign: 'center', fontSize: 8, fontStyle: 'italic', marginBottom: 10 },

  selectrow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', fontSize: 8.5, marginBottom: 5 },
  lbl: { fontFamily: SERIF_B, fontSize: 8.5 },
  grp: { flexDirection: 'row', alignItems: 'center', marginRight: 10 },
  grpTxt: { marginLeft: 4, fontSize: 8.5 },
  sep: { color: '#888', marginHorizontal: 4 },

  rowline: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5, fontSize: 8.5 },
  fill: { fontFamily: MONO, fontSize: 8.5, borderBottomWidth: 1, borderBottomColor: BLACK, paddingHorizontal: 5, paddingBottom: 1, marginLeft: 5 },
  fillGrow: { flex: 1 },

  vehrow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2, marginBottom: 8 },
  vehItem: { flexDirection: 'row', alignItems: 'flex-end', fontSize: 8.5, marginRight: 12, marginBottom: 3 },

  codeNote: { fontFamily: SERIF_B, fontSize: 8, marginTop: 1, marginBottom: 3 },

  checklist: { flexDirection: 'row', borderWidth: 1, borderColor: BLACK },
  clCol: { width: '50%' },
  clColLeft: { borderRightWidth: 1, borderRightColor: BLACK },
  chead: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BLACK },
  cheadItem: { flex: 1, fontFamily: SERIF_B, fontSize: 7.5, paddingHorizontal: 5, paddingVertical: 1.5 },
  cheadMark: { width: 20, fontFamily: SERIF_B, fontSize: 7.5, textAlign: 'center', paddingVertical: 1.5, borderLeftWidth: 1, borderLeftColor: BLACK },
  cheadNa: { width: 26, fontFamily: SERIF_B, fontSize: 7.5, textAlign: 'center', paddingVertical: 1.5, borderLeftWidth: 1, borderLeftColor: BLACK },
  citem: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BLACK, minHeight: 13, alignItems: 'stretch' },
  citemName: { flex: 1, flexDirection: 'row', paddingHorizontal: 5, paddingVertical: 1, fontSize: 7.5, alignItems: 'center' },
  citemNum: { fontFamily: SERIF_B, width: 16 },
  cellMark: { width: 20, borderLeftWidth: 1, borderLeftColor: BLACK, alignItems: 'center', justifyContent: 'center' },
  cellNa: { width: 26, borderLeftWidth: 1, borderLeftColor: BLACK, alignItems: 'center', justifyContent: 'center' },

  midrow: { flexDirection: 'row', marginTop: 8 },
  comments: { flex: 1, marginRight: 14 },
  commentLine: { fontFamily: MONO, fontSize: 8.5, borderBottomWidth: 1, borderBottomColor: BLACK, paddingHorizontal: 3, paddingVertical: 2, minHeight: 16, marginTop: 4 },
  codebox: { width: 160, fontSize: 8, lineHeight: 1.5 },
  codeboxB: { fontFamily: SERIF_B, fontSize: 8.5 },

  signoff: { marginTop: 10 },
  signoffRow: { flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', fontSize: 8.5, marginBottom: 6 },

  legend: { marginTop: 10, borderWidth: 1, borderColor: BLACK, paddingHorizontal: 10, paddingVertical: 7 },
  lgTitle: { fontFamily: SERIF_B, fontSize: 8.5, textTransform: 'uppercase', marginBottom: 5 },
  lgGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  lgItem: { flexDirection: 'row', alignItems: 'center', width: '33%', marginBottom: 4, fontSize: 8 },
  lgTxt: { marginLeft: 6 },
  lgNote: { marginTop: 6, fontFamily: SERIF_B, fontSize: 8, textTransform: 'uppercase', lineHeight: 1.35 },

  stamp: { position: 'absolute', right: 110, bottom: 150, width: 130, opacity: 0.85, objectFit: 'contain' },
});

function markOf(c: { condition: string; mark?: 'P' | 'R' | 'N' }): 'P' | 'R' | 'N' {
  if (c.mark) return c.mark;
  const v = c.condition.trim().toUpperCase();
  if (v.startsWith('R') || v === 'FAIL' || v === 'REJECTED') return 'R';
  if (v.startsWith('N') || v === 'N/A') return 'N';
  return 'P';
}

function InspectionOriginal({ profile, data, seal }: { profile: CompanyProfile; data: InspectionData; seal: { stamp: string | null; signature: string | null } }) {
  const v = data.vehicle ?? ({} as Vehicle);
  const checklist = data.checklist ?? [];
  const showSeal = data.placeSeal !== false;
  // Merge provided checklist onto the canonical 46-item list (by index/name).
  const marks: ('P' | 'R' | 'N')[] = INSPECTION_ITEMS.map((name, i) => {
    const provided = checklist[i] ?? checklist.find((c) => c.item.toLowerCase() === name.toLowerCase());
    return provided ? markOf(provided) : 'P';
  });
  const vt = data.vehicleType ?? 'Car';
  const it = data.inspectionType ?? 'Initial Inspection';
  const makeModel = [v.make, v.model].filter(Boolean).join(' ');

  const renderCol = (from: number, to: number, isLeft: boolean) => (
    <View style={[os.clCol, isLeft ? os.clColLeft : {}]}>
      <View style={os.chead}>
        <Text style={os.cheadItem}>Item</Text>
        <Text style={os.cheadMark}>P</Text>
        <Text style={os.cheadMark}>R</Text>
        <Text style={os.cheadNa}>N/A</Text>
      </View>
      {INSPECTION_ITEMS.slice(from, to).map((name, k) => {
        const idx = from + k;
        const mk = marks[idx];
        return (
          <View style={os.citem} key={idx}>
            <View style={os.citemName}><Text style={os.citemNum}>{idx + 1}.</Text><Text>{name}</Text></View>
            <View style={os.cellMark}><Square on={mk === 'P'} /></View>
            <View style={os.cellMark}><Square on={mk === 'R'} /></View>
            <View style={os.cellNa}><Square on={mk === 'N'} /></View>
          </View>
        );
      })}
    </View>
  );

  return (
    <Document title={`Inspection ${data.docNumber}`}>
      <Page size="A4" style={os.page}>
        <Text style={os.title}>VEHICLE INSPECTION REPORT</Text>
        <Text style={os.subhead}>{profile.name} · {profile.address}</Text>

        <View style={os.selectrow}>
          <Text style={os.lbl}>Select all that apply: </Text>
          <View style={os.grp}><Square on={vt === 'Bus'} size={9} /><Text style={os.grpTxt}>Bus</Text></View>
          <View style={os.grp}><Square on={vt === 'Car'} size={9} /><Text style={os.grpTxt}>Car</Text></View>
          <View style={os.grp}><Square on={vt === 'Other'} size={9} /><Text style={os.grpTxt}>Other</Text></View>
          <Text style={os.sep}>|</Text>
          <View style={os.grp}><Square on={it === 'Initial Inspection'} size={9} /><Text style={os.grpTxt}>Initial Inspection</Text></View>
          <View style={os.grp}><Square on={it === 'Re-inspection'} size={9} /><Text style={os.grpTxt}>Re-inspection</Text></View>
        </View>

        <View style={os.rowline}>
          <Text style={os.lbl}>Make / Model:</Text>
          <Text style={[os.fill, os.fillGrow]}>{makeModel}</Text>
        </View>

        <View style={os.vehrow}>
          {v.year ? <View style={os.vehItem}><Text style={os.lbl}>Year: </Text><Text style={os.fill}>{v.year}</Text></View> : null}
          {v.odometer ? <View style={os.vehItem}><Text style={os.lbl}>Odometer: </Text><Text style={os.fill}>{v.odometer}</Text></View> : null}
          {v.power ? <View style={os.vehItem}><Text style={os.lbl}>Power (HP): </Text><Text style={os.fill}>{v.power}</Text></View> : null}
          {v.transmission ? <View style={os.vehItem}><Text style={os.lbl}>Transmission: </Text><Text style={os.fill}>{v.transmission}</Text></View> : null}
          {v.fuel ? <View style={os.vehItem}><Text style={os.lbl}>Fuel: </Text><Text style={os.fill}>{v.fuel}</Text></View> : null}
        </View>

        <Text style={os.codeNote}>CODE:   P = Pass    R = Rejected    N/A = Not Applicable</Text>

        <View style={os.checklist}>
          {renderCol(0, 23, true)}
          {renderCol(23, 46, false)}
        </View>

        <View style={os.midrow}>
          <View style={os.comments}>
            <Text style={os.lbl}>Comments:</Text>
            <Text style={os.commentLine}>{data.comments ?? data.notes ?? ' '}</Text>
          </View>
          <View style={os.codebox}>
            <Text style={os.codeboxB}>CODE</Text>
            <Text>P = Pass</Text>
            <Text>R = Rejected</Text>
            <Text>N/A = Not Applicable</Text>
          </View>
        </View>

        <View style={os.signoff}>
          <View style={os.signoffRow}>
            <Text style={os.lbl}>Inspected by: </Text><Text style={[os.fill, { minWidth: 150 }]}>{data.inspector ?? ''}</Text>
            {data.inspectorId ? <><Text style={[os.lbl, { marginLeft: 8 }]}>ID#: </Text><Text style={[os.fill, { minWidth: 50 }]}>{data.inspectorId}</Text></> : null}
            <Text style={[os.lbl, { marginLeft: 8 }]}>Date: </Text><Text style={[os.fill, { minWidth: 110 }]}>{data.date}</Text>
          </View>
          <View style={os.signoffRow}>
            <Text style={os.lbl}>Business Name: </Text><Text style={[os.fill, { minWidth: 240 }]}>{data.businessName ?? profile.name}</Text>
            <Text style={[os.lbl, { marginLeft: 8 }]}>Contact Nr: </Text><Text style={[os.fill, { minWidth: 110 }]}>{data.contactNumber ?? profile.phone}</Text>
          </View>
        </View>

        <View style={os.legend}>
          <Text style={os.lgTitle}>Inspection Result Legend</Text>
          <View style={os.lgGrid}>
            <View style={os.lgItem}><Square on size={10} /><Text style={os.lgTxt}>Approved</Text></View>
            <View style={os.lgItem}><Square on={false} size={10} /><Text style={os.lgTxt}>Rejected</Text></View>
            <View style={os.lgItem}><Square on={false} size={10} /><Text style={os.lgTxt}>Passed Re-inspection</Text></View>
            <View style={os.lgItem}><Square on={false} size={10} /><Text style={os.lgTxt}>Unsafe Vehicle - Do Not Transport Children</Text></View>
          </View>
          <Text style={os.lgNote}>Cannot be approved until all items are found satisfactory for safe operation.</Text>
        </View>

        {showSeal && seal.stamp ? <Image style={os.stamp} src={seal.stamp} /> : null}
      </Page>
    </Document>
  );
}

// ═════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═════════════════════════════════════════════════════════════════════════

// Back-compat alias for the route, which types the stored dataJson as DocData.
export type DocData = DocumentData;

// Optional issuer override on the data payload (falls back to CTL_PROFILE).
type WithIssuer = { issuer?: CompanyProfile };

export async function renderDocument(
  type: DocumentType,
  design: DocumentDesign,
  data: DocumentData,
  seal?: Seal,
  currency?: string,
): Promise<Buffer> {
  const profile = (data as WithIssuer).issuer ?? CTL_PROFILE;
  const resolved = resolveSeal(seal);
  const ccy = currency ?? 'EUR';
  const orig = design === 'ORIGINAL';
  const A = design === 'A';

  let element: React.ReactElement;
  switch (type) {
    case 'INVOICE': {
      const d = data as InvoiceData;
      element = orig
        ? <InvoiceOriginal profile={profile} data={d} seal={resolved} currency={ccy} />
        : A
          ? <InvoiceA profile={profile} data={d} seal={resolved} currency={ccy} />
          : <InvoiceB profile={profile} data={d} seal={resolved} currency={ccy} />;
      break;
    }
    case 'BILL_OF_LADING': {
      const d = data as BillOfLadingData;
      element = orig
        ? <BolOriginal profile={profile} data={d} seal={resolved} currency={ccy} />
        : A
          ? <BolA profile={profile} data={d} seal={resolved} />
          : <BolB profile={profile} data={d} seal={resolved} />;
      break;
    }
    case 'INSPECTION': {
      const d = data as InspectionData;
      element = orig
        ? <InspectionOriginal profile={profile} data={d} seal={resolved} />
        : A
          ? <InspectionA profile={profile} data={d} seal={resolved} />
          : <InspectionB profile={profile} data={d} seal={resolved} />;
      break;
    }
    default: {
      const d = data as InvoiceData;
      element = orig
        ? <InvoiceOriginal profile={profile} data={d} seal={resolved} currency={ccy} />
        : <InvoiceA profile={profile} data={d} seal={resolved} currency={ccy} />;
    }
  }

  return renderToBuffer(element);
}
