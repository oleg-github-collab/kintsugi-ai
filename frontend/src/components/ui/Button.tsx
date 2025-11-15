import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) => {
  const baseStyles = 'font-mono font-bold border-3 shadow-neo transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-kintsugi-gold border-digital-black text-digital-black hover:bg-kintsugi-gold/90',
    secondary: 'bg-cyber-pink border-digital-black text-digital-white hover:bg-cyber-pink/90',
    danger: 'bg-neon-orange border-digital-black text-digital-white hover:bg-neon-orange/90',
    ghost: 'bg-transparent border-kintsugi-gold text-kintsugi-gold hover:bg-kintsugi-gold/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-4 text-lg min-h-[56px]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
};
