import Link from 'next/link';
import Image from 'next/image';
import { getJson } from '@/lib/settings';
import { CTL_PROFILE, type CompanyProfile } from '@/lib/doc-types';

export async function Footer() {
  const saved = await getJson<CompanyProfile>('company.profile').catch(() => null);
  const c: CompanyProfile = { ...CTL_PROFILE, ...(saved ?? {}) };
  const year = new Date().getFullYear();
  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot__brand">
            <Link className="brand" href="/">
              <Image className="brand__logo" src="/img/legacy/logo.png" alt={c.name} width={54} height={44} />
            </Link>
            <small>
              {c.name} — reliable shipping solutions across the globe.
              Meeting your urgent shipping needs 24 hours a day, 365 days a year.
              {c.address ? ` Registered office: ${c.address}.` : ''}
            </small>
          </div>
          <div className="foot">
            <h5>Services</h5>
            <ul>
              <li><Link href="/services">Cargo Transport (CTS)</Link></li>
              <li><Link href="/services">Vehicle Relocation (MVR)</Link></li>
              <li><Link href="/services">Freight &amp; parcel delivery</Link></li>
              <li><Link href="/services">Letter &amp; document delivery</Link></li>
              <li><Link href="/services">Warehousing &amp; inspection</Link></li>
            </ul>
          </div>
          <div className="foot">
            <h5>Company</h5>
            <ul>
              <li><Link href="/safedeal">SafeDeal escrow</Link></li>
              <li><Link href="/about">About us</Link></li>
              <li><Link href="/tracking">Track shipment</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/support">Support</Link></li>
            </ul>
          </div>
          <div className="foot">
            <h5>Legal &amp; contact</h5>
            <ul>
              <li><Link href="/terms">Terms &amp; conditions</Link></li>
              <li><Link href="/contact">Contact us</Link></li>
              <li><a href={`mailto:${c.email}`}>{c.email}</a></li>
              {c.phone ? <li>{c.phone}</li> : null}
              <li className="avail"><span className="pulse" style={{ width: 8, height: 8 }} /> Available 24 / 7 · 365 days</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <small>© {year} {c.name}. All rights reserved.{c.reg ? ` ${c.regLabel} ${c.reg}.` : ''}{c.vat ? ` VAT ${c.vat}.` : ''}</small>
          <small className="mono">CTL · 24/7 · 365 DAYS · REAL-TIME TRACKING</small>
        </div>
      </div>
    </footer>
  );
}
