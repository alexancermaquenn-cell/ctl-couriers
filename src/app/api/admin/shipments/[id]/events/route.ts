import { NextResponse } from 'next/server';
import type { ShipmentStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { sendEmail, renderTemplate } from '@/lib/email';

export const dynamic = 'force-dynamic';

interface EventBody {
  status?: unknown;
  location?: unknown;
  note?: unknown;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = (await req.json()) as EventBody;
    const status = typeof body.status === 'string' ? body.status : '';
    const location = typeof body.location === 'string' ? body.location : '';
    const note = typeof body.note === 'string' ? body.note : undefined;

    if (!status || !location) {
      return NextResponse.json({ error: 'status and location required' }, { status: 400 });
    }

    const shipmentStatus = status as ShipmentStatus;

    const [event, shipment] = await prisma.$transaction([
      prisma.trackingEvent.create({
        data: { shipmentId: params.id, status: shipmentStatus, location, note },
      }),
      prisma.shipment.update({
        where: { id: params.id },
        data: { status: shipmentStatus },
      }),
    ]);

    // Best-effort notification. Never fail the request on email issues.
    if (process.env.RESEND_API_KEY) {
      try {
        const template = await prisma.emailTemplate.findUnique({
          where: { name: 'Shipment Update' },
        });
        if (template) {
          const vars: Record<string, string> = {
            trackingNumber: shipment.trackingNumber,
            status: shipmentStatus,
            location,
            note: note ?? '',
            receiverName: shipment.receiverName,
            origin: shipment.origin,
            destination: shipment.destination,
          };
          const html = renderTemplate(template.bodyHtml, vars);
          const subject = renderTemplate(template.subject, vars);
          // No recipient email column on Shipment; notify the configured admin.
          const to = process.env.ADMIN_NOTIFY_EMAIL || process.env.ADMIN_USERNAME || 'admin@ctl.local';
          await sendEmail({ to, subject, html });
        }
      } catch {
        // swallow — notification is non-critical
      }
    }

    return NextResponse.json({ event, shipment }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
