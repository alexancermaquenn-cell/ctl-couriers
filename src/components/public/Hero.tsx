'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import type { Hero as HeroData } from '@/lib/content-types';


export function Hero({ data, banner }: { data: HeroData; banner: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[92vh] flex items-center overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
        <Image src={banner} alt="" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-transparent to-transparent" />
      </motion.div>

      {/* red glow */}
      <div className="absolute top-1/4 -left-40 h-96 w-96 rounded-full bg-accent/20 blur-[120px] -z-10" />

      <motion.div style={{ opacity }} className="container-x pt-28 pb-16">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 text-xs font-medium tracking-wide text-accent-bright bg-accent/10 border border-accent/20 rounded-full px-3 py-1.5 mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-bright animate-pulse" />
          {data.eyebrow ?? 'Available 24/7 · 365 days a year'}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
        >
          {data.title ?? 'Reliable Shipping Solutions Across the Globe'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg text-fg-muted leading-relaxed"
        >
          {data.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-9 flex flex-wrap items-center gap-3"
        >
          <Link
            href={data.ctaPrimary?.href ?? '/tracking'}
            className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] bg-accent text-white font-medium hover:bg-accent-bright transition-colors glow-red"
          >
            <Search size={18} /> {data.ctaPrimary?.label ?? 'Track a Shipment'}
          </Link>
          <Link
            href={data.ctaSecondary?.href ?? '/contact'}
            className="inline-flex items-center gap-2 h-12 px-7 rounded-[10px] border border-border bg-bg-card/50 backdrop-blur text-fg font-medium hover:border-accent/50 transition-colors"
          >
            {data.ctaSecondary?.label ?? 'Get a Quote'} <ArrowRight size={16} />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
