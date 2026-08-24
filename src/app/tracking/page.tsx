import { SiteShell } from '@/components/site/SiteShell';
import { PageHero } from '@/components/site/PageHero';
import { SiteTrackingView } from '@/components/site/SiteTrackingView';

export const metadata = { title: 'Track your shipment — CTL Couriers Ltd' };

export default function TrackingPage() {
  return (
    <SiteShell>
      <PageHero eyebrow="Live tracking" title="Track your shipment" crumb="Tracking">
        <p>Enter your tracking number for real-time status and checkpoints. Web-based tracking on every shipment, available 24 hours a day.</p>
      </PageHero>
      <section className="pad">
        <div className="wrap wrap--narrow">
          <SiteTrackingView />
        </div>
      </section>
    </SiteShell>
  );
}
