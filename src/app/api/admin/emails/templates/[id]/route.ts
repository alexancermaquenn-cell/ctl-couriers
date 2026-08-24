import { NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as { name?: unknown; subject?: unknown; bodyHtml?: unknown };
    const data: Prisma.EmailTemplateUpdateInput = {};
    if (typeof body.name === 'string') data.name = body.name;
    if (typeof body.subject === 'string') data.subject = body.subject;
    if (typeof body.bodyHtml === 'string') data.bodyHtml = body.bodyHtml;

    const template = await prisma.emailTemplate.update({ where: { id: params.id }, data });
    return NextResponse.json(template);
  } catch {
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.emailTemplate.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}
