'use client';
import { cn } from '@/lib/utils';
import { TextareaHTMLAttributes, forwardRef } from 'react';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-[10px] bg-bg-elev border border-border px-3.5 py-2.5 text-sm text-fg placeholder:text-fg-subtle transition-colors min-h-[90px]',
        'focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
