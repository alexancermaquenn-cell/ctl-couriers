import { prisma } from '@/lib/prisma';
import type { EmailLog } from '@prisma/client';

const FROM = 'CTL Couriers <info@ctlcouriers.com>';

interface EmailAttachment {
  filename: string;
  content: Buffer;
}

interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailArgs): Promise<EmailLog> {
  const apiKey = process.env.RESEND_API_KEY;

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
      ...(attachments && attachments.length > 0
        ? { attachments: attachments.map((a) => ({ filename: a.filename, content: a.content })) }
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

// Replace {{key}} occurrences with provided vars.
export function renderTemplate(bodyHtml: string, vars: Record<string, string>): string {
  return bodyHtml.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : `{{${key}}}`,
  );
}
