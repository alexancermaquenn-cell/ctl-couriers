import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, renderTemplate } from '@/lib/email';
import { varsForShipment } from '@/lib/email-templates';
import { renderDocumentPdf } from '@/lib/doc-pdf';

export const dynamic = 'force-dynamic';

/**
 * Two payload shapes are accepted:
 *  - Legacy free-form:  { to, subject, html }
 *  - Smart template:    { to, templateId, shipmentId?, extraVars?, attachDocumentId? }
 *
 * With ?preview=1 the endpoint renders the smart payload and returns
 * { subject, html } WITHOUT sending — used by the composer's live preview.
 */

interface Body {
  to?: unknown;
  subject?: unknown;
  html?: unknown;
  templateId?: unknown;
  shipmentId?: unknown;
  attachDocumentId?: unknown;
  extraVars?: unknown;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toStringRecord(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === 'string') out[k] = val;
    else if (typeof val === 'number' || typeof val === 'boolean') out[k] = String(val);
  }
  return out;
}

/** Build rendered { subject, html } from the smart payload. `docVars` are merged last. */
async function renderSmart(
  body: Body,
  docVars: Record<string, string> = {},
): Promise<{ subject: string; html: string } | { error: string }> {
  const templateId = str(body.templateId);
  const template = await prisma.emailTemplate.findUnique({ where: { id: templateId } });
  if (!template) return { error: 'Template not found' };

  let vars: Record<string, string> = {};
  const shipmentId = str(body.shipmentId);
  if (shipmentId) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { events: { orderBy: { occurredAt: 'desc' }, take: 1 } },
    });
    if (!shipment) return { error: 'Shipment not found' };
    vars = varsForShipment(shipment);
  }

  // extraVars override shipment-derived vars; doc vars (from an attachment) win last.
  vars = { ...vars, ...toStringRecord(body.extraVars), ...docVars };

  return {
    subject: renderTemplate(template.subject, vars),
    html: renderTemplate(template.bodyHtml, vars),
  };
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const preview = url.searchParams.get('preview') === '1';
    const body = (await req.json()) as Body;

    const to = str(body.to);
    const templateId = str(body.templateId);

    // ---- Smart template path ----
    if (templateId) {
      if (preview) {
        const rendered = await renderSmart(body);
        if ('error' in rendered) {
          return NextResponse.json({ error: rendered.error }, { status: 404 });
        }
        return NextResponse.json(rendered, { status: 200 });
      }

      if (!EMAIL_RE.test(to)) {
        return NextResponse.json({ error: 'valid recipient email required' }, { status: 400 });
      }

      // Resolve the PDF first so its {{docNumber}}/{{docType}} feed into the render.
      const attachDocumentId = str(body.attachDocumentId);
      const attachments: { filename: string; content: Buffer }[] = [];
      let docVars: Record<string, string> = {};
      if (attachDocumentId) {
        const pdf = await renderDocumentPdf(attachDocumentId);
        if (!pdf) {
          return NextResponse.json({ error: 'Attachment document not found' }, { status: 404 });
        }
        attachments.push({ filename: `${pdf.number}.pdf`, content: pdf.buffer });
        docVars = { docNumber: pdf.number, docType: pdf.typeLabel };
      }

      const rendered = await renderSmart(body, docVars);
      if ('error' in rendered) {
        return NextResponse.json({ error: rendered.error }, { status: 404 });
      }

      // The logo CID inline attachment is added inside sendEmail for every send.
      const log = await sendEmail({
        to,
        subject: rendered.subject,
        html: rendered.html,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      return NextResponse.json(log, { status: 201 });
    }

    // ---- Legacy free-form path ----
    const subject = str(body.subject);
    const html = str(body.html);
    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'to, subject, html required' }, { status: 400 });
    }
    if (!EMAIL_RE.test(to)) {
      return NextResponse.json({ error: 'valid recipient email required' }, { status: 400 });
    }

    const log = await sendEmail({ to, subject, html });
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
