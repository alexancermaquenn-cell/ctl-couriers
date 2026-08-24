'use client';
import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export function ContactForm() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    // No backend — simulate a network round-trip then acknowledge.
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setName('');
    setEmail('');
    setMessage('');
    toast('success', "Message sent — we'll be in touch shortly.");
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="card p-7 flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="cf-name" className="text-sm font-medium text-fg">Name</label>
        <Input
          id="cf-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jane Doe"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="cf-email" className="text-sm font-medium text-fg">Email</label>
        <Input
          id="cf-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="jane@company.com"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="cf-message" className="text-sm font-medium text-fg">Message</label>
        <Textarea
          id="cf-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about your shipment or request a quote…"
          className="min-h-[140px]"
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={sending} className="w-full">
        {sending ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            <Send size={18} /> Send message
          </>
        )}
      </Button>
    </motion.form>
  );
}
