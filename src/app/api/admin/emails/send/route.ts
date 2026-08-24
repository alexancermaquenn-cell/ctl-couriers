import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { to?: unknown; subject?: unknown; html?: unknown };
    const to = typeof body.to === 'string' ? body.to : '';
    const subject = typeof body.subject === 'string' ? body.subject : '';
    const html = typeof body.html === 'string' ? body.html : '';

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'to, subject, html required' }, { status: 400 });
    }

    const log = await sendEmail({ to, subject, html });
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
