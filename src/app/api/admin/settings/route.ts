import { NextResponse } from 'next/server';
import { getSetting, setSetting, ensureCompanyProfile } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await ensureCompanyProfile();
    const [stamp, signature] = await Promise.all([
      getSetting('doc.stamp'),
      getSetting('doc.signature'),
    ]);
    return NextResponse.json({
      // Presence booleans only — the data URLs themselves can be large.
      'doc.stamp': stamp != null,
      'doc.signature': signature != null,
      'company.profile': profile,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

interface UpdateBody {
  key?: unknown;
  value?: unknown;
}

export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as UpdateBody;
    const key = typeof body.key === 'string' ? body.key : undefined;
    if (!key) {
      return NextResponse.json({ error: 'key required' }, { status: 400 });
    }
    const value =
      typeof body.value === 'string' ? body.value : JSON.stringify(body.value ?? null);
    await setSetting(key, value);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
