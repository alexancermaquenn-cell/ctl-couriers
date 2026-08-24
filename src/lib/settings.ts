import { prisma } from '@/lib/prisma';
import { CTL_PROFILE, type CompanyProfile } from '@/lib/doc-types';

export async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

export async function getJson<T>(key: string): Promise<T | null> {
  const raw = await getSetting(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Ensure the canonical CTL profile is seeded once. Lazy — safe to call anywhere. */
export async function ensureCompanyProfile(): Promise<CompanyProfile> {
  const existing = await getJson<CompanyProfile>('company.profile');
  if (existing) return existing;
  await setSetting('company.profile', JSON.stringify(CTL_PROFILE));
  return CTL_PROFILE;
}
