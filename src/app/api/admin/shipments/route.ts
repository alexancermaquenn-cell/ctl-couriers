import { NextResponse } from 'next/server';
import type { ShipmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function genTracking(): string {
  const four = () => String(Math.floor(1000 + Math.random() * 9000));
  return `CTL-${four()}-${four()}`;
}

async function uniqueTracking(): Promise<string> {
  for (let i = 0; i < 8; i++) {
    const candidate = genTracking();
    const existing = await prisma.shipment.findUnique({ where: { trackingNumber: candidate } });
    if (!existing) return candidate;
  }
  // Extremely unlikely fallback: append timestamp entropy.
  return `${genTracking()}-${Date.now().toString().slice(-4)}`;
}

export async function GET() {
  try {
    const shipments = await prisma.shipment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { events: true } },
        events: { orderBy: { occurredAt: 'desc' }, take: 1 },
      },
    });
    return NextResponse.json(shipments);
  } catch {
    return NextResponse.json({ error: 'Failed to load shipments' }, { status: 500 });
  }
}

interface CreateBody {
  trackingNumber?: unknown;
  origin?: unknown;
  destination?: unknown;
  senderName?: unknown;
  senderAddress?: unknown;
  receiverName?: unknown;
  receiverAddress?: unknown;
  weightKg?: unknown;
  service?: unknown;
  estimatedDelivery?: unknown;
  status?: unknown;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;

    const origin = str(body.origin);
    const destination = str(body.destination);
    const senderName = str(body.senderName);
    const receiverName = str(body.receiverName);

    if (!origin || !destination || !senderName || !receiverName) {
      return NextResponse.json(
        { error: 'origin, destination, senderName, receiverName required' },
        { status: 400 },
      );
    }

    const trackingNumber = str(body.trackingNumber) ?? (await uniqueTracking());
    const status = (str(body.status) as ShipmentStatus | undefined) ?? 'PENDING';

    const weightKg =
      typeof body.weightKg === 'number'
        ? body.weightKg
        : typeof body.weightKg === 'string' && body.weightKg !== ''
          ? Number(body.weightKg)
          : undefined;

    const estimatedDelivery = str(body.estimatedDelivery)
      ? new Date(body.estimatedDelivery as string)
      : undefined;

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        status,
        origin,
        destination,
        senderName,
        senderAddress: str(body.senderAddress),
        receiverName,
        receiverAddress: str(body.receiverAddress),
        weightKg: weightKg !== undefined && !Number.isNaN(weightKg) ? weightKg : undefined,
        service: str(body.service),
        estimatedDelivery,
        events: {
          create: {
            status: 'PENDING',
            location: origin,
            note: 'Shipment registered',
          },
        },
      },
      include: { events: true },
    });

    return NextResponse.json(shipment, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create shipment' }, { status: 500 });
  }
}
