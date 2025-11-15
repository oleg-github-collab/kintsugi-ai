import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'cyan' | 'pink';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'default',
  className,
  ...props
}) => {
  const variants = {
    default: 'border-kintsugi-gold focus:border-kintsugi-gold focus:shadow-neo',
    cyan: 'border-cyber-cyan focus:border-cyber-cyan focus:shadow-neo-cyan',
    pink: 'border-cyber-pink focus:border-cyber-pink focus:shadow-neo-pink',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono font-bold text-kintsugi-gold mb-2 uppercase">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 font-mono',
          'bg-digital-black border-3',
          'text-digital-white placeholder:text-digital-white/40',
          'outline-none transition-all',
          'min-h-[48px]',
          variants[variant],
          error && 'border-neon-orange shadow-none',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm font-mono text-neon-orange uppercase">⚠ {error}</p>
      )}
    </div>
  );
};
