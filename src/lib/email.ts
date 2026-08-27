import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { prisma } from '@/lib/prisma';
import type { EmailLog } from '@prisma/client';

const FROM = 'CTL Couriers <info@ctlcouriers.com>';

/** Content id the templates reference as `cid:ctl-logo`. */
export const LOGO_CID = 'ctl-logo';

interface EmailAttachment {
  filename: string;
  content: Buffer;
  /** When set, Resend sends this as an inline attachment referenceable via `cid:<contentId>`. */
  contentId?: string;
}

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

/**
 * Inline logo attachment so `<img src="cid:ctl-logo">` resolves in Gmail/Outlook.
 * Gmail strips `data:` URIs and blocks remote images by default, so the brand
 * lockup must ride along as a CID inline attachment on every send.
 * Read lazily & cached; returns null if the file is somehow missing so a send
 * never fails purely because of the logo.
 */
let logoBufferCache: Buffer | null | undefined;
export function logoAttachment(): EmailAttachment | null {
  if (logoBufferCache === undefined) {
    try {
      logoBufferCache = readFileSync(join(process.cwd(), 'public', 'img', 'docs', 'logo.png'));
    } catch {
      logoBufferCache = null;
    }
  }
  if (!logoBufferCache) return null;
  return { filename: 'logo.png', content: logoBufferCache, contentId: LOGO_CID };
}

/** Strip tags to a plain-text body for the multipart `text/plain` part (deliverability). */
export function htmlToText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(style|script|head|title)[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;|&zwnj;/g, ' ')
    .replace(/&middot;/g, '·')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#10003;/g, '')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&ndash;/g, '-')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .trim();
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailArgs): Promise<EmailLog> {
  const apiKey = process.env.RESEND_API_KEY;

  // Always carry the inline logo so `cid:ctl-logo` resolves in the rendered HTML.
  const logo = logoAttachment();
  const allAttachments: EmailAttachment[] = [...(logo ? [logo] : []), ...(attachments ?? [])];

  if (!apiKey) {
    // No key locally: log the email (attachments are ignored when logging).
    return prisma.emailLog.create({
      data: { to, subject, bodyHtml: html, status: 'logged' },
    });
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      text: htmlToText(html),
      ...(allAttachments.length > 0
        ? {
            attachments: allAttachments.map((a) => ({
              filename: a.filename,
              content: a.content,
              ...(a.contentId ? { contentId: a.contentId } : {}),
            })),
          }
        : {}),
    });
    if (error) {
      return prisma.emailLog.create({
        data: { to, subject, bodyHtml: html, status: 'error', error: error.message },
      });
    }
    return prisma.emailLog.create({
      data: { to, subject, bodyHtml: html, status: 'sent', providerId: data?.id ?? null },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return prisma.emailLog.create({
      data: { to, subject, bodyHtml: html, status: 'error', error: message },
    });
  }
}

// Replace {{key}} occurrences with provided vars. Unknown keys resolve to an
// empty string so recipients never see a raw `{{eta}}` placeholder.
export function renderTemplate(bodyHtml: string, vars: Record<string, string>): string {
  return bodyHtml.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : '',
  );
}
