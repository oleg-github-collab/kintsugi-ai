import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono font-bold text-kintsugi-gold mb-2">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 font-mono',
          'bg-digital-black border-3 border-kintsugi-gold',
          'text-digital-white placeholder:text-digital-white/40',
          'shadow-neo focus:shadow-neo-pink',
          'outline-none transition-all',
          'min-h-[48px]',
          error && 'border-neon-orange shadow-none',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm font-mono text-neon-orange">{error}</p>
      )}
    </div>
  );
};
