import { NextResponse } from 'next/server';
import { getContentRaw } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  const content = await getContentRaw();
  return NextResponse.json(content);
}
