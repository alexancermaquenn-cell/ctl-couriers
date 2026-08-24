'use client';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { LucideProps, LucideIcon } from 'lucide-react';

interface Service { title: string; desc: string; icon?: string }

function Icon({ name, ...props }: { name?: string } & LucideProps) {
  const icons = Icons as unknown as Record<string, LucideIcon>;
  const C = (name && icons[name]) || Icons.Package;
  return <C {...props} />;
}

export function ServicesGrid({ services }: { services: Service[] }) {
  return (
    <section id="services" className="container-x py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mb-12"
      >
        <p className="text-accent-bright text-sm font-medium mb-2">What we do</p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Full-spectrum logistics, one partner
        </h2>
        <p className="mt-3 text-fg-muted">
          From critical freight to door-to-door vehicle relocation — monitored around the clock.
        </p>
      </motion.div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass rounded-[14px] p-6 group hover:border-accent/30 transition-colors"
          >
            <div className="grid place-items-center h-12 w-12 rounded-xl bg-accent/12 text-accent-bright mb-4 group-hover:bg-accent/20 transition-colors">
              <Icon name={s.icon} size={22} />
            </div>
            <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
            <p className="text-sm text-fg-muted leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
