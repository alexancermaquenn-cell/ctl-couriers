import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { DocumentDesign } from '@/lib/doc-types';
import { CURRENCIES } from '@/lib/currency';

export const dynamic = 'force-dynamic';

const VALID_DESIGNS: DocumentDesign[] = ['ORIGINAL', 'A', 'B'];
const VALID_CURRENCIES = CURRENCIES.map((c) => c.code);

const SEAL_ASSET_SELECT = { id: true, name: true, kind: true, dataUrl: true } as const;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, fullName: true, company: true } },
        stampAsset: { select: SEAL_ASSET_SELECT },
        signatureAsset: { select: SEAL_ASSET_SELECT },
      },
    });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: 'Failed to load document' }, { status: 500 });
  }
}

interface UpdateBody {
  design?: unknown;
  currency?: unknown;
  dataJson?: unknown;
  clientId?: unknown;
  shipmentId?: unknown;
  stampAssetId?: unknown;
  signatureAssetId?: unknown;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as UpdateBody;
    const data: Prisma.DocumentUpdateInput = {};

    if (body.design !== undefined) {
      const design: DocumentDesign =
        typeof body.design === 'string' && VALID_DESIGNS.includes(body.design as DocumentDesign)
          ? (body.design as DocumentDesign)
          : 'A';
      data.design = design;
    }
    if (body.currency !== undefined) {
      data.currency =
        typeof body.currency === 'string' && VALID_CURRENCIES.includes(body.currency)
          ? body.currency
          : 'EUR';
    }
    if (body.stampAssetId !== undefined) {
      data.stampAsset =
        typeof body.stampAssetId === 'string'
          ? { connect: { id: body.stampAssetId } }
          : { disconnect: true };
    }
    if (body.signatureAssetId !== undefined) {
      data.signatureAsset =
        typeof body.signatureAssetId === 'string'
          ? { connect: { id: body.signatureAssetId } }
          : { disconnect: true };
    }
    if (body.dataJson !== undefined) {
      if (typeof body.dataJson !== 'object' || body.dataJson === null || Array.isArray(body.dataJson)) {
        return NextResponse.json({ error: 'dataJson must be an object' }, { status: 400 });
      }
      data.dataJson = body.dataJson as Prisma.InputJsonValue;
    }
    if (body.clientId !== undefined) {
      data.client =
        typeof body.clientId === 'string'
          ? { connect: { id: body.clientId } }
          : { disconnect: true };
    }
    if (body.shipmentId !== undefined) {
      data.shipment =
        typeof body.shipmentId === 'string'
          ? { connect: { id: body.shipmentId } }
          : { disconnect: true };
    }

    const doc = await prisma.document.update({
      where: { id: params.id },
      data,
      include: {
        client: { select: { id: true, fullName: true, company: true } },
        stampAsset: { select: SEAL_ASSET_SELECT },
        signatureAsset: { select: SEAL_ASSET_SELECT },
      },
    });
    return NextResponse.json(doc);
  } catch {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.document.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
