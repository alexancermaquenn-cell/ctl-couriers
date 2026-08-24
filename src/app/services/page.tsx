import Link from 'next/link';
import { SiteShell } from '@/components/site/SiteShell';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="What we do" title="Full-spectrum logistics services" crumb="Services">
        <p>From critical parts that keep an assembly line running to crucial time-sensitive documents — CTL moves everything, everywhere. Hands-on monitoring, web-based tracking and guaranteed on-time delivery for your most impossible deadlines.</p>
      </PageHero>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Flagship service 01</span>
              <h2 className="serif" style={{ fontSize: 'clamp(30px,4vw,50px)', letterSpacing: '-.025em', marginTop: 14 }}>CTS — Cargo Transport Service</h2>
            </div>
            <span className="index">CTL / SVC / 01</span>
          </div>
          <div className="inspect" style={{ marginTop: 0 }}>
            <figure className="inspect__fig">
              <img src="/img/generated/cts-fleet.jpg" alt="CTL cargo fleet — international cargo transport" loading="lazy" />
              <figcaption><b>International Cargo Transport</b><small>Cross-continent shipping — 190+ countries served</small></figcaption>
            </figure>
            <div>
              <span className="eyebrow">Domestic &amp; international cargo shipping</span>
              <h3>The recognized leader in cargo shipping</h3>
              <p>CTL CTS is the recognized leader in the domestic and international cargo shipping business, providing the highest quality international cargo transport for our global customer base. We have been involved in the cargo transport business for more than 50 years.</p>
              <p>We ship cargo cross-continent between North and South America, Europe, Asia, Australia or Africa — with hands-on monitoring and web-based tracking on every shipment.</p>
              <div className="flag__meta">
                <span><b>50+</b>&nbsp;years in cargo transport</span>
                <span>N/S America · Europe · Asia</span>
                <span>Australia · Africa</span>
              </div>
              <Link className="flag__link" href="/contact">Request a cargo quote
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--alt">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Flagship service 02</span>
              <h2 className="serif" style={{ fontSize: 'clamp(30px,4vw,50px)', letterSpacing: '-.025em', marginTop: 14 }}>MVR — Motor Vehicle Relocation</h2>
            </div>
            <span className="index">CTL / SVC / 02</span>
          </div>
          <div className="inspect" style={{ marginTop: 0 }}>
            <div>
              <span className="eyebrow">International motor vehicle transport</span>
              <h3>One of the largest auto shipping fleets in the world</h3>
              <p>CTL MVR is one of the largest and most recognized auto shipping companies around the world. For the past 50 years we have been delivering cars across the globe, with car carriers of all sizes available.</p>
              <p>Choose delivery directly to your door — or pick up your vehicle at over 31 terminal locations across Europe, 85 terminal locations across North America and 12 terminal locations across Asia. Most vehicles ship onboard an enclosed transport for maximum protection.</p>
              <div className="flag__meta">
                <span><b>31</b>&nbsp;terminals Europe</span>
                <span><b>85</b>&nbsp;terminals N. America</span>
                <span><b>12</b>&nbsp;terminals Asia</span>
                <span>Enclosed transport</span>
              </div>
              <Link className="flag__link" href="/contact">Request a vehicle quote
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
            <figure className="inspect__fig">
              <img src="/img/generated/mvr-loading.jpg" alt="Vehicle loading onto enclosed car carrier" loading="lazy" />
              <figcaption><b>Motor Vehicle Relocation</b><small>Door-to-door or terminal pick-up — enclosed transport</small></figcaption>
            </figure>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Supporting services</span>
              <h2 className="serif" style={{ fontSize: 'clamp(28px,3.6vw,44px)', letterSpacing: '-.025em', marginTop: 14 }}>Every link in your supply chain</h2>
            </div>
            <p>Beyond CTS and MVR, CTL runs dedicated divisions for freight, parcels, documents, inspection and warehousing — all monitored 24/7, 365 days a year.</p>
          </div>
          <div className="svc-grid">
            <div className="svc">
              <span className="svc__num">03</span>
              <div className="svc__ico">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <h3>Freight Delivery Division</h3>
              <p>Time-critical freight for assembly lines and supply chains — the parts that keep production moving arrive exactly when they must.</p>
            </div>
            <div className="svc">
              <span className="svc__num">04</span>
              <div className="svc__ico">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
              </div>
              <h3>Parcel Delivery</h3>
              <p>Fast, reliable parcel delivery with real-time web tracking on every shipment, anywhere in our 190+ country network.</p>
            </div>
            <div className="svc">
              <span className="svc__num">05</span>
              <div className="svc__ico">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <h3>Letter &amp; Document Delivery</h3>
              <p>Secure delivery of business mail and crucial time-sensitive documents worldwide — handled with the same rigor as full cargo.</p>
            </div>
            <div className="svc">
              <span className="svc__num">06</span>
              <div className="svc__ico">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14.7 6.3 4.3-4.3 3 3-4.3 4.3a2 2 0 0 1-2.1.5l-1.9 1.9 5.5 5.5a2.1 2.1 0 0 1-3 3l-5.5-5.5-1.9 1.9a2 2 0 0 1-.5 2.1L4 22.5l-3-3 4.3-4.3a2 2 0 0 1 2.1-.5l1.9-1.9-1.9-1.9a4 4 0 0 1-5-5.5L5.7 8.7l2 2 2-2-2-2L11 4.4a4 4 0 0 1 3.7 1.9z"/></svg>
              </div>
              <h3>Vehicle Inspection</h3>
              <p>A CTL mechanic inspects every vehicle before and after transport and issues a formal Vehicle Inspection Report.</p>
              <img className="svc__img" src="/img/legacy/garage4.jpg" alt="CTL mechanic inspecting a vehicle with the client" loading="lazy" />
            </div>
            <div className="svc">
              <span className="svc__num">07</span>
              <div className="svc__ico">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M6 14h12"/><rect x="6" y="10" width="12" height="12"/></svg>
              </div>
              <h3>Warehousing</h3>
              <p>Insured, secured and bonded facilities — with warehouses in Oslo, Copenhagen and Milan holding your goods safely at every stage.</p>
              <img className="svc__img" src="/img/generated/warehouse.jpg" alt="CTL bonded warehouse facility" loading="lazy" />
            </div>
            <div className="svc">
              <span className="svc__num">08</span>
              <div className="svc__ico">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              </div>
              <h3>Web-Based Tracking</h3>
              <p>Every shipment carries a CTL tracking number. Follow live status and checkpoints online, around the clock.</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--alt">
        <div className="wrap">
          <div className="inspect" style={{ marginTop: 0 }}>
            <div>
              <span className="eyebrow">Shipment documentation</span>
              <h3>Formal documents with every shipment</h3>
              <p>Each CTL shipment is backed by a complete, formally issued document set — every document carries the official company stamp and an authorized signature.</p>
              <ul className="doc-list">
                <li>
                  <span className="di"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg></span>
                  <div><b>Bill of Lading</b><small>The contract of carriage for your cargo, issued at dispatch.</small></div>
                </li>
                <li>
                  <span className="di"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10"/><path d="M7 13h6"/><path d="M15 17h2"/></svg></span>
                  <div><b>Invoice</b><small>A formal invoice for the transport service, stamped and signed.</small></div>
                </li>
                <li>
                  <span className="di"><svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg></span>
                  <div><b>Vehicle Inspection Report</b><small>Issued by our mechanic before and after transport — with company stamp and signature.</small></div>
                </li>
              </ul>
              <Link className="flag__link" href="/tracking">Your documents follow your tracking number
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
              </Link>
            </div>
            <figure className="inspect__fig">
              <img src="/img/legacy/garage4.jpg" alt="Vehicle inspection carried out before transport" loading="lazy" />
              <figcaption><b>Inspection &amp; documentation</b><small>Stamped, signed, and linked to your shipment</small></figcaption>
            </figure>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="cta">
            <img className="bg" src="/img/generated/hero-port.jpg" alt="" loading="lazy" />
            <div className="cta__grid">
              <div>
                <h2>Ready to ship? <span className="em">We are.</span></h2>
                <p>Available 24 hours a day, 365 days a year — CTL meets your urgent shipping needs around the globe faster than anyone else.</p>
              </div>
              <div className="cta__actions">
                <Link className="btn btn--red" href="/contact">Get a quote
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
                <Link className="btn btn--white" href="/tracking">Track a shipment</Link>
                <span className="cta__note">info@ctl-couriers-ltd.com · 24/7 · 365</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </SiteShell>
  );
}
