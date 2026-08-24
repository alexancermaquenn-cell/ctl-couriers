import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { num: string } }) {
  const shipment = await prisma.shipment.findUnique({
    where: { trackingNumber: params.num },
    include: { events: { orderBy: { occurredAt: 'asc' } } },
  });
  if (!shipment) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(shipment);
}
