import { CTL_PROFILE } from '@/lib/doc-types';
import type { ShipmentStatus, TrackingEvent, Shipment } from '@prisma/client';

/**
 * Reusable transactional-email template layer for CTL Couriers.
 *
 * - `emailLayout` wraps body content in a premium, email-safe 600px table shell.
 * - `trackingTimeline` renders a 6-step progress bar (table-based, inline styles).
 * - `TEMPLATE_SEEDS` are the 7 templates seeded into the EmailTemplate table.
 * - `varsForShipment` derives every merge var from a Shipment for the sender.
 *
 * Design note on the "Tracking update" template: because a static seed cannot
 * know a shipment's step at seed time, its body contains a `{{timeline}}`
 * placeholder. The sender fills it at send time with `trackingTimeline(stepIndex)`
 * via `varsForShipment` (which sets `vars.timeline`). All other status-specific
 * templates bake their own timeline step directly into the seed HTML.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ctlcouriers.com';
const LOGO_URL = 'https://ctlcouriers.com/img/docs/logo.png';

const ACCENT = {
  red: '#C8102E',
  green: '#1a7f37',
  amber: '#b45309',
} as const;

export type EmailAccent = keyof typeof ACCENT;

interface LayoutArgs {
  heading: string;
  bodyHtml: string;
  accent?: EmailAccent;
}

/** Wrap body content in the premium CTL email shell. Inline styles only. */
export function emailLayout({ heading, bodyHtml, accent = 'red' }: LayoutArgs): string {
  const accentColor = ACCENT[accent];
  const p = CTL_PROFILE;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#F7F6F3;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F7F6F3;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #ececec;">
        <tr>
          <td style="padding:24px 32px;border-bottom:3px solid ${accentColor};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <img src="${LOGO_URL}" alt="CTL Couriers" width="40" height="40" style="display:inline-block;vertical-align:middle;border:0;">
                  <span style="display:inline-block;vertical-align:middle;margin-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:700;color:#1a1a1a;letter-spacing:0.5px;">CTL Couriers</span>
                </td>
                <td align="right" style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#999999;">
                  ${p.regLabel} ${p.reg}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 20px 0;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:700;color:#1a1a1a;">${heading}</h1>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#333333;">
              ${bodyHtml}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;background-color:#F7F6F3;border-top:1px solid #ececec;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#888888;">
            <strong style="color:#555555;">${p.name}</strong><br>
            ${p.regLabel} ${p.reg} &nbsp;·&nbsp; VAT ${p.vat}<br>
            ${p.address}<br>
            <a href="mailto:${p.email}" style="color:${accentColor};text-decoration:none;">${p.email}</a> &nbsp;·&nbsp;
            <a href="${APP_URL}" style="color:${accentColor};text-decoration:none;">ctlcouriers.com</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

const TIMELINE_STEPS = [
  'Registered',
  'Picked up',
  'In transit',
  'Customs',
  'Out for delivery',
  'Delivered',
] as const;

/**
 * 6-step tracking progress, table-based. Steps <= stepIndex are filled red,
 * the current step (== stepIndex) is bold, future steps are greyed.
 */
export function trackingTimeline(stepIndex: number): string {
  const cells = TIMELINE_STEPS.map((label, i) => {
    const done = i <= stepIndex;
    const current = i === stepIndex;
    const dotColor = done ? ACCENT.red : '#d4d4d4';
    const textColor = current ? '#1a1a1a' : done ? '#555555' : '#aaaaaa';
    const weight = current ? '700' : '400';
    return `<td align="center" style="width:16.66%;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.3;color:${textColor};font-weight:${weight};vertical-align:top;padding:0 2px;">
      <div style="width:14px;height:14px;border-radius:50%;background-color:${dotColor};margin:0 auto 8px auto;"></div>
      ${label}
    </td>`;
  }).join('');

  // Connector bar: filled portion up to stepIndex.
  const pct = Math.max(0, Math.min(100, (stepIndex / (TIMELINE_STEPS.length - 1)) * 100));
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;">
  <tr>
    <td style="padding:0 8px 12px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ececec;border-radius:3px;">
        <tr><td style="height:4px;line-height:4px;font-size:0;background-color:${ACCENT.red};border-radius:3px;width:${pct}%;">&nbsp;</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>
    </td>
  </tr>
</table>`;
}

/** Map a shipment status to its timeline step index. */
export function statusToStepIndex(status: ShipmentStatus): number {
  switch (status) {
    case 'PENDING':
      return 0;
    case 'PICKED_UP':
      return 1;
    case 'IN_TRANSIT':
      return 2;
    case 'CUSTOMS':
      return 3;
    case 'OUT_FOR_DELIVERY':
      return 4;
    case 'DELIVERED':
      return 5;
    case 'EXCEPTION':
      // Keep the last known progress; exception is not a linear step.
      return 2;
  }
}

const btn = (label: string, url: string, accent: EmailAccent = 'red'): string =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px 0;"><tr>
    <td style="border-radius:6px;background-color:${ACCENT[accent]};">
      <a href="${url}" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">${label}</a>
    </td>
  </tr></table>`;

const detailRow = (label: string, value: string): string =>
  `<tr>
    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#888888;width:140px;">${label}</td>
    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;font-weight:600;">${value}</td>
  </tr>`;

const detailsTable = (rows: string): string =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px 0;border-top:1px solid #ececec;border-bottom:1px solid #ececec;">${rows}</table>`;

const TRACK_URL = `${APP_URL}/tracking?n={{trackingNumber}}`;

export interface TemplateSeed {
  name: string;
  subject: string;
  bodyHtml: string;
}

/** The 7 transactional email templates seeded into EmailTemplate. */
export const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    name: 'Quote received',
    subject: 'Your CTL Couriers quote request — we are on it',
    bodyHtml: emailLayout({
      heading: 'Thank you for your quote request',
      bodyHtml: `<p>Hi {{name}},</p>
        <p>We have received your request to ship from <strong>{{origin}}</strong> to <strong>{{destination}}</strong>. Our logistics team is preparing a tailored quote and will be in touch shortly — usually within one business day.</p>
        <p>If anything changes in the meantime, simply reply to this email and we will help.</p>
        <p>Warm regards,<br>The CTL Couriers team</p>`,
    }),
  },
  {
    name: 'Shipment created',
    subject: 'Shipment {{trackingNumber}} is booked with CTL Couriers',
    bodyHtml: emailLayout({
      heading: 'Your shipment is confirmed',
      bodyHtml: `<p>Hi {{name}},</p>
        <p>Great news — your shipment has been booked and registered in our system. You can follow every step of its journey using the tracking number below.</p>
        ${detailsTable(
          detailRow('Tracking number', '{{trackingNumber}}') +
            detailRow('From', '{{origin}}') +
            detailRow('To', '{{destination}}') +
            detailRow('Estimated delivery', '{{eta}}'),
        )}
        ${trackingTimeline(0)}
        ${btn('Track your shipment', TRACK_URL)}
        <p>Thank you for choosing CTL Couriers.</p>`,
    }),
  },
  {
    name: 'Tracking update',
    subject: 'Update on your shipment {{trackingNumber}}',
    bodyHtml: emailLayout({
      heading: 'Your shipment status has changed',
      bodyHtml: `<p>Hi {{name}},</p>
        <p>Here is the latest on your shipment. It is currently <strong>{{status}}</strong> near {{location}}.</p>
        {{timeline}}
        ${detailsTable(
          detailRow('Tracking number', '{{trackingNumber}}') +
            detailRow('Status', '{{status}}') +
            detailRow('Current location', '{{location}}') +
            detailRow('Estimated delivery', '{{eta}}'),
        )}
        ${btn('Track your shipment', TRACK_URL)}
        <p>We will keep you posted as it progresses.</p>`,
    }),
  },
  {
    name: 'Out for delivery',
    subject: 'Out for delivery — shipment {{trackingNumber}}',
    bodyHtml: emailLayout({
      heading: 'Your shipment is out for delivery',
      accent: 'amber',
      bodyHtml: `<p>Hi {{name}},</p>
        <p>Good news — your shipment is on the final leg of its journey and is out for delivery today. Please ensure someone is available to receive it at <strong>{{destination}}</strong>.</p>
        ${trackingTimeline(4)}
        ${detailsTable(
          detailRow('Tracking number', '{{trackingNumber}}') +
            detailRow('Destination', '{{destination}}') +
            detailRow('Estimated delivery', '{{eta}}'),
        )}
        ${btn('Track your shipment', TRACK_URL, 'amber')}`,
    }),
  },
  {
    name: 'Delivered',
    subject: 'Delivered — shipment {{trackingNumber}}',
    bodyHtml: emailLayout({
      heading: 'Your shipment has been delivered',
      accent: 'green',
      bodyHtml: `<p>Hi {{name}},</p>
        <p>Your shipment has been successfully delivered to <strong>{{destination}}</strong>. We hope everything arrived in perfect condition.</p>
        ${trackingTimeline(5)}
        ${detailsTable(
          detailRow('Tracking number', '{{trackingNumber}}') +
            detailRow('Delivered to', '{{destination}}'),
        )}
        <p>Thank you for trusting CTL Couriers with your logistics. We would love to serve you again.</p>
        ${btn('View delivery details', TRACK_URL, 'green')}`,
    }),
  },
  {
    name: 'Document ready',
    subject: 'Your document for shipment {{trackingNumber}} is ready',
    bodyHtml: emailLayout({
      heading: 'A document is ready for your shipment',
      bodyHtml: `<p>Hi {{name}},</p>
        <p>Please find attached the requested document for your shipment <strong>{{trackingNumber}}</strong>. If you have any questions about its contents, just reply to this email.</p>
        ${detailsTable(
          detailRow('Tracking number', '{{trackingNumber}}') +
            detailRow('Route', '{{origin}} → {{destination}}'),
        )}
        <p>The document is attached as a PDF.</p>
        <p>Kind regards,<br>The CTL Couriers team</p>`,
    }),
  },
  {
    name: 'Exception / delay',
    subject: 'Action may be needed — shipment {{trackingNumber}}',
    bodyHtml: emailLayout({
      heading: 'There is an update that needs your attention',
      accent: 'amber',
      bodyHtml: `<p>Hi {{name}},</p>
        <p>We want to keep you fully informed: your shipment <strong>{{trackingNumber}}</strong> has hit a delay near {{location}}. Our team is already working to resolve it and get things moving again.</p>
        ${detailsTable(
          detailRow('Tracking number', '{{trackingNumber}}') +
            detailRow('Current status', '{{status}}') +
            detailRow('Last known location', '{{location}}'),
        )}
        ${btn('Track your shipment', TRACK_URL, 'amber')}
        <p>We apologise for any inconvenience and will update you as soon as there is news.</p>`,
    }),
  },
];

/** A shipment with its most recent tracking event(s) loaded. */
export type ShipmentWithEvents = Shipment & { events?: TrackingEvent[] };

function formatEta(date: Date | null): string {
  if (!date) return 'To be confirmed';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Derive every merge var from a shipment. `events` (if present) supplies the
 * latest location; the timeline is baked from the shipment status so the generic
 * "Tracking update" template's {{timeline}} placeholder resolves correctly.
 */
export function varsForShipment(shipment: ShipmentWithEvents): Record<string, string> {
  const stepIndex = statusToStepIndex(shipment.status);
  const latest = shipment.events && shipment.events.length > 0 ? shipment.events[0] : null;
  return {
    name: shipment.receiverName,
    trackingNumber: shipment.trackingNumber,
    origin: shipment.origin,
    destination: shipment.destination,
    eta: formatEta(shipment.estimatedDelivery),
    trackingUrl: `${APP_URL}/tracking?n=${shipment.trackingNumber}`,
    status: shipment.status,
    location: latest?.location ?? shipment.destination,
    stepIndex: String(stepIndex),
    timeline: trackingTimeline(stepIndex),
  };
}
