import React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
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
      <textarea
        className={cn(
          'w-full px-4 py-3 font-mono',
          'bg-digital-black border-3 border-kintsugi-gold',
          'text-digital-white placeholder:text-digital-white/40',
          'shadow-neo focus:shadow-neo-pink',
          'outline-none transition-all resize-none',
          'min-h-[120px]',
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
