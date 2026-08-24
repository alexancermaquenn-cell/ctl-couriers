'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SiteShell } from '@/components/site/SiteShell';
import { PageHero } from '@/components/site/PageHero';
import { Reveal } from '@/components/site/Reveal';

type QA = { q: string; a: React.ReactNode };

const GENERAL: QA[] = [
  {
    q: 'What can I buy or sell using SafeDeal?',
    a: 'SafeDeal is an impartial third party that facilitates online buying and selling of legitimate goods between private individuals and businesses — consumer-to-consumer, business-to-consumer and business-to-business. It cannot be used for goods that are illegal or restricted, including weapons and ammunition, drugs, human organs, counterfeit goods, tobacco or unauthorised alcohol. This list is indicative and not limiting.',
  },
  {
    q: 'What is the Inspection Period?',
    a: 'The Inspection Period is the time — agreed on by the Buyer and the Seller — allowed to examine and value the goods. It begins at 12:01 on the first working day (Monday–Friday) after the goods have been delivered, and finishes after the number of working days established by the Buyer and Seller. The delivery day is the one indicated on the consignment receipt. SafeDeal pays the Seller only after the Buyer approves the acquisition or the Inspection Period is completed, whichever comes first.',
  },
  {
    q: 'How can I see the state of my transaction? Has the payment been received? Have the goods been sent?',
    a: 'Every transaction has its own page on the SafeDeal website. The e-mails you receive from us are for information only — always visit your transaction page to check the true progress of your transaction, including whether payment has been received and whether the goods have been dispatched. For security reasons SafeDeal does not send postal addresses by e-mail; send goods only to the address shown on the transaction page.',
  },
  {
    q: 'Are international purchases or sales allowed?',
    a: "Yes. SafeDeal serves buyers and sellers around the world. For any international shipment the courier's website must show both the dispatch and the delivery of the goods, and the transport service used must provide a tracking or reference number so that SafeDeal can confirm the consignment directly with the courier.",
  },
  {
    q: 'How can I change my registration information?',
    a: 'The information you supply on the SafeDeal registration page must be true and accurate, and you are required to keep it updated as part of the Service contract. You can amend your registration details from your account; if information is proven false or incorrect, SafeDeal retains the right to cancel the transaction.',
  },
  {
    q: 'I have forgotten my password — what do I do now?',
    a: 'You alone are responsible for the confidentiality of your password and for all activity originating from your account. Use the password-recovery option on the sign-in page to reset it, and notify SafeDeal immediately of any unauthorised use or breach of the privacy, confidentiality or security of your account.',
  },
  {
    q: 'How can a Buyer turn down / return the goods to the Seller?',
    a: 'If the Buyer is not satisfied within the Inspection Period, the goods are returned to the Seller. Once the Seller confirms that the returned goods are in their original condition, SafeDeal reimburses the Buyer the value of the goods minus the service fee. The Buyer is responsible for the goods and the manner of return during this process.',
  },
  {
    q: 'What happens if the Buyer denies having ever received the goods?',
    a: "SafeDeal relies on the tracking or reference number and the consignment receipt to confirm delivery. The Client's signature — or that of an agent or appointee — on the consignment receipt is the only valid proof that the goods were sent and received. If SafeDeal is not able to ascertain when the Buyer received the goods, it reserves the right to cancel the transaction and refund the net sum, after deduction of the fee, to the Buyer.",
  },
  {
    q: 'Where and how can I cancel a transaction?',
    a: 'SafeDeal reserves the right to cancel any transaction after 15 days from its start date if, by then, the Buyer and Seller have not agreed on the transaction details. Either party may also request cancellation from the transaction page; refunds of capital require the consent of both contracting parties, or apply when a transaction is fulfilled outside the Service Rules.',
  },
  {
    q: 'Sales of software: what happens if the Buyer duplicates the software and then returns the original?',
    a: "The Clients agree that their transactions must not violate any state law or the industrial and intellectual property rights that SafeDeal protects. Duplicating software and returning the original is a breach of the Service Rules; SafeDeal may, at its own discretion, terminate the Service immediately where a Client's conduct does not respect the contract.",
  },
];

const FINANCIAL: QA[] = [
  {
    q: 'How much will it cost to use SafeDeal?',
    a: 'The cost of a SafeDeal transaction is the service fee, calculated from the currency, the purchasing price and the postage & package costs of the transaction. The total — purchase price plus postage plus the SafeDeal fee — is shown clearly before you confirm, so both parties agree the terms up front.',
  },
  {
    q: 'What ways of payment does SafeDeal accept?',
    a: (
      <>
        SafeDeal accepts four methods of payment: (1) credit cards — <b>VISA</b> and <b>MASTERCARD</b>; (2) bill of
        exchange; (3) banker&apos;s draft; and (4) bank transfer. If payment is made by credit card, the Client must be the
        credit card holder. All payments are made to SafeDeal.
      </>
    ),
  },
  {
    q: "Who pays SafeDeal's service fees?",
    a: 'The service fee is agreed between the Buyer and Seller as part of the transaction terms and is included in the total that the Buyer transfers to SafeDeal. Because both parties agree the terms clearly before the transaction begins, it is always transparent who bears the fee.',
  },
  {
    q: 'When do I pay?',
    a: 'Once the Buyer and Seller reach an agreement, the Buyer transfers the payment to SafeDeal, where it is held in a no-interest account. The Seller ships the merchandise only after the payment is safely held, which is what protects both parties.',
  },
  {
    q: 'When will the payment be charged to my credit card?',
    a: 'When you pay by credit card, the amount is charged at the point you fund the transaction, and the sum is then held by SafeDeal in a no-interest account until the transaction completes. The card holder must be the Client making the payment.',
  },
  {
    q: 'How and when is the Seller paid?',
    a: 'After the Seller ships the merchandise through CTL and the Buyer examines and approves it within the Inspection Period, SafeDeal releases the payment to the Seller. SafeDeal pays only after the Buyer approves the acquisition or the Inspection Period is completed, whichever comes first.',
  },
  {
    q: "Can I be reimbursed SafeDeal's service fees if I return the goods?",
    a: "No. After the payment is received, SafeDeal's service fee is non-refundable. If a Buyer returns the goods and the Seller confirms they are in original condition, SafeDeal reimburses the Buyer the value of the goods minus the service fee.",
  },
];

function Accordion({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="acc">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={isOpen ? 'acc__item open' : 'acc__item'}>
            <button
              className="acc__q"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="ico"></span>
              <span className="qt">{it.q}</span>
            </button>
            <div className="acc__a" style={{ maxHeight: isOpen ? 600 : 0 }}>
              <div className="acc__a-in">{it.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FaqPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Help center" title="Frequently asked questions" crumb="FAQ">
        <p>
          The questions most frequently asked about our service, divided into two categories — general use and finance.
          If your question is not on the list, contact us directly and our team will help.
        </p>
      </PageHero>

      <Reveal as="section" className="section">
        <div className="wrap">
          <p className="faq-intro">
            This page shows the questions most frequently asked about our service. We have divided these questions into
            two categories: <b>general use</b> and <b>finance</b>. Click on any question to reveal the answer. If your
            question is not on the list, <Link href="/contact">contact us directly</Link>.
          </p>

          <div className="faq-group">
            <div className="faq-group__label">
              <span className="n">01</span> Questions about general use
            </div>
            <Accordion items={GENERAL} />
          </div>

          <div className="faq-group">
            <div className="faq-group__label">
              <span className="n">02</span> Financial questions
            </div>
            <Accordion items={FINANCIAL} />
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="section">
        <div className="wrap">
          <div className="helpband">
            <div>
              <h2>Still need help?</h2>
              <p>
                If your question is not on the list, our customer-care team is available 24 hours a day, 365 days a
                year. We&apos;re happy to walk you through any transaction or support request.
              </p>
            </div>
            <div className="btnrow">
              <Link className="btn btn--red" href="/support">
                Support &amp; operations
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link className="btn btn--ghost" href="/contact">
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </SiteShell>
  );
}
