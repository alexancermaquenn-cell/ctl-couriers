import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { CTL_PROFILE } from '@/lib/doc-types';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: unknown;
      email?: unknown;
      service?: unknown;
      message?: unknown;
      company?: unknown;
    };

    const company = typeof body.company === 'string' ? body.company : '';
    // Honeypot: real users never fill this; bots do. Silently drop.
    if (company.trim() !== '') {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    const service = typeof body.service === 'string' ? body.service.trim() : '';
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || !email || !message || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid name, email and message.' }, { status: 400 });
    }

    const timestamp = new Date().toISOString();
    const html = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#111;max-width:560px">
  <h2 style="margin:0 0 4px;font-size:20px">New quote request</h2>
  <p style="margin:0 0 20px;color:#666;font-size:13px">Submitted via ctlcouriers.com contact form</p>
  <table style="width:100%;border-collapse:collapse;font-size:14px">
    <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;width:130px">Name</td><td style="padding:8px 12px;border:1px solid #eee">${esc(name)}</td></tr>
    <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold">Email</td><td style="padding:8px 12px;border:1px solid #eee"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold">Service</td><td style="padding:8px 12px;border:1px solid #eee">${esc(service) || '—'}</td></tr>
    <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold;vertical-align:top">Message</td><td style="padding:8px 12px;border:1px solid #eee;white-space:pre-wrap">${esc(message)}</td></tr>
    <tr><td style="padding:8px 12px;background:#f5f5f5;font-weight:bold">Received</td><td style="padding:8px 12px;border:1px solid #eee">${esc(timestamp)}</td></tr>
  </table>
  <p style="margin:20px 0 0;font-size:13px;color:#444">Reply directly to <a href="mailto:${esc(email)}">${esc(email)}</a> to respond to this lead.</p>
</div>`.trim();

    await sendEmail({
      to: CTL_PROFILE.email,
      subject: `New quote request — ${name}`,
      html,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to send inquiry' }, { status: 500 });
  }
}
