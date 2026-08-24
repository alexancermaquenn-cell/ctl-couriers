// Shared document dataJson shapes. Imported by the PDF renderer, the API and the UI.
// company + vatNumber (and phone/address) are OPTIONAL everywhere: individuals have no
// company/VAT. Renderers must build party blocks from present lines only — never a fixed
// template with empty bold lines or bare "VAT:" labels.

export type DocumentDesign = 'ORIGINAL' | 'A' | 'B';

/** A party / address block (billTo, shipper, consignee, carrier...). Only name is required. */
export interface Party {
  name: string;
  company?: string;
  address?: string;
  email?: string;
  phone?: string;
  vat?: string;
}

export interface LineItem {
  description: string;
  note?: string;
  qty: number;
  unitPrice: number;
}

export interface BankDetails {
  bank: string;
  iban: string;
  bic: string;
  ref?: string;
}

export interface InvoiceData {
  billTo: Party;
  shipper?: Party;
  docNumber: string;
  issueDate: string;
  dueDate?: string;
  origin?: string;
  destination?: string;
  weightKg?: number;
  service?: string;
  incoterm?: string;
  trackingNumber?: string;
  lineItems: LineItem[];
  taxRate: number; // percent
  notes?: string;
  bankDetails?: BankDetails;
  placeSeal?: boolean;
  /** Optional vehicle being invoiced; auto-fills the first line-item description. */
  vehicle?: Vehicle;

  // ── ORIGINAL-template extras (all optional; A/B ignore them) ──────────────
  shipmentId?: string;
  poNumber?: string;
  terms?: string; // e.g. "DDP"
  reasonForExport?: string; // e.g. "Sale"
  /** C/O column shows the currency code by default; override per doc if needed. */
  countryOfOrigin?: string;
  /** Full bank block for BANK TRANSFER INSTRUCTIONS (ORIGINAL invoice). */
  bank?: OriginalBank;
  /** SUMMARY breakdown (ORIGINAL invoice). Any omitted value is computed/blank. */
  summary?: InvoiceSummary;
}

/** Bank block for the ORIGINAL invoice's BANK TRANSFER INSTRUCTIONS. */
export interface OriginalBank {
  accountName?: string;
  bankName?: string;
  iban?: string;
  bicSwift?: string;
  bankAddress?: string;
  accountAddress?: string;
  /** Numeric amount to debit; rendered with the doc currency code. */
  totalDebit?: number;
  reference?: string;
}

/** SUMMARY numbers for the ORIGINAL invoice (bare amounts; currency applied on render). */
export interface InvoiceSummary {
  prepaidValue?: number;
  previousInvoice?: string;
  saleValue?: number;
  shippingHandling?: number;
  totalValue?: number;
  depositValue?: number;
  balance?: number;
  totalToPay?: number;
}

export interface BolGood {
  marks?: string;
  description: string;
  qty: number;
  weight?: string;
}

export interface BillOfLadingData {
  shipper: Party;
  consignee: Party;
  carrier?: string;
  docNumber: string;
  date: string;
  origin: string;
  destination: string;
  weightKg?: number;
  pieces?: number;
  service?: string;
  incoterm?: string;
  goods: BolGood[];
  trackingNumber?: string;
  notes?: string;
  placeSeal?: boolean;

  // ── ORIGINAL-template extras (all optional; A/B ignore them) ──────────────
  shipmentId?: string;
  /** Third-party freight-charges party; falls back to consignee when absent. */
  thirdParty?: Party;
  specialInstructions?: string;
  trailerNumber?: string;
  serialNumber?: string;
  referenceNumber?: string;
  /** Vehicle line for the Carrier Information table. */
  vehicle?: BolVehicle;
  /** COD / declared value (numeric); rendered with the doc currency code. */
  codAmount?: number;
  shippingHandling?: number;
}

/** Vehicle row for the ORIGINAL BoL Carrier Information table. */
export interface BolVehicle {
  qty?: number;
  type?: string; // "Vehicle"
  weight?: string; // "1848"
  unit?: string; // "KG"
  description: string;
  vin?: string;
  nmfc?: string;
  packageClass?: string; // "Container"
}

export interface Vehicle {
  make: string;
  model: string;
  year?: string;
  vin?: string;
  registration?: string;
  colour?: string;
  odometer?: string;
  fuel?: string;
  keys?: string;
  // ORIGINAL inspection extras (optional).
  power?: string; // HP
  transmission?: string;
}

export interface ChecklistItem {
  item: string;
  /** A/B free-text condition. */
  condition: string;
  /** ORIGINAL 46-item mark: P = pass, R = rejected, N = not applicable. */
  mark?: 'P' | 'R' | 'N';
}

export interface InspectionData {
  vehicle: Vehicle;
  client?: { name: string; company?: string };
  docNumber: string;
  date: string;
  location?: string;
  inspector?: string;
  checklist: ChecklistItem[];
  overallGrade?: string;
  notes?: string;
  placeSeal?: boolean;

  // ── ORIGINAL-template extras (all optional) ───────────────────────────────
  vehicleType?: 'Bus' | 'Car' | 'Other';
  inspectionType?: 'Initial Inspection' | 'Re-inspection';
  inspectorId?: string;
  businessName?: string;
  contactNumber?: string;
  comments?: string;
}

export type DocumentData = InvoiceData | BillOfLadingData | InspectionData;

/** Uploaded stamp/signature (base64 data URLs), applied when a doc has placeSeal true. */
export interface Seal {
  stamp: string | null;
  signature: string | null;
}

/** Canonical CTL company identity — single source of truth. Mirrored into Setting 'company.profile'. */
export interface CompanyProfile {
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

export const CTL_PROFILE: CompanyProfile = {
  name: 'CTL Couriers Ltd',
  short: 'CTL',
  regLabel: 'Company No.',
  reg: 'NI648089',
  vat: 'GB 237239207',
  address: '6 Doagh Road, Ballyclare, Northern Ireland, BT39 9BG',
  phone: '',
  email: 'info@ctl-couriers-ltd.com',
  logo: '/img/docs/logo.png',
};
