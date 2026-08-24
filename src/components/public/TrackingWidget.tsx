'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Search, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrackingWidget({ demo = 'CTL-4830-2291' }: { demo?: string }) {
  const router = useRouter();
  const [num, setNum] = useState('');

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (num.trim()) router.push(`/tracking?n=${encodeURIComponent(num.trim())}`);
  };

  return (
    <section className="container-x -mt-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass rounded-[18px] p-6 sm:p-8 glow-red"
      >
        <div className="flex items-center gap-2 text-accent-bright mb-3">
          <Package size={18} />
          <span className="text-sm font-medium">Live shipment tracking</span>
        </div>
        <form onSubmit={go} className="flex flex-col sm:flex-row gap-3">
          <input
            value={num}
            onChange={(e) => setNum(e.target.value)}
            placeholder="Enter your tracking number…"
            className="flex-1 h-13 min-h-[52px] rounded-[12px] bg-bg-elev border border-border px-4 text-fg placeholder:text-fg-subtle focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40 transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 h-[52px] px-7 rounded-[12px] bg-accent text-white font-medium hover:bg-accent-bright transition-colors glow-red"
          >
            <Search size={18} /> Track
          </button>
        </form>
        <button
          type="button"
          onClick={() => router.push(`/tracking?n=${demo}`)}
          className="mt-3 text-xs text-fg-subtle hover:text-fg-muted transition-colors"
        >
          Try a demo: <span className="font-mono text-accent-bright">{demo}</span>
        </button>
      </motion.div>
    </section>
  );
}
