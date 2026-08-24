import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const asset = await prisma.docAsset.findUnique({ where: { id: params.id } });
    if (!asset) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(asset);
  } catch {
    return NextResponse.json({ error: 'Failed to load doc asset' }, { status: 500 });
  }
}

interface UpdateBody {
  name?: unknown;
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as UpdateBody;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }
    const asset = await prisma.docAsset.update({
      where: { id: params.id },
      data: { name },
    });
    return NextResponse.json(asset);
  } catch {
    return NextResponse.json({ error: 'Failed to update doc asset' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.docAsset.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete doc asset' }, { status: 500 });
  }
}
