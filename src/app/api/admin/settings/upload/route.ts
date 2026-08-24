import { NextResponse } from 'next/server';
import { setSetting } from '@/lib/settings';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 500 * 1024; // ~500KB
const IMAGE_DATA_URL = /^data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,([A-Za-z0-9+/]+=*)$/;

interface UploadBody {
  kind?: unknown;
  dataUrl?: unknown;
}

function keyFor(kind: string): string | null {
  return kind === 'stamp' || kind === 'signature' ? `doc.${kind}` : null;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UploadBody;
    const kind = typeof body.kind === 'string' ? body.kind : '';
    const key = keyFor(kind);
    if (!key) {
      return NextResponse.json({ error: "kind must be 'stamp' or 'signature'" }, { status: 400 });
    }

    const dataUrl = typeof body.dataUrl === 'string' ? body.dataUrl : '';
    const match = IMAGE_DATA_URL.exec(dataUrl);
    if (!match) {
      return NextResponse.json({ error: 'dataUrl must be a base64 image data URL' }, { status: 400 });
    }

    // Approximate decoded byte size from base64 length.
    const b64 = match[2];
    const bytes = Math.floor((b64.length * 3) / 4);
    if (bytes > MAX_BYTES) {
      return NextResponse.json({ error: 'Image exceeds 500KB limit' }, { status: 413 });
    }

    await setSetting(key, dataUrl);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to upload' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const kind = new URL(req.url).searchParams.get('kind') ?? '';
    const key = keyFor(kind);
    if (!key) {
      return NextResponse.json({ error: "kind must be 'stamp' or 'signature'" }, { status: 400 });
    }
    // Remove the row entirely so presence checks (value != null) correctly read as absent.
    await prisma.setting.deleteMany({ where: { key } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
