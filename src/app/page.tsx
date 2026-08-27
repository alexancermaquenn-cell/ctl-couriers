import Link from 'next/link';
import { SiteShell } from '@/components/site/SiteShell';
import { Reveal } from '@/components/site/Reveal';

export default function Home() {
  return (
    <SiteShell>
      <section className="hero hero--home">
        <video
          className="hero__video"
          src="/img/generated/hero-video.mp4"
          poster="/img/generated/hero-truck.jpg"
          autoPlay
          muted
          loop
          playsInline
          aria-label="CTL car-carrier transport truck on the highway"
        ></video>
        <div className="wrap">
          <div className="hero__inner">
            <span className="eyebrow hero__reveal d1">Reliable shipping solutions across the globe</span>
            <h1 className="hero__reveal d2">
              Meeting your<br />
              urgent shipping<br />
              needs <span className="em serif">worldwide.</span>
            </h1>
            <p className="hero__lead hero__reveal d3">
              Available 24 hours a day, 365 days a year, <strong>CTL Couriers Ltd</strong>{' '}
              has been meeting your urgent shipping needs around the globe faster than anyone else — from critical
              parts that keep an assembly line running to crucial, time-sensitive documents.
            </p>
            <div className="hero__actions hero__reveal d4">
              <Link className="btn btn--ink" href="/tracking">Track a shipment <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
              <Link className="btn btn--ghost" href="/services">Explore services</Link>
            </div>
            <div className="chips hero__reveal d5">
              <div className="chip"><i><svg viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></i><span><b>24 hrs · 365 days</b><small>Always operating</small></span></div>
              <div className="chip"><i><svg viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M22 4 12 14l-3-3"/></svg></i><span><b>99.2% on-time</b><small>Guaranteed delivery</small></span></div>
              <div className="chip"><i><svg viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a10 10 0 1 0 20 0 10 10 0 0 0-20 0z"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg></i><span><b>50+ years</b><small>Of experience</small></span></div>
            </div>
            <div className="hero__fleet hero__reveal d5"><b>Global fleet</b><span className="sep"></span>Enclosed &amp; open car carriers · Door-to-door · 190+ countries</div>
          </div>
        </div>
      </section>

      <Reveal as="section" className="pad">
        <div className="wrap">
          <div className="cta">
            <img className="bg" src="/img/generated/hero-port.jpg" alt="" />
            <div className="teaser__grid">
              <div>
                <span className="hero__badge">{'// Web-based tracking on every shipment'}</span>
                <h2 style={{ marginTop: 10 }}>Know where your cargo is. <span className="em">Always.</span></h2>
                <p>Every order carries a CTL-####-#### number with real-time status, checkpoints and ETA on the web — hands-on monitoring from pickup to proof of delivery.</p>
              </div>
              <div className="track">
                <div className="track__head">
                  <h3><span className="pulse"></span> Track &amp; Trace</h3>
                  <span className="track__badge">Real-time · CTL</span>
                </div>
                <div className="track__body">
                  <label className="track__label" htmlFor="tnum">Tracking number</label>
                  <div className="track__input">
                    <input id="tnum" type="text" defaultValue="CTL-4830-2291" spellCheck={false} aria-label="Tracking number" />
                    <Link className="track__go" href="/tracking" aria-label="Track">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                    </Link>
                  </div>
                  <div className="track__hint">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    Full status, route &amp; checkpoints on the <Link href="/tracking"><b>tracking page</b></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="stats">
        <div className="wrap">
          <div className="stats__grid">
            <div className="stat"><div className="stat__n">190<span className="u">+</span></div><div className="stat__l">Countries served</div><div className="stat__d">Across the Americas, Europe, Asia &amp; Australia.</div></div>
            <div className="stat"><div className="stat__n">50<span className="u">+</span></div><div className="stat__l">Years of experience</div><div className="stat__d">In the domestic &amp; international cargo business.</div></div>
            <div className="stat"><div className="stat__n">99.2<span className="u">%</span></div><div className="stat__l">On-time delivery</div><div className="stat__d">Guaranteed for your most impossible deadlines.</div></div>
            <div className="stat"><div className="stat__n">128<span className="u">+</span></div><div className="stat__l">Vehicle terminals</div><div className="stat__d"><b>31</b> Europe · <b>85</b> N. America · <b>12</b> Asia</div></div>
          </div>
        </div>
      </Reveal>

      <section className="pad">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">What we move</span>
              <h2 className="serif" style={{ marginTop: 16 }}>Two flagship services.<br />One accountable network.</h2>
            </div>
            <p>The recognized leader in domestic and international cargo shipping — from full cross-continent freight to door-to-door vehicle relocation, all on one tracked, audited backbone.</p>
          </Reveal>

          <Reveal className="flag">
            <article className="flag__card">
              <div className="flag__media">
                <span className="flag__tag">CTS</span>
                <img src="/img/generated/cts-fleet.jpg" alt="International cargo transport containers and freight" />
                <div className="flag__title"><span>Cargo Transport Service</span><h3>Cargo Transport</h3></div>
              </div>
              <div className="flag__body">
                <p>
                  <strong>CTL CTS</strong> is the recognized leader in the domestic and international cargo shipping
                  business — more than 50 years shipping cargo cross-continent between North &amp; South America,
                  Europe, Asia, Australia and Africa.
                </p>
                <div className="flag__meta">
                  <span><b>50+</b> years</span>
                  <span>Air · Sea · Road</span>
                  <span>Customs cleared</span>
                </div>
                <Link className="flag__link" href="/services">Explore CTS <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
              </div>
            </article>

            <article className="flag__card">
              <div className="flag__media">
                <span className="flag__tag">MVR</span>
                <img src="/img/generated/mvr-loading.jpg" alt="Motor vehicle relocation, cars prepared for transport" />
                <div className="flag__title"><span>Motor Vehicle Relocation</span><h3>Vehicle Relocation</h3></div>
              </div>
              <div className="flag__body">
                <p>
                  <strong>CTL MVR</strong> is one of the largest and most recognized auto shipping companies in the world —
                  car carriers of all sizes, direct to your door or pick-up at over <strong>31 terminals in Europe,
                  85 in North America and 12 in Asia</strong>. Most vehicles ship in enclosed transport.
                </p>
                <div className="flag__meta">
                  <span><b>128+</b> terminals</span>
                  <span>Enclosed transport</span>
                  <span>Door-to-door</span>
                </div>
                <Link className="flag__link" href="/services">Explore MVR <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
              </div>
            </article>

            <article className="flag__card">
              <div className="flag__media">
                <span className="flag__tag">FD · PD</span>
                <img src="/img/generated/hero-port.jpg" alt="Freight containers at port, time-critical shipping lanes" />
                <div className="flag__title"><span>Freight &amp; Parcel Delivery</span><h3>Freight &amp; Parcel</h3></div>
              </div>
              <div className="flag__body">
                <p>
                  Time-critical freight for assembly lines and supply chains, plus fast, reliable parcel delivery with
                  real-time web tracking — and secure letter &amp; document delivery worldwide.
                </p>
                <div className="flag__meta">
                  <span>Expedited lanes</span>
                  <span>Real-time tracking</span>
                </div>
                <Link className="flag__link" href="/services">Explore delivery divisions <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
              </div>
            </article>

            <article className="flag__card">
              <div className="flag__media">
                <span className="flag__tag">WH</span>
                <img src="/img/generated/warehouse.jpg" alt="CTL bonded warehouse facility" />
                <div className="flag__title"><span>Warehousing &amp; Inspection</span><h3>Warehousing</h3></div>
              </div>
              <div className="flag__body">
                <p>
                  Insured, secured and bonded facilities in Norway, Denmark and Spain — with certified mechanics
                  inspecting every vehicle before and after transport, documented in a full Vehicle Inspection Report.
                </p>
                <div className="flag__meta">
                  <span>Insured · Bonded</span>
                  <span>Inspection reports</span>
                </div>
                <Link className="flag__link" href="/services">Explore warehousing <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
              </div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="safedeal pad">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">SafeDeal — secure shipping service</span>
              <h2 className="serif" style={{ marginTop: 16 }}>Buy and sell across<br />the world, without the risk.</h2>
            </div>
            <p>SafeDeal is an impartial third party that facilitates online buying and selling — guaranteeing security, reliance and convenience for both parties, and reducing the risk of fraud for consumer-to-consumer, business-to-consumer and business-to-business trade.</p>
          </Reveal>
          <Reveal>
            <div className="sd-index" aria-label="SafeDeal process overview">
              <span><b>01</b> Agreement</span>
              <span><b>02</b> Payment held by CTL</span>
              <span><b>03</b> Seller ships via CTL</span>
              <span><b>04</b> Buyer inspects &amp; approves</span>
              <span><b>05</b> Payment released</span>
            </div>
            <Link className="btn btn--red" style={{ marginTop: 30 }} href="/safedeal">Learn how SafeDeal works <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
          </Reveal>
        </div>
      </section>

      <section className="network pad">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">Global network</span>
              <h2 className="serif" style={{ marginTop: 16 }}>Warehouses across Europe.<br />Terminals across the world.</h2>
            </div>
            <p className="index">/ HUBS — NORWAY · DENMARK · SPAIN</p>
          </Reveal>

          <Reveal>
           <div className="net-grid" style={{ border: 'var(--edge)', borderRadius: 16, overflow: 'hidden', background: 'var(--paper-2)' }}>
            <div className="hub">
              <div className="hub__flag">
                <svg viewBox="0 0 22 16"><rect width="22" height="16" fill="#ba0c2f"/><rect x="6" width="4" height="16" fill="#fff"/><rect y="6" width="22" height="4" fill="#fff"/><rect x="7" width="2" height="16" fill="#00205b"/><rect y="7" width="22" height="2" fill="#00205b"/></svg>
              </div>
              <span className="hub__k">Warehouse · Nordic gateway</span>
              <h3>Oslo, Norway</h3>
              <div className="hub__meta">
                <div><small>Facility</small><b>Insured · Bonded</b></div>
                <div><small>Lanes</small><b>Air · Sea</b></div>
              </div>
            </div>
            <div className="hub">
              <div className="hub__flag">
                <svg viewBox="0 0 22 16"><rect width="22" height="16" fill="#c8102e"/><rect x="6" width="3" height="16" fill="#fff"/><rect y="6" width="22" height="3" fill="#fff"/></svg>
              </div>
              <span className="hub__k">Warehouse · Central sort</span>
              <h3>Copenhagen, Denmark</h3>
              <div className="hub__meta">
                <div><small>Facility</small><b>Secured · Bonded</b></div>
                <div><small>Lanes</small><b>Road · Rail</b></div>
              </div>
            </div>
            <div className="hub">
              <div className="hub__flag">
                <svg viewBox="0 0 22 16"><rect width="22" height="16" fill="#AA151B"/><rect y="4" width="22" height="8" fill="#F1BF00"/></svg>
              </div>
              <span className="hub__k">Warehouse · Iberian reach</span>
              <h3>Madrid, Spain</h3>
              <div className="hub__meta">
                <div><small>Facility</small><b>Insured · Bonded</b></div>
                <div><small>Lanes</small><b>Road · Air</b></div>
              </div>
            </div>
           </div>
          </Reveal>

          <Reveal>
            <Link className="more-link" href="/about">More about CTL and our network <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
          </Reveal>
        </div>
      </section>

      <Reveal as="section" className="pad">
        <div className="wrap">
          <div className="cta">
            <img className="bg" src="/img/generated/warehouse.jpg" alt="" />
            <div className="cta__grid">
              <div>
                <span className="eyebrow" style={{ color: 'rgba(255,255,255,.7)' }}>Ready to ship</span>
                <h2 style={{ marginTop: 16 }}>Give us the cargo.<br />We&apos;ll give you the <span className="em">certainty.</span></h2>
                <p>Get a tailored quote, track a live shipment, or speak to a logistics specialist — available 24 hours a day, 365 days a year.</p>
              </div>
              <div className="cta__actions">
                <Link className="btn btn--red" href="/contact">Request a quote <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></Link>
                <Link className="btn btn--white" href="/tracking">Track a shipment</Link>
                <span className="cta__note">info@ctlcouriers.com · 24 / 7 / 365</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </SiteShell>
  );
}
