import { NextResponse } from 'next/server';
import type { Prisma, ShipmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
      include: { events: { orderBy: { occurredAt: 'asc' } }, documents: true },
    });
    if (!shipment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(shipment);
  } catch {
    return NextResponse.json({ error: 'Failed to load shipment' }, { status: 500 });
  }
}

interface UpdateBody {
  status?: unknown;
  origin?: unknown;
  destination?: unknown;
  senderName?: unknown;
  senderAddress?: unknown;
  receiverName?: unknown;
  receiverAddress?: unknown;
  weightKg?: unknown;
  service?: unknown;
  estimatedDelivery?: unknown;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as UpdateBody;
    const data: Prisma.ShipmentUpdateInput = {};

    if (str(body.status) !== undefined) data.status = str(body.status) as ShipmentStatus;
    if (str(body.origin) !== undefined) data.origin = str(body.origin);
    if (str(body.destination) !== undefined) data.destination = str(body.destination);
    if (str(body.senderName) !== undefined) data.senderName = str(body.senderName);
    if (body.senderAddress !== undefined) data.senderAddress = str(body.senderAddress) ?? null;
    if (str(body.receiverName) !== undefined) data.receiverName = str(body.receiverName);
    if (body.receiverAddress !== undefined) data.receiverAddress = str(body.receiverAddress) ?? null;
    if (str(body.service) !== undefined) data.service = str(body.service) ?? null;

    if (body.weightKg !== undefined) {
      const n =
        typeof body.weightKg === 'number'
          ? body.weightKg
          : typeof body.weightKg === 'string' && body.weightKg !== ''
            ? Number(body.weightKg)
            : NaN;
      data.weightKg = Number.isNaN(n) ? null : n;
    }

    if (body.estimatedDelivery !== undefined) {
      const s = str(body.estimatedDelivery);
      data.estimatedDelivery = s ? new Date(s) : null;
    }

    const shipment = await prisma.shipment.update({
      where: { id: params.id },
      data,
      include: { events: { orderBy: { occurredAt: 'asc' } } },
    });
    return NextResponse.json(shipment);
  } catch {
    return NextResponse.json({ error: 'Failed to update shipment' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.shipment.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete shipment' }, { status: 500 });
  }
}
