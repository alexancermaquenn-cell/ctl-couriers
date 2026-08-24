import Link from 'next/link';
import { SiteShell } from '@/components/site/SiteShell';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const metadata = {
  title: 'About — CTL Couriers Ltd',
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Who we are" title="A logistics partner you can rely on" crumb="About">
        <p>
          For more than 50 years, CTL Couriers Ltd has been meeting urgent shipping needs around the
          globe faster than anyone else — available 24 hours a day, 365 days a year.
        </p>
      </PageHero>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">The company</span>
              <h2 className="serif" style={{ fontSize: 'clamp(28px,3.8vw,48px)', letterSpacing: '-.025em', marginTop: 14 }}>
                Fifty years of moving the world
              </h2>
            </div>
            <span className="index">CTL / ABOUT / 01</span>
          </div>
          <div className="prose">
            <p>
              CTL Couriers Ltd is the recognized leader in the domestic and international cargo
              shipping business, providing the highest quality international cargo transport for a global customer base. We
              have been involved in the cargo transport business for more than 50 years, operating across North and South
              America, Europe, Asia and Australia.
            </p>
            <p>
              We transport everything from critical parts that keep an assembly line running to crucial time-sensitive
              documents. Our personalized service offers hands-on monitoring, web-based tracking and guaranteed on-time
              delivery for your most impossible deadlines — across a network that today serves more than 190 countries with
              a 99.2% on-time record.
            </p>
          </div>
          <div className="reach">
            <span>North America</span>
            <span>South America</span>
            <span>Europe</span>
            <span>Asia</span>
            <span>Australia</span>
          </div>
        </div>
      </Reveal>

      <Reveal className="stats">
        <div className="stats__grid">
          <div className="stat">
            <div className="stat__n">
              190<span className="u">+</span>
            </div>
            <div className="stat__l">Countries served</div>
            <div className="stat__d">Cross-continent shipping across every major trade lane.</div>
          </div>
          <div className="stat">
            <div className="stat__n">
              50<span className="u">+</span>
            </div>
            <div className="stat__l">Years of experience</div>
            <div className="stat__d">In the cargo transport business for more than five decades.</div>
          </div>
          <div className="stat">
            <div className="stat__n">
              99.2<span className="u">%</span>
            </div>
            <div className="stat__l">Guaranteed on-time</div>
            <div className="stat__d">On-time delivery for your most impossible deadlines.</div>
          </div>
          <div className="stat">
            <div className="stat__n">
              24<span className="u">/</span>7
            </div>
            <div className="stat__l">365 days a year</div>
            <div className="stat__d">Always available — around the clock, around the globe.</div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section network">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Global network</span>
              <h2 className="serif" style={{ fontSize: 'clamp(28px,3.6vw,44px)', letterSpacing: '-.025em', marginTop: 14 }}>
                Warehouses in Europe, terminals worldwide
              </h2>
            </div>
            <p>
              Insured, secured and bonded warehouse facilities in Norway, Denmark and Italy — backed by vehicle terminals
              across three continents.
            </p>
          </div>
          <div
            className="net-grid"
            style={{ border: 'var(--edge)', borderRadius: 16, overflow: 'hidden', background: 'var(--white)' }}
          >
            <div className="hub">
              <div className="hub__flag" aria-hidden="true">
                <svg viewBox="0 0 46 32">
                  <rect width="46" height="32" fill="#ba0c2f" />
                  <rect x="12" width="8" height="32" fill="#fff" />
                  <rect y="12" width="46" height="8" fill="#fff" />
                  <rect x="14" width="4" height="32" fill="#00205b" />
                  <rect y="14" width="46" height="4" fill="#00205b" />
                </svg>
              </div>
              <div className="hub__k">Norway</div>
              <h3>Oslo</h3>
              <div className="hub__meta">
                <div>
                  <small>Facility</small>
                  <b>Warehouse</b>
                </div>
                <div>
                  <small>Status</small>
                  <b>Bonded</b>
                </div>
              </div>
            </div>
            <div className="hub">
              <div className="hub__flag" aria-hidden="true">
                <svg viewBox="0 0 46 32">
                  <rect width="46" height="32" fill="#c8102e" />
                  <rect x="12" width="6" height="32" fill="#fff" />
                  <rect y="13" width="46" height="6" fill="#fff" />
                </svg>
              </div>
              <div className="hub__k">Denmark</div>
              <h3>Copenhagen</h3>
              <div className="hub__meta">
                <div>
                  <small>Facility</small>
                  <b>Warehouse</b>
                </div>
                <div>
                  <small>Status</small>
                  <b>Bonded</b>
                </div>
              </div>
            </div>
            <div className="hub">
              <div className="hub__flag" aria-hidden="true">
                <svg viewBox="0 0 46 32">
                  <rect width="46" height="32" fill="#fff" />
                  <rect width="15.33" height="32" fill="#008c45" />
                  <rect x="30.67" width="15.33" height="32" fill="#cd212a" />
                </svg>
              </div>
              <div className="hub__k">Italy</div>
              <h3>Milan</h3>
              <div className="hub__meta">
                <div>
                  <small>Facility</small>
                  <b>Warehouse</b>
                </div>
                <div>
                  <small>Status</small>
                  <b>Bonded</b>
                </div>
              </div>
            </div>
          </div>
          <div className="terminals">
            <div className="term">
              <div className="term__n">
                31<span className="u">+</span>
              </div>
              <div className="term__l">Terminal locations · Europe</div>
            </div>
            <div className="term">
              <div className="term__n">
                85<span className="u">+</span>
              </div>
              <div className="term__l">Terminal locations · North America</div>
            </div>
            <div className="term">
              <div className="term__n">
                12<span className="u">+</span>
              </div>
              <div className="term__l">Terminal locations · Asia</div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Why choose CTL</span>
              <h2 className="serif" style={{ fontSize: 'clamp(28px,3.6vw,44px)', letterSpacing: '-.025em', marginTop: 14 }}>
                Built on reliability
              </h2>
            </div>
            <span className="index">CTL / ABOUT / 02</span>
          </div>
          <div className="why">
            <div className="why__panel">
              <img className="bg" src="/img/generated/hero-port.jpg" alt="" loading="lazy" />
              <div className="big">
                50<span className="pct">+</span>
              </div>
              <div className="cap">Years in cargo transport</div>
              <p className="desc">
                Five decades of shipping cargo cross-continent between North and South America, Europe, Asia, Australia and
                Africa.
              </p>
              <div className="mini-bars" aria-hidden="true">
                <span style={{ height: '34%' }} />
                <span style={{ height: '46%' }} />
                <span style={{ height: '42%' }} />
                <span style={{ height: '58%' }} />
                <span style={{ height: '66%' }} />
                <span style={{ height: '61%' }} />
                <span style={{ height: '74%' }} />
                <span style={{ height: '82%' }} />
                <span className="hot" style={{ height: '100%' }} />
              </div>
            </div>
            <ul className="feat-list">
              <li className="feat">
                <span className="feat__ic">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </span>
                <div>
                  <h4>Insured, secured &amp; bonded facilities</h4>
                  <p>Your goods are held in insured, secured and bonded warehouses at every stage of transit.</p>
                </div>
              </li>
              <li className="feat">
                <span className="feat__ic">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  </svg>
                </span>
                <div>
                  <h4>Hands-on monitoring</h4>
                  <p>Personalized service — a real team watches every shipment from pick-up to delivery.</p>
                </div>
              </li>
              <li className="feat">
                <span className="feat__ic">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </span>
                <div>
                  <h4>Web-based tracking</h4>
                  <p>Live status and checkpoints on every shipment, from anywhere, at any time.</p>
                </div>
              </li>
              <li className="feat">
                <span className="feat__ic">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </span>
                <div>
                  <h4>Guaranteed on-time delivery</h4>
                  <p>99.2% on-time — even for your most impossible deadlines, 24 hours a day, 365 days a year.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section section--alt">
        <div className="wrap">
          <div className="sd-note" style={{ marginTop: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <p>
              <b>SafeDeal — secure escrow, part of every CTL offering.</b> As an impartial third party, CTL facilitates
              online buying and selling: the buyer&apos;s payment is held safely until the merchandise is examined and
              approved, reducing the risk of fraud for both sides.{' '}
              <Link href="/safedeal" style={{ color: 'var(--red)', fontWeight: 700 }}>
                Learn how SafeDeal works →
              </Link>
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="cta">
            <img className="bg" src="/img/generated/warehouse.jpg" alt="" loading="lazy" />
            <div className="cta__grid">
              <div>
                <h2>
                  Put 50 years of logistics <span className="em">to work for you</span>
                </h2>
                <p>
                  Talk to our team about your next shipment — cargo, vehicles, freight, parcels or documents. We are
                  available 24 hours a day, 365 days a year.
                </p>
              </div>
              <div className="cta__actions">
                <Link className="btn btn--red" href="/contact">
                  Contact us
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </Link>
                <Link className="btn btn--white" href="/services">
                  Explore our services
                </Link>
                <span className="cta__note">info@ctl-couriers-ltd.com · 24/7 · 365</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </SiteShell>
  );
}
