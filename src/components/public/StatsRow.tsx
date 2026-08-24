'use client';
import { motion } from 'framer-motion';

export function StatsRow({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section className="relative border-y border-white/5 bg-bg-elev/40">
      <div className="container-x py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="text-center"
          >
            <div className="text-3xl md:text-4xl font-bold text-fg tracking-tight">
              <span className="text-accent-bright">{s.value}</span>
            </div>
            <div className="mt-1 text-sm text-fg-muted">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
