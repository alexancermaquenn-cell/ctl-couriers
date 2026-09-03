import { prisma } from '@/lib/prisma';
import type { DocumentType } from '@prisma/client';
import { renderDocument, type DocData } from '@/lib/pdf';
import { getSetting, getJson } from '@/lib/settings';
import { CTL_PROFILE, type DocumentDesign, type Seal, type CompanyProfile } from '@/lib/doc-types';

const VALID_DESIGNS: DocumentDesign[] = ['ORIGINAL', 'A', 'B'];

/** Human-readable document title for email copy. */
const DOC_TYPE_LABEL: Record<DocumentType, string> = {
  BILL_OF_LADING: 'Bill of Lading',
  INVOICE: 'Commercial Invoice',
  INSPECTION: 'Inspection Report',
};

export interface DocumentPdf {
  number: string;
  buffer: Buffer;
  type: DocumentType;
  typeLabel: string;
}

/**
 * Load a Document by id and render it to a PDF buffer, applying the same seal /
 * issuer resolution the download route uses. Returns null if the doc is missing.
 * Shared by the PDF download route and the email attachment flow.
 */
export async function renderDocumentPdf(id: string): Promise<DocumentPdf | null> {
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      stampAsset: { select: { dataUrl: true } },
      signatureAsset: { select: { dataUrl: true } },
    },
  });
  if (!doc) return null;

  const data: DocData =
    doc.dataJson && typeof doc.dataJson === 'object' && !Array.isArray(doc.dataJson)
      ? (doc.dataJson as unknown as DocData)
      : ({} as DocData);

  const design: DocumentDesign = VALID_DESIGNS.includes(doc.design as DocumentDesign)
    ? (doc.design as DocumentDesign)
    : 'A';

  // Seal precedence: the doc's chosen DocAsset → the Setting-based default → null.
  const [settingStamp, settingSignature] = await Promise.all([
    getSetting('doc.stamp'),
    getSetting('doc.signature'),
  ]);
  const seal: Seal = {
    stamp: doc.stampAsset?.dataUrl ?? settingStamp ?? null,
    signature: doc.signatureAsset?.dataUrl ?? settingSignature ?? null,
  };

  // Company identity: editable admin profile wins, then CTL_PROFILE, unless the
  // doc already carries its own issuer override.
  const savedProfile = await getJson<CompanyProfile>('company.profile');
  const issuer: CompanyProfile = { ...CTL_PROFILE, ...(savedProfile ?? {}) };
  const existingIssuer = (data as { issuer?: CompanyProfile }).issuer;
  // If the caller-supplied dataJson has no docNumber (older invoices saved it
  // as ""), fall back to the row's own `number` so the PDF never shows blank.
  const existingDocNumber = (data as { docNumber?: string }).docNumber;
  const dataWithIssuer = {
    ...data,
    docNumber:
      typeof existingDocNumber === 'string' && existingDocNumber.trim() !== ''
        ? existingDocNumber
        : doc.number,
    issuer: existingIssuer ?? issuer,
  } as unknown as DocData;

  const buffer = await renderDocument(doc.type, design, dataWithIssuer, seal, doc.currency);
  return { number: doc.number, buffer, type: doc.type, typeLabel: DOC_TYPE_LABEL[doc.type] };
}
