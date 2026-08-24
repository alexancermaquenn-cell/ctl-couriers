import { ReactNode } from 'react';
import { Ticker } from './Ticker';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Ticker />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
