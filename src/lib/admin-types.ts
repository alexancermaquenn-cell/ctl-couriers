// Shared API shape types for the admin panel (coded against backend contracts).

export type ShipmentStatus =
  | 'PENDING'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'CUSTOMS'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION';

export const SHIPMENT_STATUSES: ShipmentStatus[] = [
  'PENDING',
  'PICKED_UP',
  'IN_TRANSIT',
  'CUSTOMS',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'EXCEPTION',
];

export type DocumentType = 'BILL_OF_LADING' | 'INVOICE' | 'INSPECTION';

export const DOCUMENT_TYPES: DocumentType[] = ['BILL_OF_LADING', 'INVOICE', 'INSPECTION'];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  BILL_OF_LADING: 'Bill of Lading',
  INVOICE: 'Invoice',
  INSPECTION: 'Inspection',
};

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location: string;
  note?: string | null;
  occurredAt: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  senderName: string;
  senderAddress?: string | null;
  receiverName: string;
  receiverAddress?: string | null;
  weightKg?: number | null;
  service?: string | null;
  estimatedDelivery?: string | null;
  createdAt: string;
  updatedAt: string;
  events?: TrackingEvent[];
  documents?: DocumentRecord[];
}

export type DocAssetKind = 'STAMP' | 'SIGNATURE';

export interface DocAsset {
  id: string;
  name: string;
  kind: DocAssetKind;
  dataUrl: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  type: DocumentType;
  number: string;
  design: string; // 'ORIGINAL' | 'A' | 'B'
  currency?: string; // 'EUR' | 'CHF' | 'USD' | 'GBP'
  clientId?: string | null;
  shipmentId?: string | null;
  createdAt: string;
  client?: { id?: string; fullName: string; company: string | null } | null;
  stampAsset?: { id: string; name: string } | null;
  signatureAsset?: { id: string; name: string } | null;
}

export interface Client {
  id: string;
  fullName: string;
  email: string;
  company?: string | null;
  vatNumber?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  paymentTerms?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { documents: number; shipments: number };
  documents?: DocumentRecord[];
  shipments?: Shipment[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bodyHtml: string;
  updatedAt: string;
}

export interface EmailLogEntry {
  id: string;
  to: string;
  subject: string;
  status: string;
  providerId?: string | null;
  error?: string | null;
  sentAt: string;
}

// Content editor: the map is loosely typed at the boundary; editors narrow per key.
export type ContentValue = string | number | boolean | ContentObject | ContentArray;
export interface ContentObject {
  [key: string]: ContentValue;
}
export type ContentArray = ContentObject[];
export type ContentMap = Record<string, ContentValue>;
