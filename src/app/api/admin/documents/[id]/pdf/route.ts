import { NextResponse } from 'next/server';
import { renderDocumentPdf } from '@/lib/doc-pdf';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const pdf = await renderDocumentPdf(params.id);
    if (!pdf) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return new Response(new Uint8Array(pdf.buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${pdf.number}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to render PDF' }, { status: 500 });
  }
}
