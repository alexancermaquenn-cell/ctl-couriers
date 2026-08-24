export type {
  Brand, CtaLink, Hero, Stat, About, Service, Feature, FaqItem,
  ContactInfo, FooterInfo, SiteContentShape, ContentMap,
} from './content';
import type { SiteContentShape, ContentMap } from './content';

/** Kept for backward compat; getContent() already returns the typed shape. */
export function asContent(map: ContentMap | SiteContentShape): SiteContentShape {
  return map as SiteContentShape;
}
