import Link from 'next/link';
import { SiteShell } from '@/components/site/SiteShell';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

const DIVISIONS = [
  { code: 'LDD', title: 'Letters & Documents Delivery', desc: 'Secure delivery of business mail and critical, time-sensitive documents worldwide.' },
  { code: 'PD', title: 'Parcel Delivery', desc: 'Fast, reliable parcel delivery with real-time, web-based tracking on every shipment.' },
  { code: 'FD', title: 'Freight Delivery', desc: 'Time-critical freight for assembly lines and supply chains that cannot wait.' },
  { code: 'CTS', title: 'Cargo Transport Service', desc: 'The recognised leader in domestic and international cargo shipping across every continent.' },
  { code: 'MVR', title: 'Motor Vehicle Relocation', desc: 'Car carriers of all sizes, door-to-door or via terminal locations across Europe, North America and Asia.' },
  { code: 'TRK', title: 'Online Tracking', desc: 'Live, web-based tracking available 24 hours a day, 7 days a week, on every consignment.' },
  { code: 'DOC', title: 'CTL Documents', desc: 'Bill of Lading, Invoice and Vehicle Inspection Report — stamped and signed by the company.' },
];

export default function SupportPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Customer care" title="Support & operations" crumb="Support">
        <p>
          Maintaining excellent standards of customer care, ISO9001 registered — backed by a network of local
          franchisees and an automated sorting operation that moves your consignment from collection to delivery across
          220 countries.
        </p>
      </PageHero>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="care-grid">
            <div>
              <div className="eyebrow">Customer care</div>
              <h2
                style={{
                  fontFamily: "var(--font-manrope),sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(28px,3.4vw,42px)',
                  letterSpacing: '-.02em',
                  lineHeight: 1.1,
                  marginTop: 12,
                }}
              >
                Maintaining excellent standards of customer care
              </h2>
              <p>
                CTL Couriers Ltd is <b>ISO9001 registered</b>. Our <b>107 franchisees</b> provide
                invaluable local knowledge and interest, delivering the high standards of customer service that you
                expect. Once you have called your local depot to arrange a collection, our operation takes over —
                tracked, automated and monitored end to end.
              </p>
              <div className="care-badges">
                <span>
                  <b>ISO9001</b> registered
                </span>
                <span>
                  <b>107</b> franchisees
                </span>
                <span>
                  <b>220</b> countries served
                </span>
                <span>
                  <b>500,000+</b> parcels / night
                </span>
              </div>
            </div>
            <div className="care-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/legacy/garage4.jpg"
                alt="CTL Couriers Ltd inspection and customer care"
              />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--alt">
        <div className="wrap">
          <div className="sec-head">
            <h2>From collection to delivery</h2>
            <p>
              How a package moves through the CTL Couriers Ltd network — every step tracked by a
              unique barcode.
            </p>
          </div>
          <ol className="op-flow">
            <li>
              <div>
                <b>
                  Collection with a <span className="hi">Parcel Coder</span>
                </b>
                <p>
                  A driver collects your parcel, document or package and enters the details into a handheld portable data
                  terminal — known as a Parcel Coder — carried by every vehicle driver.
                </p>
              </div>
            </li>
            <li>
              <div>
                <b>Depot check-in &amp; route label</b>
                <p>
                  On arrival at the collecting depot, the details of the package are received, the route label is printed
                  and ready to be attached, and the tracking details are logged onto the computer.
                </p>
              </div>
            </li>
            <li>
              <div>
                <b>Automated central sorting hub</b>
                <p>
                  Our automated central sorting hub currently handles over 500,000 parcels a night. A unique barcode on
                  your package is used to identify, track, label, move, sort and load it — completely automated, in a
                  matter of minutes.
                </p>
              </div>
            </li>
            <li>
              <div>
                <b>Overnight linehaul</b>
                <p>
                  From the hub, our linehaul trucks take your package to the appropriate depot through the night, ready
                  for the next stage of its journey.
                </p>
              </div>
            </li>
            <li>
              <div>
                <b>Delivery or airport dispatch</b>
                <p>
                  Your package is delivered by a CTL Couriers Ltd vehicle, or forwarded to an
                  airport for despatch to one of the 220 countries that we serve.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="sec-head">
            <h2>Our divisions</h2>
            <p>Specialist teams for every kind of consignment, from a single letter to full vehicle relocation.</p>
          </div>
          <div className="div-grid">
            {DIVISIONS.map((d, i) => (
              <div className="div-card" key={d.code} style={i === DIVISIONS.length - 1 ? { borderRight: 'none' } : undefined}>
                <div className="code">{d.code}</div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--alt">
        <div className="wrap">
          <div className="sec-head">
            <h2>Tracking — frequently asked questions</h2>
            <p>Everything you need to know about the CTL Couriers Ltd Internet tracking system.</p>
          </div>
          <div className="tfaq">
            <div className="tfaq__row">
              <h4>How long will consignment details be available on the internet?</h4>
              <p>Tracking information will be available for a minimum of 120 days.</p>
            </div>
            <div className="tfaq__row">
              <h4>Will the internet tracking facility be available 24 hours a day, 7 days a week?</h4>
              <p>Yes. The internet system will be available each day, for 24 hours.</p>
            </div>
            <div className="tfaq__row">
              <h4>What are the minimum system requirements for the internet tracking system?</h4>
              <ul>
                <li>Any computer with an internet connection (IBM-compatible or Mac-compatible).</li>
                <li>An internet-ready operating system (any modern Windows, macOS or Linux version).</li>
                <li>Any browser that supports Graphics, JavaScript and Cookies.</li>
              </ul>
            </div>
            <div className="tfaq__row">
              <h4>How do I optimise my browser for correct usage?</h4>
              <ul>
                <li>Enable JavaScript.</li>
                <li>Enable cookies.</li>
                <li>Enable graphics.</li>
              </ul>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="sec-head">
            <h2>Quick links</h2>
            <p>Jump straight to the tools and answers you need most.</p>
          </div>
          <div className="qlinks">
            <Link className="qlink" href="/tracking">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <span>
                <b>Track a shipment</b>
                <small>Enter your CTL number for live status</small>
              </span>
            </Link>
            <Link className="qlink" href="/faq">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="9" />
                  <path d="M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.9.5-1.1 1-1.1 1.8" />
                  <path d="M12 17h.01" />
                </svg>
              </span>
              <span>
                <b>FAQ</b>
                <small>General use &amp; financial questions</small>
              </span>
            </Link>
            <Link className="qlink" href="/contact">
              <span className="ic">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 5h16v14H4z" />
                  <path d="m4 6 8 6 8-6" />
                </svg>
              </span>
              <span>
                <b>Contact us</b>
                <small>Available 24 / 7 · 365 days</small>
              </span>
            </Link>
          </div>
        </div>
      </Reveal>
    </SiteShell>
  );
}
