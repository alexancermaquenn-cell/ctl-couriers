'use client';

import { useState } from 'react';
import { SiteShell } from '@/components/site/SiteShell';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

function QuoteForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="form-card">
        <div className="form-ok">
          <div className="chk">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="m5 13 4 4L19 7" />
            </svg>
          </div>
          <h3>Request received</h3>
          <p>
            Thank you — your request has been sent to our team. We&apos;ll be in touch by email shortly with your quote.
          </p>
          <button className="btn btn--ghost" type="button" onClick={() => setSent(false)}>
            Send another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-card">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!e.currentTarget.checkValidity()) {
            e.currentTarget.reportValidity();
            return;
          }
          setSent(true);
        }}
      >
        <h2>Request a quote</h2>
        <p>Tell us about your shipment and we&apos;ll respond with pricing and the right service.</p>
        <div className="fld--row">
          <div className="fld">
            <label htmlFor="name">Full name</label>
            <input id="name" name="name" type="text" placeholder="Jane Andersen" required />
          </div>
          <div className="fld">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@company.com" required />
          </div>
        </div>
        <div className="fld">
          <label htmlFor="service">Service</label>
          <select id="service" name="service" required defaultValue="">
            <option value="" disabled>
              Select a service…
            </option>
            <option>Cargo Transport Service (CTS)</option>
            <option>Motor Vehicle Relocation (MVR)</option>
            <option>Freight Delivery</option>
            <option>Parcel Delivery</option>
            <option>Letter &amp; Document Delivery</option>
            <option>Warehousing</option>
            <option>SafeDeal escrow</option>
          </select>
        </div>
        <div className="fld">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Origin, destination, what you need to move, timeframe…"
            required
          ></textarea>
        </div>
        <button className="btn btn--red" type="submit">
          Send request
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <p className="form-note">We typically respond within one business day. Available 24 / 7 · 365 days.</p>
      </form>
    </div>
  );
}

export default function ContactPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Get in touch" title="Contact us" crumb="Contact">
        <p>
          Available 24 hours a day, 365 days a year. Tell us what you need to move and our team will come back with a
          quote and the right service for your consignment.
        </p>
      </PageHero>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="contact-grid">
            <div>
              <div className="eyebrow">Reach us</div>
              <h2
                style={{
                  fontFamily: "var(--font-manrope),sans-serif",
                  fontWeight: 800,
                  fontSize: 'clamp(26px,3vw,36px)',
                  letterSpacing: '-.02em',
                  lineHeight: 1.1,
                  margin: '12px 0 24px',
                }}
              >
                Contact information
              </h2>
              <div className="ci-list">
                <div className="ci">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M4 5h16v14H4z" />
                      <path d="m4 6 8 6 8-6" />
                    </svg>
                  </span>
                  <span>
                    <span className="lbl">Email support</span>
                    <span className="val">
                      <a href="mailto:info@ctl-couriers-ltd.com">info@ctl-couriers-ltd.com</a>
                    </span>
                    <span className="sub">The fastest way to reach our customer-care team.</span>
                  </span>
                </div>
                <div className="ci">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                  </span>
                  <span>
                    <span className="lbl">Availability</span>
                    <span className="val">24 hours · 7 days · 365 days</span>
                    <span className="sub">We meet urgent shipping needs around the clock, every day of the year.</span>
                  </span>
                </div>
                <div className="ci">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </span>
                  <span>
                    <span className="lbl">Warehouses</span>
                    <span className="val">Oslo · Copenhagen · Milan</span>
                    <span className="sub">Insured, secured and bonded facilities across Norway, Denmark and Italy.</span>
                  </span>
                </div>
                <div className="ci">
                  <span className="ic">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18" />
                      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
                    </svg>
                  </span>
                  <span>
                    <span className="lbl">Global reach</span>
                    <span className="val">190+ countries served</span>
                    <span className="sub">Operating across North &amp; South America, Europe, Asia and Australia.</span>
                  </span>
                </div>
              </div>
            </div>

            <QuoteForm />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="net-panel">
            <div className="eyebrow">Global network</div>
            <h2>A worldwide logistics network</h2>
            <p>
              Three bonded warehouse hubs anchor an operation that reaches 190+ countries. Wherever your shipment starts,
              our network moves it — overnight, tracked, and on time.
            </p>
            <div className="hubs">
              <div className="hub">
                <div className="k">Hub · Norway</div>
                <div className="city">Oslo</div>
                <div className="cty">Northern Europe gateway</div>
              </div>
              <div className="hub">
                <div className="k">Hub · Denmark</div>
                <div className="city">Copenhagen</div>
                <div className="cty">Scandinavian distribution</div>
              </div>
              <div className="hub">
                <div className="k">Hub · Italy</div>
                <div className="city">Milan</div>
                <div className="cty">Southern Europe &amp; Mediterranean</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </SiteShell>
  );
}
