import Link from 'next/link';
import { getContent } from '@/lib/content';
import { Truck, Mail, Phone, MapPin } from 'lucide-react';

export async function Footer() {
  const c = await getContent();
  const footer = c.footer ?? {};
  const contact = c.contact ?? {};
  const brand = c.brand ?? {};

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-bg-elev/50">
      <div className="container-x py-14 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-accent/15 text-accent-bright">
              <Truck size={18} />
            </span>
            <span className="font-semibold">{brand.name ?? 'CTL Couriers'}</span>
          </div>
          <p className="text-sm text-fg-muted max-w-md leading-relaxed">{footer.about}</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-fg-muted">
            <li><Link href="/services" className="hover:text-fg">Services</Link></li>
            <li><Link href="/about" className="hover:text-fg">About</Link></li>
            <li><Link href="/tracking" className="hover:text-fg">Track</Link></li>
            <li><Link href="/faq" className="hover:text-fg">FAQ</Link></li>
            <li><Link href="/terms" className="hover:text-fg">Terms</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Contact</h4>
          <ul className="space-y-2.5 text-sm text-fg-muted">
            {contact.email && <li className="flex items-center gap-2"><Mail size={14} className="text-accent-bright" /> {contact.email}</li>}
            {contact.phone && <li className="flex items-center gap-2"><Phone size={14} className="text-accent-bright" /> {contact.phone}</li>}
            {contact.address && <li className="flex items-start gap-2"><MapPin size={14} className="text-accent-bright mt-0.5" /> {contact.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-x py-5 text-center text-xs text-fg-subtle">
          {footer.copyright ?? '© CTL Couriers Ltd. All Rights Reserved.'}
        </div>
      </div>
    </footer>
  );
}
