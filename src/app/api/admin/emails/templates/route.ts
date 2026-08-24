import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: 'Failed to load templates' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: unknown; subject?: unknown; bodyHtml?: unknown };
    const name = typeof body.name === 'string' ? body.name : '';
    const subject = typeof body.subject === 'string' ? body.subject : '';
    const bodyHtml = typeof body.bodyHtml === 'string' ? body.bodyHtml : '';

    if (!name || !subject || !bodyHtml) {
      return NextResponse.json({ error: 'name, subject, bodyHtml required' }, { status: 400 });
    }

    const template = await prisma.emailTemplate.create({ data: { name, subject, bodyHtml } });
    return NextResponse.json(template, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}
