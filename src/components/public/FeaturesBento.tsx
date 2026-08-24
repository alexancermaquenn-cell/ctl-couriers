'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Radar, ShieldCheck, Clock, Globe2 } from 'lucide-react';

const ICONS = [Radar, Clock, ShieldCheck, Globe2];

export function FeaturesBento({ features }: { features: { title: string; desc: string }[] }) {
  return (
    <section className="container-x py-20">
      <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[200px]">
        {/* Big feature with image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="md:col-span-2 md:row-span-2 relative rounded-[16px] overflow-hidden border border-white/5 group"
        >
          <Image src="/img/sub-banner.jpg" alt="" fill className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
          <div className="absolute bottom-0 p-8">
            <p className="text-accent-bright text-sm font-medium mb-1">Integrated network</p>
            <h3 className="text-2xl font-bold max-w-sm">Air & road networks across North & South America, Europe, Asia, Australia</h3>
          </div>
        </motion.div>

        {features.slice(0, 4).map((f, i) => {
          const Ic = ICONS[i % ICONS.length];
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="card p-6 flex flex-col justify-between hover:border-accent/30 transition-colors"
            >
              <Ic className="text-accent-bright" size={22} />
              <div>
                <h4 className="font-semibold">{f.title}</h4>
                <p className="text-sm text-fg-muted mt-1">{f.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
