import { NextResponse } from 'next/server';
import type { Client, DocumentType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { DocumentDesign, Party } from '@/lib/doc-types';
import { CURRENCIES } from '@/lib/currency';

export const dynamic = 'force-dynamic';

const VALID_DESIGNS: DocumentDesign[] = ['ORIGINAL', 'A', 'B'];
const VALID_CURRENCIES = CURRENCIES.map((c) => c.code);

const SEAL_ASSET_SELECT = { id: true, name: true, kind: true, dataUrl: true } as const;

const PREFIX: Record<DocumentType, string> = {
  BILL_OF_LADING: 'BOL',
  INVOICE: 'INV',
  INSPECTION: 'INS',
};

const VALID_TYPES: DocumentType[] = ['BILL_OF_LADING', 'INVOICE', 'INSPECTION'];

export async function GET() {
  try {
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { fullName: true, company: true } },
        stampAsset: { select: SEAL_ASSET_SELECT },
        signatureAsset: { select: SEAL_ASSET_SELECT },
      },
    });
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}

interface CreateBody {
  type?: unknown;
  design?: unknown;
  currency?: unknown;
  clientId?: unknown;
  shipmentId?: unknown;
  stampAssetId?: unknown;
  signatureAssetId?: unknown;
  dataJson?: unknown;
}

// Build a Party from a client, keeping only present fields (company/vat/phone/address optional).
function partyFromClient(c: Client): Party {
  const p: Party = { name: c.fullName };
  if (c.company) p.company = c.company;
  if (c.address) p.address = c.address;
  if (c.email) p.email = c.email;
  if (c.phone) p.phone = c.phone;
  if (c.vatNumber) p.vat = c.vatNumber;
  return p;
}

/** Next per-type, per-year sequence: CTL-<PREFIX>-<YEAR>-#### */
async function nextNumber(type: DocumentType): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CTL-${PREFIX[type]}-${year}-`;
  const count = await prisma.document.count({
    where: { type, number: { startsWith: prefix } },
  });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;

    const type = body.type as DocumentType;
    if (typeof type !== 'string' || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'valid type required' }, { status: 400 });
    }

    const design: DocumentDesign =
      typeof body.design === 'string' && VALID_DESIGNS.includes(body.design as DocumentDesign)
        ? (body.design as DocumentDesign)
        : 'A';
    const currency =
      typeof body.currency === 'string' && VALID_CURRENCIES.includes(body.currency)
        ? body.currency
        : 'EUR';
    const clientId = typeof body.clientId === 'string' ? body.clientId : undefined;
    const shipmentId = typeof body.shipmentId === 'string' ? body.shipmentId : undefined;
    const stampAssetId = typeof body.stampAssetId === 'string' ? body.stampAssetId : undefined;
    const signatureAssetId =
      typeof body.signatureAssetId === 'string' ? body.signatureAssetId : undefined;

    const data: Record<string, unknown> =
      body.dataJson && typeof body.dataJson === 'object' && !Array.isArray(body.dataJson)
        ? { ...(body.dataJson as Record<string, unknown>) }
        : {};

    let client: Client | null = null;
    if (clientId) {
      client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      // Prefill billTo from the client only if the caller didn't supply one.
      if (data.billTo == null) {
        data.billTo = partyFromClient(client);
      }
    }

    if (shipmentId) {
      const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
      if (!shipment) {
        return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
      }
    }

    const number = await nextNumber(type);
    // Fill in the docNumber whenever the caller didn't supply one — treat
    // empty strings as "not supplied", so the invoice always shows a real
    // number instead of a blank on the PDF.
    if (data.docNumber == null || (typeof data.docNumber === 'string' && data.docNumber.trim() === '')) {
      data.docNumber = number;
    }

    const doc = await prisma.document.create({
      data: {
        type,
        number,
        design,
        currency,
        clientId: clientId ?? null,
        shipmentId: shipmentId ?? null,
        stampAssetId: stampAssetId ?? null,
        signatureAssetId: signatureAssetId ?? null,
        dataJson: data as Prisma.InputJsonValue,
      },
      include: {
        client: { select: { fullName: true, company: true } },
        stampAsset: { select: SEAL_ASSET_SELECT },
        signatureAsset: { select: SEAL_ASSET_SELECT },
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
