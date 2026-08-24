import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderDocument, type DocData } from '@/lib/pdf';
import { getSetting, getJson } from '@/lib/settings';
import { CTL_PROFILE, type DocumentDesign, type Seal, type CompanyProfile } from '@/lib/doc-types';

export const dynamic = 'force-dynamic';

const VALID_DESIGNS: DocumentDesign[] = ['ORIGINAL', 'A', 'B'];

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        stampAsset: { select: { dataUrl: true } },
        signatureAsset: { select: { dataUrl: true } },
      },
    });
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const data: DocData =
      doc.dataJson && typeof doc.dataJson === 'object' && !Array.isArray(doc.dataJson)
        ? (doc.dataJson as unknown as DocData)
        : ({} as DocData);

    const design: DocumentDesign = VALID_DESIGNS.includes(doc.design as DocumentDesign)
      ? (doc.design as DocumentDesign)
      : 'A';

    // Seal precedence: the doc's chosen DocAsset → the Setting-based default →
    // null (pdf lib then falls back to the public/img/docs default files).
    const [settingStamp, settingSignature] = await Promise.all([
      getSetting('doc.stamp'),
      getSetting('doc.signature'),
    ]);
    const seal: Seal = {
      stamp: doc.stampAsset?.dataUrl ?? settingStamp ?? null,
      signature: doc.signatureAsset?.dataUrl ?? settingSignature ?? null,
    };

    // Company identity: the editable admin profile (Setting 'company.profile')
    // wins, falling back to CTL_PROFILE. Injected as data.issuer so every
    // document reflects what the admin edits — unless the doc already carries
    // its own issuer override.
    const savedProfile = await getJson<CompanyProfile>('company.profile');
    const issuer: CompanyProfile = { ...CTL_PROFILE, ...(savedProfile ?? {}) };
    const existingIssuer = (data as { issuer?: CompanyProfile }).issuer;
    const dataWithIssuer = {
      ...data,
      issuer: existingIssuer ?? issuer,
    } as unknown as DocData;

    // PDF agent contract: renderDocument(type, design, dataJson, seal, currency).
    // seal = { stamp, signature } as data URLs; currency is the document's currency code.
    const buffer = await renderDocument(doc.type, design, dataWithIssuer, seal, doc.currency);

    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${doc.number}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to render PDF' }, { status: 500 });
  }
}
