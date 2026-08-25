import Link from 'next/link';
import { SiteShell } from '@/components/site/SiteShell';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

export const metadata = {
  title: 'SafeDeal — CTL Couriers Ltd',
  description:
    "SafeDeal — CTL's secure escrow shipping service. An impartial third party that facilitates online buying and selling, reducing fraud risk for C2C, B2C and B2B transactions worldwide.",
};

export default function SafeDealPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Secure shipping service" title="SafeDeal — buy and sell with confidence" crumb="SafeDeal">
        <p>
          An impartial third party that facilitates online buying and selling — guaranteeing security, reliance and
          convenience for both parties, and reducing the risk of fraud for buyers and sellers around the world.
        </p>
      </PageHero>

      <section className="pad">
        <div className="wrap">
          <Reveal className="sd-intro">
            <div>
              <span className="eyebrow">What SafeDeal is</span>
              <h2
                className="serif"
                style={{ fontSize: 'clamp(28px,3.4vw,46px)', letterSpacing: '-.025em', marginTop: 16, lineHeight: 1.08 }}
              >
                A trusted layer of protection between the buyer and the seller.
              </h2>
              <p style={{ color: 'var(--ink-2)', fontSize: '15.5px', marginTop: 18, maxWidth: '56ch', lineHeight: 1.7 }}>
                CTL offers SafeDeal services for buyers and sellers around the world. SafeDeal is an impartial third party
                whose task is to facilitate online buying and selling, guaranteeing security, reliance and convenience for
                both parties. It reduces the risks of fraud for those buying or selling over the Internet — whether the trade
                is <strong>consumer-to-consumer, business-to-consumer, or business-to-business</strong>.
              </p>
              <p style={{ color: 'var(--ink-2)', fontSize: '15.5px', marginTop: 14, maxWidth: '56ch', lineHeight: 1.7 }}>
                The buyer can inspect and approve the merchandise before any payment is released, and the seller ships with
                the assurance that funds are already held safely. No one is exposed to the other party&apos;s risk.
              </p>
              <div className="reach" style={{ marginTop: 26 }}>
                <span>Consumer to consumer</span>
                <span>Business to consumer</span>
                <span>Business to business</span>
              </div>
            </div>
            <figure className="sd-intro__fig">
              <img src="/img/generated/warehouse.jpg" alt="CTL secured warehousing and inspection facility" />
              <figcaption>
                <b>Impartial · Secured · Escrowed</b>
                <small>Payment is held in a no-interest account until the buyer approves.</small>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="safedeal pad">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">Why traders choose SafeDeal</span>
              <h2 className="serif" style={{ marginTop: 16 }}>
                Safe. Convenient.
                <br />
                Flexible.
              </h2>
            </div>
            <p>
              Three guarantees that make cross-border, stranger-to-stranger trade as dependable as dealing with someone you
              have known for years.
            </p>
          </Reveal>

          <Reveal className="sd-pillars">
            <div className="sd-pillar">
              <div className="sd-pillar__ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h4>Safe</h4>
              <h3>Verified before payment</h3>
              <p>
                The buyer checks the quality of the merchandise before authorizing payment, and allows the seller to accept
                payment safely by credit card.
              </p>
            </div>
            <div className="sd-pillar">
              <div className="sd-pillar__ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20M6 15h4" />
                </svg>
              </div>
              <h4>Convenient</h4>
              <h3>A safer alternative</h3>
              <p>A safe alternative to bank transfers, drafts or cheques when purchasing from sellers you do not yet know.</p>
            </div>
            <div className="sd-pillar">
              <div className="sd-pillar__ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 7h16M4 12h16M4 17h10" />
                  <circle cx="18" cy="17" r="2.5" />
                </svg>
              </div>
              <h4>Flexible</h4>
              <h3>Terms that adapt</h3>
              <p>SafeDeal adapts to the client&apos;s requirements — seller and buyer agree their terms clearly and efficiently.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pad">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">The escrow process</span>
              <h2 className="serif" style={{ marginTop: 16 }}>
                Five steps, zero exposure.
              </h2>
            </div>
            <p>
              Payment never changes hands directly. CTL holds it safely from the moment of agreement until the buyer has
              examined and approved the goods.
            </p>
          </Reveal>

          <Reveal className="sd-flow">
            <div className="sd-flow__head">
              <h3 className="serif">How a SafeDeal transaction works</h3>
              <span>{'// CTL holds the funds — released only on approval'}</span>
            </div>
            <div className="stepper in" id="stepper">
              <div className="stepper__rail" />
              <div className="sd-step">
                <div className="sd-step__num">1</div>
                <h5>Agreement reached</h5>
                <p>The buyer and seller reach an agreement on the goods and the terms of the transaction.</p>
              </div>
              <div className="sd-step">
                <div className="sd-step__num">2</div>
                <h5>Buyer pays CTL</h5>
                <p>The buyer transfers the payment to CTL, where it is held in a no-interest account.</p>
              </div>
              <div className="sd-step">
                <div className="sd-step__num">3</div>
                <h5>Seller ships</h5>
                <p>The seller ships the merchandise through CTL, with full tracking on the consignment.</p>
              </div>
              <div className="sd-step">
                <div className="sd-step__num">4</div>
                <h5>Buyer approves</h5>
                <p>The buyer examines and approves the merchandise during the agreed Inspection Period.</p>
              </div>
              <div className="sd-step">
                <div className="sd-step__num">5</div>
                <h5>Seller is paid</h5>
                <p>Once the buyer approves, CTL transfers the payment to the seller. The deal is complete.</p>
              </div>
            </div>

            <div className="sd-note">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <p>
                <b>Buyer protection.</b> If the buyer is not satisfied, the goods are returned to the seller. After the seller
                confirms that the returned goods are in their original condition, SafeDeal reimburses the buyer, minus the
                SafeDeal fee.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="safedeal pad">
        <div className="wrap">
          <Reveal className="sec-head">
            <div>
              <span className="eyebrow">Getting started</span>
              <h2 className="serif" style={{ marginTop: 16 }}>
                How to use SafeDeal
              </h2>
            </div>
            <p>Registration is free and easy. From there, every transaction follows the same protected step-by-step path.</p>
          </Reveal>

          <Reveal className="guide">
            <div className="guide__row">
              <div className="guide__n">1</div>
              <div>
                <h4>Register — free &amp; easy</h4>
                <p>Create your SafeDeal account at no cost, then open a new transaction with the other party.</p>
              </div>
            </div>
            <div className="guide__row">
              <div className="guide__n">2</div>
              <div>
                <h4>Agree the transaction</h4>
                <p>Buyer and seller confirm the goods, the price and the Inspection Period for the deal.</p>
              </div>
            </div>
            <div className="guide__row">
              <div className="guide__n">3</div>
              <div>
                <h4>Buyer pays SafeDeal</h4>
                <p>The buyer pays SafeDeal by credit card, bill of exchange, banker&apos;s draft or bank transfer. Funds are held securely.</p>
              </div>
            </div>
            <div className="guide__row">
              <div className="guide__n">4</div>
              <div>
                <h4>Seller sends the goods</h4>
                <p>The seller ships the merchandise to the buyer with a tracked, traceable service.</p>
              </div>
            </div>
            <div className="guide__row">
              <div className="guide__n">5</div>
              <div>
                <h4>Buyer approves within the Inspection Period</h4>
                <p>The buyer examines the goods and approves the acquisition before the Inspection Period ends.</p>
              </div>
            </div>
            <div className="guide__row">
              <div className="guide__n">6</div>
              <div>
                <h4>Seller is paid</h4>
                <p>On approval, SafeDeal releases the payment to the seller and the transaction is closed.</p>
              </div>
            </div>
          </Reveal>

          <h3 className="serif" style={{ fontSize: 'clamp(20px,2.2vw,28px)', marginTop: 'clamp(40px,4vw,60px)' }}>
            Accepted methods of payment
          </h3>
          <Reveal className="methods">
            <div className="method">
              <div className="method__ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <path d="M2 10h20M6 15h4" />
                </svg>
              </div>
              <h4>Credit card</h4>
              <p>Pay instantly and securely by card. The client must be the card holder.</p>
              <span className="mono">VISA · MASTERCARD</span>
            </div>
            <div className="method">
              <div className="method__ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="16" rx="1.5" />
                  <path d="M7 9h10M7 13h6M7 17h4" />
                </svg>
              </div>
              <h4>Bill of exchange</h4>
              <p>Settle the transaction through a formal bill of exchange instrument.</p>
              <span className="mono">Instrument</span>
            </div>
            <div className="method">
              <div className="method__ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 5h16v14H4z" />
                  <path d="M4 9h16M8 14h5" />
                </svg>
              </div>
              <h4>Banker&apos;s draft</h4>
              <p>A bank-guaranteed draft made payable to SafeDeal for the agreed amount.</p>
              <span className="mono">Bank-guaranteed</span>
            </div>
            <div className="method">
              <div className="method__ic">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M5 21V11M19 21V11M3 11l9-6 9 6M9 21v-5h6v5" />
                </svg>
              </div>
              <h4>Bank transfer</h4>
              <p>Transfer funds directly to the SafeDeal account shown on your transaction page.</p>
              <span className="mono">Direct transfer</span>
            </div>
          </Reveal>

          <Reveal className="sd-note" style={{ marginTop: 'clamp(30px,3.4vw,46px)' }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            <p>
              <b>A note on fees.</b> SafeDeal charges a service fee for each transaction. Once the payment is received,{' '}
              <b>the SafeDeal service fee is non-refundable</b>. For a full breakdown of costs, who pays the fee and when it
              is charged, see the financial questions in our{' '}
              <Link href="/faq" style={{ color: 'var(--red)', fontWeight: 700 }}>
                FAQ
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pad" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal className="cta">
            <img className="bg" src="/img/generated/hero-port.jpg" alt="" />
            <div className="cta__grid">
              <div>
                <span className="eyebrow" style={{ color: '#fca5a5' }}>
                  Ready to trade safely?
                </span>
                <h2 style={{ marginTop: 14 }}>
                  Open a <span className="em">SafeDeal</span> transaction today.
                </h2>
                <p>
                  Register free, agree your terms and let CTL hold the funds until the goods are approved. Buy and sell across
                  190+ countries without the risk.
                </p>
              </div>
              <div className="cta__actions">
                <Link className="btn btn--red" href="/contact">
                  Start a SafeDeal{' '}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link className="btn btn--white" href="/faq">
                  Read the FAQ
                </Link>
                <span className="cta__note">info@ctlcouriers.com · 24 / 7</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </SiteShell>
  );
}
