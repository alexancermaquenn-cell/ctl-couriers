'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function AboutSection({ data }: { data: { title?: string; body?: string } }) {
  return (
    <section className="container-x py-20">
      <div className="grid gap-12 lg:grid-cols-2 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-accent-bright text-sm font-medium mb-2">Who we are</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
            {data.title ?? 'A logistics partner you can rely on'}
          </h2>
          <p className="text-fg-muted leading-relaxed">{data.body}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative aspect-[4/3] rounded-[16px] overflow-hidden border border-white/5 glow-red"
        >
          <Image src="/img/banner.jpg" alt="" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-tr from-bg/60 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
