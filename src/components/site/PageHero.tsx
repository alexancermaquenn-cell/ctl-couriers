import Link from 'next/link';

export function PageHero({
  eyebrow,
  title,
  crumb,
  children,
}: {
  eyebrow: string;
  title: string;
  crumb: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="pagehero">
      <div className="wrap">
        <div className="pagehero__crumbs">
          <Link href="/">Home</Link> / {crumb}
        </div>
        <span className="eyebrow" style={{ marginTop: 16, display: 'inline-block' }}>{eyebrow}</span>
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}
