import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { documents: true, shipments: true } } },
    });
    return NextResponse.json(clients);
  } catch {
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 });
  }
}

interface CreateBody {
  fullName?: unknown;
  email?: unknown;
  company?: unknown;
  vatNumber?: unknown;
  phone?: unknown;
  address?: unknown;
  country?: unknown;
  paymentTerms?: unknown;
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;
    const fullName = str(body.fullName);
    const email = str(body.email);
    if (!fullName || !email) {
      return NextResponse.json({ error: 'fullName and email are required' }, { status: 400 });
    }

    const data: Prisma.ClientCreateInput = {
      fullName,
      email,
      company: str(body.company) ?? null,
      vatNumber: str(body.vatNumber) ?? null,
      phone: str(body.phone) ?? null,
      address: str(body.address) ?? null,
      country: str(body.country) ?? null,
      paymentTerms: str(body.paymentTerms) ?? null,
    };

    const client = await prisma.client.create({ data });
    return NextResponse.json(client, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
