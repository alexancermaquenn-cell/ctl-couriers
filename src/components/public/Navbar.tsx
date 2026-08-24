'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/about', label: 'About' },
  { href: '/tracking', label: 'Tracking' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-40 transition-all duration-300',
        scrolled ? 'glass border-b border-white/5 py-2' : 'py-4 bg-transparent'
      )}
    >
      <nav className="container-x flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image src="/img/logo.png" alt="CTL" width={44} height={44} className="h-11 w-auto object-contain" />
          <span className="hidden sm:block text-sm font-semibold tracking-tight leading-tight">
            CTL Couriers<br />
            <span className="text-fg-subtle font-normal text-xs">Ltd</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 text-sm text-fg-muted hover:text-fg rounded-lg hover:bg-white/5 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/tracking"
            className="ml-2 inline-flex items-center h-9 px-4 rounded-[10px] bg-accent text-white text-sm font-medium hover:bg-accent-bright transition-colors glow-red"
          >
            Track Shipment
          </Link>
        </div>

        <button className="md:hidden text-fg" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden glass border-t border-white/5 mt-2">
          <div className="container-x py-3 flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-sm text-fg-muted hover:text-fg rounded-lg hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
