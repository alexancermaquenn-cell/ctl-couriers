import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { DocAsset, DocAssetKind, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const VALID_KINDS: DocAssetKind[] = ['STAMP', 'SIGNATURE'];

// data:image/<type>;base64,<payload> — allow common raster image types.
const IMAGE_DATA_URL = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/;

// ~600KB cap on the raw (post-decode) image size.
const MAX_BYTES = 600 * 1024;

function base64Bytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',');
  const payload = comma >= 0 ? dataUrl.slice(comma + 1) : '';
  // 4 base64 chars -> 3 bytes, minus padding.
  const padding = payload.endsWith('==') ? 2 : payload.endsWith('=') ? 1 : 0;
  return Math.floor((payload.length * 3) / 4) - padding;
}

/** Lazy-seed a default stamp + signature from public/img/docs so the library isn't empty. */
async function seedDefaults(): Promise<void> {
  const dir = path.join(process.cwd(), 'public', 'img', 'docs');
  const files: { file: string; name: string; kind: DocAssetKind }[] = [
    { file: 'stamp.png', name: 'CTL Company Stamp', kind: 'STAMP' },
    { file: 'signature.png', name: 'Default Signature', kind: 'SIGNATURE' },
  ];
  const rows: Prisma.DocAssetCreateManyInput[] = [];
  for (const f of files) {
    try {
      const buf = await fs.readFile(path.join(dir, f.file));
      rows.push({
        name: f.name,
        kind: f.kind,
        dataUrl: `data:image/png;base64,${buf.toString('base64')}`,
      });
    } catch {
      // Missing default asset file — skip it silently.
    }
  }
  if (rows.length) {
    await prisma.docAsset.createMany({ data: rows });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const kindParam = searchParams.get('kind');
    const kind: DocAssetKind | undefined =
      kindParam && VALID_KINDS.includes(kindParam as DocAssetKind)
        ? (kindParam as DocAssetKind)
        : undefined;

    // Lazy-seed once when the table is completely empty.
    if ((await prisma.docAsset.count()) === 0) {
      await seedDefaults();
    }

    const assets: DocAsset[] = await prisma.docAsset.findMany({
      where: kind ? { kind } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assets);
  } catch {
    return NextResponse.json({ error: 'Failed to load doc assets' }, { status: 500 });
  }
}

interface CreateBody {
  name?: unknown;
  kind?: unknown;
  dataUrl?: unknown;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateBody;

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const kind = body.kind;
    if (typeof kind !== 'string' || !VALID_KINDS.includes(kind as DocAssetKind)) {
      return NextResponse.json({ error: 'kind must be STAMP or SIGNATURE' }, { status: 400 });
    }

    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
    if (!IMAGE_DATA_URL.test(dataUrl)) {
      return NextResponse.json({ error: 'dataUrl must be an image data URL' }, { status: 400 });
    }
    if (base64Bytes(dataUrl) > MAX_BYTES) {
      return NextResponse.json({ error: 'image too large (max ~600KB)' }, { status: 400 });
    }

    const asset = await prisma.docAsset.create({
      data: { name, kind: kind as DocAssetKind, dataUrl },
    });
    return NextResponse.json(asset, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create doc asset' }, { status: 500 });
  }
}
