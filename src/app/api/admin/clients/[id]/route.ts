import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        shipments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!client) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: 'Failed to load client' }, { status: 500 });
  }
}

interface UpdateBody {
  fullName?: unknown;
  email?: unknown;
  company?: unknown;
  vatNumber?: unknown;
  phone?: unknown;
  address?: unknown;
  country?: unknown;
  paymentTerms?: unknown;
}

// Required fields keep their value if omitted; optional fields become null when blank.
function req(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined;
}
function opt(v: unknown): string | null | undefined {
  if (v === undefined) return undefined;
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : null;
}

export async function PUT(req_: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req_.json()) as UpdateBody;
    const data: Prisma.ClientUpdateInput = {};

    if (body.fullName !== undefined) {
      const fullName = req(body.fullName);
      if (!fullName) return NextResponse.json({ error: 'fullName cannot be empty' }, { status: 400 });
      data.fullName = fullName;
    }
    if (body.email !== undefined) {
      const email = req(body.email);
      if (!email) return NextResponse.json({ error: 'email cannot be empty' }, { status: 400 });
      data.email = email;
    }
    if (body.company !== undefined) data.company = opt(body.company);
    if (body.vatNumber !== undefined) data.vatNumber = opt(body.vatNumber);
    if (body.phone !== undefined) data.phone = opt(body.phone);
    if (body.address !== undefined) data.address = opt(body.address);
    if (body.country !== undefined) data.country = opt(body.country);
    if (body.paymentTerms !== undefined) data.paymentTerms = opt(body.paymentTerms);

    const client = await prisma.client.update({ where: { id: params.id }, data });
    return NextResponse.json(client);
  } catch {
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.client.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
