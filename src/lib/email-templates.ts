import { CTL_PROFILE } from '@/lib/doc-types';
import { LOGO_CID } from '@/lib/email';
import type { ShipmentStatus, TrackingEvent, Shipment } from '@prisma/client';

/**
 * Reusable transactional-email template layer for CTL Couriers.
 *
 * Design ported near-verbatim from the approved editorial suite: 600px table on
 * #F7F6F3 paper, white SQUARE card with a 3px accent top-rule (red / green /
 * amber by state), Georgia serif headlines with a red kicker label, Courier New
 * for tracking & document numbers, a carrier-grade 6-step timeline, and one
 * invariant statutory footer OUTSIDE the card.
 *
 * The brand logo rides along as an inline CID attachment (`cid:ctl-logo`, wired
 * in email.ts / sendEmail) because Gmail strips `data:` URIs and blocks remote
 * images — never inline a base64 or remote src for it.
 *
 * "Tracking update" is the only status-agnostic seed: its body carries a
 * `{{timeline}}` placeholder filled at send time by `varsForShipment`.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ctlcouriers.com';

const ACCENT = {
  red: '#C8102E',
  green: '#1E7F4F',
  amber: '#C77700',
} as const;

export type EmailAccent = keyof typeof ACCENT;

// ── shared font stacks / palette ────────────────────────────────────────────
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = 'Arial,Helvetica,sans-serif';
const MONO = "'Courier New',Courier,monospace";
const INK = '#111111';
const MUTED = '#9A958C';
const PAPER = '#F7F6F3';

// ── header lockup (logo left, "Cargo & Logistics" right) ─────────────────────
const headerLockup = (): string =>
  `<tr><td style="padding:0 2px 18px 2px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="left"><img src="cid:${LOGO_CID}" width="150" alt="CTL Couriers" style="display:block;border:0;max-width:150px;"></td>
      <td align="right" style="font-family:${SANS};font-size:10px;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">Cargo &amp; Logistics</td>
    </tr></table>
  </td></tr>`;

// ── invariant statutory footer (same across all 7, OUTSIDE the card) ─────────
const footerBlock = (): string => {
  const p = CTL_PROFILE;
  return `<tr><td style="padding:22px 8px 0 8px;" align="center">
    <p style="margin:0 0 6px 0;font-family:${SANS};font-size:11px;line-height:17px;color:${MUTED};">${p.name} &middot; ${p.regLabel} ${p.reg} &middot; VAT ${p.vat}</p>
    <p style="margin:0;font-family:${SANS};font-size:11px;line-height:17px;color:${MUTED};">${p.address} &middot; <a href="mailto:${p.email}" style="color:${MUTED};text-decoration:underline;">${p.email}</a> &middot; <a href="${APP_URL}" style="color:${MUTED};text-decoration:underline;">ctlcouriers.com</a></p>
  </td></tr>`;
};

// ── hidden preheader (inbox preview text) ────────────────────────────────────
const preheader = (text: string): string =>
  `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${PAPER};">${text}&zwnj;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>`;

interface LayoutArgs {
  /** Preheader / inbox preview line. */
  preview: string;
  /** The card inner rows (already table-<tr> markup) OR raw block html placed in one padded cell. */
  card: string;
  /** Accent used for the 3px top rule when no bannerHeader is supplied. */
  accent?: EmailAccent;
  /** When set, a full-bleed coloured banner replaces the top-rule (Out for delivery). */
  bannerHeader?: { kicker: string; title: string; bg: EmailAccent };
  /** Card horizontal padding (gallery uses 44px for text-only, 36px when a timeline is present). */
  pad?: number;
}

/**
 * Wrap card content in the CTL email shell: paper canvas, logo lockup on paper,
 * white square card with 3px accent top-rule (or a coloured banner header), and
 * the invariant footer. `card` is the inner HTML placed inside the padded card cell.
 */
export function emailLayout({ preview, card, accent = 'red', bannerHeader, pad = 44 }: LayoutArgs): string {
  const accentColor = ACCENT[accent];

  const cardOpen = bannerHeader
    ? `<tr><td style="background-color:${ACCENT[bannerHeader.bg]};padding:26px ${pad}px 24px ${pad}px;" bgcolor="${ACCENT[bannerHeader.bg]}">
        <p style="margin:0 0 6px 0;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:3px;color:#F3C6CF;text-transform:uppercase;">${bannerHeader.kicker}</p>
        <h1 style="margin:0;font-family:${SERIF};font-weight:normal;font-size:32px;line-height:38px;color:#FFFFFF;">${bannerHeader.title}</h1>
      </td></tr>
      <tr><td style="background-color:#FFFFFF;padding:32px ${pad}px 40px ${pad}px;" bgcolor="#FFFFFF">${card}</td></tr>`
    : `<tr><td style="background-color:#FFFFFF;border-top:3px solid ${accentColor};padding:38px ${pad}px 40px ${pad}px;" bgcolor="#FFFFFF">${card}</td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>CTL Couriers</title>
</head>
<body style="margin:0;padding:0;background-color:${PAPER};">
${preheader(preview)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAPER};" bgcolor="${PAPER}">
  <tr><td align="center" style="padding:36px 12px 44px 12px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;">
      ${headerLockup()}
      ${cardOpen}
      ${footerBlock()}
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── kicker + headline helpers ────────────────────────────────────────────────
const kicker = (text: string, accent: EmailAccent = 'red'): string =>
  `<p style="margin:0 0 12px 0;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2.5px;color:${ACCENT[accent]};text-transform:uppercase;">${text}</p>`;

const headline = (text: string): string =>
  `<h1 style="margin:0 0 18px 0;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:34px;color:${INK};">${text}</h1>`;

const lead = (html: string): string =>
  `<p style="margin:0 0 24px 0;font-family:${SANS};font-size:15px;line-height:24px;color:#444444;">${html}</p>`;

/** Inline Courier code span for tracking / document numbers in body copy. */
const code = (text: string): string =>
  `<span style="font-family:${MONO};font-weight:bold;color:${INK};">${text}</span>`;

/** Bulletproof table button. `ink` forces the dark button used for secondary/urgent contexts. */
const button = (label: string, url: string, accent: EmailAccent = 'red', ink = false): string => {
  const bg = ink ? INK : ACCENT[accent];
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:30px auto 0 auto;"><tr>
    <td align="center" style="background-color:${bg};border-radius:4px;" bgcolor="${bg}">
      <a href="${url}" style="display:inline-block;padding:14px 34px;font-family:${SANS};font-size:14px;font-weight:bold;letter-spacing:1px;color:#FFFFFF;text-decoration:none;text-transform:uppercase;">${label}</a>
    </td></tr></table>`;
};

const TIMELINE_STEPS = [
  'Registered',
  'Picked up',
  'In transit',
  'Customs',
  'Out for delivery',
  'Delivered',
] as const;

const TIMELINE_HALO = { red: '#F1CDD5', green: '#BFE3D0', amber: '#F0D9AE' } as const;
const DONE_INK = '#111111';
const FUTURE_TEXT = '#B4AFA4';
const FUTURE_LINE = '#E3E0D9';
const FUTURE_BORDER = '#D8D4CB';

/**
 * One 3px connector bar cell.
 * state 'accent' = coloured (progress), 'grey' = pending line, 'off' = transparent edge.
 */
const bar = (state: 'accent' | 'grey' | 'off', accentColor: string): string => {
  const bg = state === 'accent' ? accentColor : state === 'grey' ? FUTURE_LINE : '';
  return `<td valign="middle" style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:3px;line-height:3px;font-size:1px;${bg ? `background-color:${bg};` : ''}">&nbsp;</td></tr></table></td>`;
};

/**
 * Carrier-grade 6-step timeline, pure table/td (Outlook renders divs as squares).
 * Per cell k (0-based, stepIndex = current):
 *  - left bar accent if k <= stepIndex, right bar accent if k < stepIndex
 *  - dot = accent ✓ if k < stepIndex; accent number + 3px halo if k === stepIndex;
 *    white dot / grey outline / grey number otherwise
 *  - first cell's left bar and last cell's right bar stay transparent
 * `accent` colours the whole track — pass 'green' for the Delivered email.
 */
export function trackingTimeline(stepIndex: number, accent: EmailAccent = 'red'): string {
  const accentColor = ACCENT[accent];
  const halo = TIMELINE_HALO[accent];
  const last = TIMELINE_STEPS.length - 1;

  const cells = TIMELINE_STEPS.map((label, k) => {
    const isDone = k < stepIndex;
    const isCurrent = k === stepIndex;
    // left bar: accent if k <= stepIndex, else grey; transparent at first cell.
    const leftState: 'accent' | 'grey' | 'off' = k === 0 ? 'off' : k <= stepIndex ? 'accent' : 'grey';
    // right bar: accent if k < stepIndex, else grey; transparent at last cell.
    const rightState: 'accent' | 'grey' | 'off' = k === last ? 'off' : k < stepIndex ? 'accent' : 'grey';

    let dot: string;
    if (isDone) {
      dot = `<td width="26" align="center" style="padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" style="width:26px;height:26px;border-radius:13px;background-color:${accentColor};color:#FFFFFF;font-family:${SANS};font-size:12px;font-weight:bold;line-height:26px;">&#10003;</td></tr></table></td>`;
    } else if (isCurrent) {
      // At the terminal step (Delivered) the current dot is a ✓, otherwise the step number.
      const glyph = k === last ? '&#10003;' : `${k + 1}`;
      dot = `<td width="32" align="center" style="padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" style="width:26px;height:26px;border-radius:16px;border:3px solid ${halo};background-color:${accentColor};color:#FFFFFF;font-family:${SANS};font-size:12px;font-weight:bold;line-height:26px;">${glyph}</td></tr></table></td>`;
    } else {
      dot = `<td width="26" align="center" style="padding:0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" valign="middle" style="width:24px;height:24px;border-radius:13px;border:1px solid ${FUTURE_BORDER};background-color:#FFFFFF;color:${FUTURE_TEXT};font-family:${SANS};font-size:11px;font-weight:bold;line-height:24px;">${k + 1}</td></tr></table></td>`;
    }

    const labelColor = isDone ? DONE_INK : isCurrent ? accentColor : FUTURE_TEXT;

    return `<td width="16.6%" align="center" valign="top" style="padding:0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        ${bar(leftState, accentColor)}
        ${dot}
        ${bar(rightState, accentColor)}
      </tr></table>
      <p style="margin:9px 2px 0 2px;font-family:${SANS};font-size:9px;line-height:13px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:${labelColor};">${label}</p>
    </td>`;
  }).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 4px 0;"><tr>${cells}</tr></table>`;
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

/** Human-readable shipment status for body copy (never the raw Prisma enum). */
export function humanizeStatus(status: ShipmentStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'PICKED_UP':
      return 'Picked up';
    case 'IN_TRANSIT':
      return 'In transit';
    case 'CUSTOMS':
      return 'In customs';
    case 'OUT_FOR_DELIVERY':
      return 'Out for delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'EXCEPTION':
      return 'Delayed';
  }
}

// ── small block helpers reused by the seeds ─────────────────────────────────
const label = (text: string): string =>
  `<p style="margin:0 0 4px 0;font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">${text}</p>`;

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
    subject: "We've received your request — CTL Couriers",
    bodyHtml: emailLayout({
      preview: 'Thank you — a member of our team will respond within one business day.',
      card: `${kicker('Request received')}
        ${headline('Hello {{name}} — we have your request.')}
        ${lead('Your enquiry has landed safely with our operations desk in Ballyclare. A member of the CTL team will come back to you <strong style="color:#111111;">within 1 business day</strong> with a tailored quote.')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAPER};border:1px solid #E8E5DE;" bgcolor="${PAPER}">
          <tr><td style="padding:22px 26px 8px 26px;">
            ${label('Service requested')}
            <p style="margin:0 0 16px 0;font-family:${SERIF};font-size:18px;color:${INK};">{{service}}</p>
          </td></tr>
          <tr><td style="padding:0 26px 22px 26px;">
            ${label('Your message')}
            <p style="margin:0;font-family:${SERIF};font-style:italic;font-size:15px;line-height:23px;color:#555555;border-left:3px solid ${ACCENT.red};padding-left:14px;">&ldquo;{{message}}&rdquo;</p>
          </td></tr>
        </table>
        <p style="margin:26px 0 0 0;font-family:${SANS};font-size:14px;line-height:22px;color:#666666;">Need to add anything? Simply reply to this email — it reaches the same team.</p>`,
    }),
  },
  {
    name: 'Shipment created',
    subject: 'Your shipment is registered — {{trackingNumber}}',
    bodyHtml: emailLayout({
      preview: '{{origin}} → {{destination}}, estimated {{eta}}. Keep your tracking number.',
      card: `${kicker('Shipment registered')}
        ${headline('Your cargo is booked and on our board.')}
        <p style="margin:0 0 26px 0;font-family:${SANS};font-size:15px;line-height:24px;color:#444444;">Hello {{name}} — your shipment has been registered with CTL Couriers. Keep the tracking number below to follow every milestone of the journey.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${INK};" bgcolor="${INK}">
          <tr><td align="center" style="padding:22px 20px 20px 20px;">
            <p style="margin:0 0 6px 0;font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:3px;color:#B9B4AA;text-transform:uppercase;">Tracking number</p>
            <p style="margin:0;font-family:${MONO};font-size:24px;letter-spacing:3px;color:#FFFFFF;font-weight:bold;">{{trackingNumber}}</p>
          </td></tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E8E5DE;border-top:none;">
          <tr>
            <td width="40%" style="padding:20px 10px 18px 26px;">
              ${label('From')}
              <p style="margin:0;font-family:${SERIF};font-size:17px;color:${INK};">{{origin}}</p>
            </td>
            <td width="20%" align="center" style="padding:20px 0 18px 0;font-family:${SANS};font-size:18px;color:${ACCENT.red};">&#10142;</td>
            <td width="40%" style="padding:20px 26px 18px 10px;" align="right">
              ${label('To')}
              <p style="margin:0;font-family:${SERIF};font-size:17px;color:${INK};">{{destination}}</p>
            </td>
          </tr>
          <tr><td colspan="3" style="border-top:1px solid #E8E5DE;padding:16px 26px 18px 26px;">
            <p style="margin:0;font-family:${SANS};font-size:13px;color:#666666;"><span style="font-weight:bold;letter-spacing:2px;font-size:10px;color:${MUTED};text-transform:uppercase;">Estimated delivery&nbsp;&nbsp;</span> <span style="font-family:${SERIF};font-size:16px;color:${INK};">{{eta}}</span></p>
          </td></tr>
        </table>
        ${button('Track your shipment', TRACK_URL)}`,
    }),
  },
  {
    name: 'Tracking update',
    subject: 'Shipment {{trackingNumber}} — {{status}}',
    bodyHtml: emailLayout({
      pad: 36,
      preview: '{{status}} — last scanned at {{location}}. Follow the journey live.',
      card: `${kicker('Shipment update')}
        <h1 style="margin:0 0 8px 0;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:34px;color:${INK};">{{status}}</h1>
        <p style="margin:0 0 4px 0;font-family:${SANS};font-size:15px;line-height:24px;color:#444444;">Hello {{name}} — shipment ${code('{{trackingNumber}}')} is on the move.</p>
        <p style="margin:0 0 30px 0;font-family:${SANS};font-size:14px;line-height:22px;color:#666666;">Last scanned at <strong style="color:#111111;">{{location}}</strong>.</p>
        {{timeline}}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${PAPER};border:1px solid #E8E5DE;margin-top:30px;" bgcolor="${PAPER}">
          <tr>
            <td width="50%" style="padding:16px 10px 16px 24px;border-right:1px solid #E8E5DE;">
              ${label('Current status')}
              <p style="margin:0;font-family:${SERIF};font-size:16px;color:${ACCENT.red};">{{status}}</p>
            </td>
            <td width="50%" style="padding:16px 24px 16px 20px;">
              ${label('Location')}
              <p style="margin:0;font-family:${SERIF};font-size:16px;color:${INK};">{{location}}</p>
            </td>
          </tr>
        </table>
        ${button('Track your shipment', TRACK_URL)}`,
    }),
  },
  {
    name: 'Out for delivery',
    subject: 'Arriving today — shipment {{trackingNumber}} is out for delivery',
    bodyHtml: emailLayout({
      pad: 36,
      preview: 'On the van and arriving today. Please have someone available to sign.',
      bannerHeader: { kicker: 'Out for delivery', title: 'Arriving today.', bg: 'red' },
      card: `<p style="margin:0 0 30px 0;font-family:${SANS};font-size:15px;line-height:24px;color:#444444;">Hello {{name}} — shipment ${code('{{trackingNumber}}')} is on the delivery vehicle and will arrive today. Please make sure someone is available to receive and sign for the goods at <strong style="color:#111111;">{{destination}}</strong>.</p>
        ${trackingTimeline(4, 'red')}
        ${button('Follow the van live', TRACK_URL, 'red', true)}`,
    }),
  },
  {
    name: 'Delivered',
    subject: 'Delivered — shipment {{trackingNumber}}',
    bodyHtml: emailLayout({
      pad: 36,
      accent: 'green',
      preview: 'Signed for and complete. Thank you for shipping with CTL Couriers.',
      card: `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 20px auto;">
          <tr><td align="center" valign="middle" style="width:56px;height:56px;border-radius:28px;background-color:${ACCENT.green};color:#FFFFFF;font-family:${SANS};font-size:26px;font-weight:bold;line-height:56px;" bgcolor="${ACCENT.green}">&#10003;</td></tr>
        </table>
        <h1 style="margin:0 0 10px 0;font-family:${SERIF};font-weight:normal;font-size:30px;line-height:36px;color:${INK};text-align:center;">Delivered.</h1>
        <p style="margin:0 0 30px 0;font-family:${SANS};font-size:15px;line-height:24px;color:#444444;text-align:center;">Hello {{name}} — shipment ${code('{{trackingNumber}}')} was delivered and signed for at<br><strong style="color:${ACCENT.green};">{{destination}}</strong>.</p>
        ${trackingTimeline(5, 'green')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F4FAF6;border:1px solid #D3E8DC;margin-top:32px;" bgcolor="#F4FAF6">
          <tr><td align="center" style="padding:24px 30px 26px 30px;">
            <p style="margin:0 0 6px 0;font-family:${SERIF};font-size:18px;color:${INK};">How did we do?</p>
            <p style="margin:0 0 18px 0;font-family:${SANS};font-size:13px;line-height:20px;color:#666666;">Your feedback shapes how we move cargo. It takes less than a minute.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>
              <td align="center" style="background-color:${ACCENT.green};border-radius:4px;" bgcolor="${ACCENT.green}">
                <a href="mailto:${CTL_PROFILE.email}?subject=Feedback%20{{trackingNumber}}" style="display:inline-block;padding:12px 28px;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:1px;color:#FFFFFF;text-decoration:none;text-transform:uppercase;">Rate your delivery</a>
              </td></tr></table>
          </td></tr>
        </table>
        <p style="margin:26px 0 0 0;font-family:${SANS};font-size:13px;line-height:20px;color:#888888;text-align:center;">Thank you for shipping with CTL Couriers.</p>`,
    }),
  },
  {
    name: 'Document ready',
    subject: 'Your {{docType}} is ready — {{docNumber}}',
    bodyHtml: emailLayout({
      preview: 'The PDF is attached to this email for your records.',
      card: `${kicker('Documents')}
        ${headline('Your {{docType}} is ready.')}
        <p style="margin:0 0 26px 0;font-family:${SANS};font-size:15px;line-height:24px;color:#444444;">Hello {{name}} — the document below has been issued and is <strong style="color:#111111;">attached to this email as a PDF</strong>. Please keep it for your records; customs or accounting may request it.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E8E5DE;">
          <tr>
            <td width="72" align="center" valign="middle" style="background-color:${ACCENT.red};padding:24px 0;" bgcolor="${ACCENT.red}">
              <p style="margin:0;font-family:${SANS};font-size:13px;font-weight:bold;letter-spacing:2px;color:#FFFFFF;">PDF</p>
            </td>
            <td style="padding:18px 24px;">
              <p style="margin:0 0 3px 0;font-family:${SERIF};font-size:18px;color:${INK};">{{docType}}</p>
              <p style="margin:0;font-family:${MONO};font-size:13px;color:#666666;">{{docNumber}}.pdf &middot; attached</p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
          <tr>
            <td width="50%" style="border-top:1px solid #ECE9E3;padding:14px 8px 14px 2px;">
              ${label('Document number')}
              <p style="margin:0;font-family:${MONO};font-size:15px;font-weight:bold;color:${INK};">{{docNumber}}</p>
            </td>
            <td width="50%" style="border-top:1px solid #ECE9E3;padding:14px 2px 14px 8px;">
              ${label('Shipment reference')}
              <p style="margin:0;font-family:${MONO};font-size:15px;font-weight:bold;color:${INK};">{{trackingNumber}}</p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0 0;font-family:${SANS};font-size:13px;line-height:21px;color:#888888;">Questions about this document? Reply to this email or write to <a href="mailto:${CTL_PROFILE.email}" style="color:${ACCENT.red};text-decoration:underline;">${CTL_PROFILE.email}</a> quoting the document number.</p>`,
    }),
  },
  {
    name: 'Exception / delay',
    subject: 'Update on your shipment {{trackingNumber}} — action may be needed',
    bodyHtml: emailLayout({
      accent: 'amber',
      preview: 'A brief hold on your shipment. We are already on it — here is what happens next.',
      card: `${kicker('Shipment notice', 'amber')}
        ${headline('An update on your shipment.')}
        <p style="margin:0 0 24px 0;font-family:${SANS};font-size:15px;line-height:24px;color:#444444;">Hello {{name}} — shipment ${code('{{trackingNumber}}')} has been briefly held. We are already on it, and in some cases we may need a small action from you.</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#FBF6EC;border:1px solid #EBDDBE;" bgcolor="#FBF6EC">
          <tr><td style="padding:20px 26px;">
            <p style="margin:0 0 5px 0;font-family:${SANS};font-size:10px;font-weight:bold;letter-spacing:2px;color:#A5690A;text-transform:uppercase;">Reason for the hold</p>
            <p style="margin:0;font-family:${SERIF};font-size:16px;line-height:24px;color:${INK};">{{reason}}</p>
          </td></tr>
        </table>
        <p style="margin:28px 0 12px 0;font-family:${SANS};font-size:11px;font-weight:bold;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">What happens next</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="30" valign="top" style="padding:0 0 14px 0;"><p style="margin:0;font-family:${SERIF};font-size:16px;color:${ACCENT.amber};">1.</p></td>
            <td valign="top" style="padding:0 0 14px 0;"><p style="margin:0;font-family:${SANS};font-size:14px;line-height:22px;color:#444444;">Our operations team is liaising with the relevant parties today — most holds of this kind clear within 24&ndash;48 hours.</p></td>
          </tr>
          <tr>
            <td width="30" valign="top" style="padding:0 0 14px 0;"><p style="margin:0;font-family:${SERIF};font-size:16px;color:${ACCENT.amber};">2.</p></td>
            <td valign="top" style="padding:0 0 14px 0;"><p style="margin:0;font-family:${SANS};font-size:14px;line-height:22px;color:#444444;">If we need anything from you, we will contact you directly by email or phone — no action is required until then.</p></td>
          </tr>
          <tr>
            <td width="30" valign="top" style="padding:0;"><p style="margin:0;font-family:${SERIF};font-size:16px;color:${ACCENT.amber};">3.</p></td>
            <td valign="top" style="padding:0;"><p style="margin:0;font-family:${SANS};font-size:14px;line-height:22px;color:#444444;">Your estimated delivery date will be revised on the tracking page as soon as the shipment is released.</p></td>
          </tr>
        </table>
        ${button('View live status', TRACK_URL, 'amber', true)}
        <p style="margin:24px 0 0 0;font-family:${SANS};font-size:13px;line-height:21px;color:#888888;text-align:center;">We apologise for the delay — thank you for your patience.</p>`,
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
 * "Tracking update" template's {{timeline}} placeholder always resolves — and it
 * turns green once delivered.
 */
export function varsForShipment(shipment: ShipmentWithEvents): Record<string, string> {
  const stepIndex = statusToStepIndex(shipment.status);
  const latest = shipment.events && shipment.events.length > 0 ? shipment.events[0] : null;
  const timelineAccent: EmailAccent = shipment.status === 'DELIVERED' ? 'green' : 'red';
  return {
    name: shipment.receiverName,
    trackingNumber: shipment.trackingNumber,
    origin: shipment.origin,
    destination: shipment.destination,
    eta: formatEta(shipment.estimatedDelivery),
    trackingUrl: `${APP_URL}/tracking?n=${shipment.trackingNumber}`,
    status: humanizeStatus(shipment.status),
    location: latest?.location ?? shipment.destination,
    stepIndex: String(stepIndex),
    timeline: trackingTimeline(stepIndex, timelineAccent),
  };
}
