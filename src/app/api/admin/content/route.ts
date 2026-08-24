import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await prisma.siteContent.findMany();
    const map: Record<string, Prisma.JsonValue> = {};
    for (const row of rows) {
      map[row.key] = row.value;
    }
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({ error: 'Failed to load content' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as { key?: unknown; value?: unknown };
    if (typeof body.key !== 'string' || !body.key) {
      return NextResponse.json({ error: 'key required' }, { status: 400 });
    }
    const value = body.value as Prisma.InputJsonValue;
    const row = await prisma.siteContent.upsert({
      where: { key: body.key },
      create: { key: body.key, value },
      update: { value },
    });
    return NextResponse.json({ key: row.key, value: row.value });
  } catch {
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
