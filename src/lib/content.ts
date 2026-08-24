import { prisma } from '@/lib/prisma';

export interface Brand { name?: string; short?: string; logo?: string; banner?: string; tagline?: string }
export interface CtaLink { label?: string; href?: string }
export interface Hero {
  eyebrow?: string; title?: string; subtitle?: string;
  ctaPrimary?: CtaLink; ctaSecondary?: CtaLink;
}
export interface Stat { value: string; label: string }
export interface About { title?: string; body?: string }
export interface Service { title: string; desc: string; icon?: string }
export interface Feature { title: string; desc: string }
export interface FaqItem { q: string; a: string }
export interface ContactInfo { email?: string; phone?: string; address?: string; hours?: string }
export interface FooterInfo { about?: string; copyright?: string }

export interface SiteContentShape {
  brand: Brand;
  hero: Hero;
  stats: Stat[];
  about: About;
  services: Service[];
  features: Feature[];
  faq: FaqItem[];
  contact: ContactInfo;
  footer: FooterInfo;
}

export type ContentMap = Record<string, unknown>;

/** Fetch all SiteContent as a typed shape with safe fallbacks. */
export async function getContent(): Promise<SiteContentShape> {
  const rows = await prisma.siteContent.findMany();
  const map: ContentMap = {};
  for (const r of rows) map[r.key] = r.value;
  const g = <T,>(k: string, fb: T): T => (map[k] as T | undefined) ?? fb;
  return {
    brand: g('brand', {}),
    hero: g('hero', {}),
    stats: g('stats', []),
    about: g('about', {}),
    services: g('services', []),
    features: g('features', []),
    faq: g('faq', []),
    contact: g('contact', {}),
    footer: g('footer', {}),
  };
}

/** Raw untyped map (for the public API route that returns everything). */
export async function getContentRaw(): Promise<ContentMap> {
  const rows = await prisma.siteContent.findMany();
  const map: ContentMap = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}
