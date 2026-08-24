'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="container-x py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-[20px] border border-accent/20 bg-gradient-to-br from-accent/15 via-bg-card to-bg-card p-10 md:p-14 text-center"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-accent/25 blur-[100px]" />
        <h2 className="relative text-3xl md:text-4xl font-bold tracking-tight max-w-2xl mx-auto">
          Ready to ship with speed and reliability?
        </h2>
        <p className="relative mt-4 text-fg-muted max-w-lg mx-auto">
          Guaranteed lower prices, real-time tracking, and on-time delivery for your most impossible deadlines.
        </p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-accent text-white font-medium hover:bg-accent-bright transition-colors glow-red">
            Get a Quote <ArrowRight size={16} />
          </Link>
          <Link href="/tracking" className="inline-flex items-center h-12 px-7 rounded-[10px] border border-border bg-bg-card/50 text-fg font-medium hover:border-accent/50 transition-colors">
            Track a Shipment
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
