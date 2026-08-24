// Explicit ordering for the content editor so forms read logically
// instead of depending on Object.keys() insertion/alphabetical order.

// Section (top-level content key) order — most-edited first.
export const SECTION_ORDER = [
  'brand',
  'hero',
  'about',
  'services',
  'features',
  'stats',
  'faq',
  'contact',
  'footer',
];

// Per-section field order for the array/object row editors.
// Keys not listed here are appended afterwards in their natural order.
export const FIELD_ORDER: Record<string, string[]> = {
  faq: ['q', 'a'],
  services: ['title', 'icon', 'desc'],
  features: ['title', 'desc'],
  about: ['title', 'body'],
  stats: ['value', 'label'],
  hero: ['eyebrow', 'title', 'subtitle', 'ctaPrimary', 'ctaSecondary'],
  contact: ['title', 'subtitle', 'email', 'phone', 'address'],
  footer: ['title', 'tagline', 'copyright'],
};

/** Sort `keys` by the given explicit order; unlisted keys keep their order at the end. */
export function orderKeys(keys: string[], order?: string[]): string[] {
  if (!order) return keys;
  const rank = new Map(order.map((k, i) => [k, i]));
  return [...keys].sort((a, b) => {
    const ra = rank.has(a) ? rank.get(a)! : order.length + keys.indexOf(a);
    const rb = rank.has(b) ? rank.get(b)! : order.length + keys.indexOf(b);
    return ra - rb;
  });
}
