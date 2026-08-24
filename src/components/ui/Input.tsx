'use client';
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-[10px] bg-bg-elev border border-border px-3.5 text-sm text-fg placeholder:text-fg-subtle transition-colors',
        'focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/40',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
