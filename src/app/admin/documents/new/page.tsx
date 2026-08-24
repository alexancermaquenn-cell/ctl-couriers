'use client';
import { Suspense } from 'react';
import { DocumentEditor } from '@/components/admin/DocumentEditor';

export default function NewDocumentPage() {
  return (
    <Suspense fallback={<div className="text-fg-muted">Loading editor…</div>}>
      <DocumentEditor />
    </Suspense>
  );
}
