'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/safedeal', label: 'SafeDeal' },
  { href: '/tracking', label: 'Tracking' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
  { href: '/support', label: 'Support' },
];
const MOBILE_EXTRA = [
  { href: '/contact', label: 'Contact' },
  { href: '/terms', label: 'Terms' },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      // clicks inside the header (menu panel, burger, brand) are handled there
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <header className="nav" ref={headerRef}>
      <div className="wrap nav__in">
        <Link className="brand" href="/">
          <Image className="brand__logo" src="/img/legacy/logo.png" alt="CTL Couriers Ltd" width={54} height={44} />
          <span className="brand__txt">
            <strong>CTL</strong>
            <small>CTL Couriers</small>
          </span>
        </Link>
        <nav className={cn('nav__links', open && 'open')}>
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={isActive(l.href) ? 'active' : undefined}
              aria-current={isActive(l.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          {MOBILE_EXTRA.map((l) => (
            <Link key={l.href} href={l.href} className="nav__mobile-only" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="nav__mobile-cta nav__mobile-only">
            <Link className="btn btn--ghost btn--sm" href="/tracking" onClick={() => setOpen(false)}>Track shipment</Link>
            <Link className="btn btn--ink btn--sm" href="/contact" onClick={() => setOpen(false)}>Get a quote</Link>
          </div>
        </nav>
        <div className="nav__cta">
          <Link className="btn btn--ghost btn--sm" href="/tracking">Track shipment</Link>
          <Link className="btn btn--ink btn--sm" href="/contact">Get a quote</Link>
        </div>
        <button
          className="burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
