import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cyan' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glitch?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  glitch = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const baseStyles = 'font-mono font-bold uppercase border-3 shadow-neo transition-all duration-200 hover:shadow-none hover:translate-x-2 hover:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    primary: 'bg-kintsugi-gold border-kintsugi-gold text-digital-black',
    secondary: 'bg-cyber-pink border-cyber-pink text-digital-black shadow-neo-pink',
    cyan: 'bg-cyber-cyan border-cyber-cyan text-digital-black shadow-neo-cyan',
    outline: 'bg-transparent border-kintsugi-gold text-kintsugi-gold hover:bg-kintsugi-gold hover:text-digital-black',
    ghost: 'bg-transparent border-digital-white/30 text-digital-white hover:border-kintsugi-gold hover:text-kintsugi-gold shadow-neo-white',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        glitch && 'hover:animate-glitch',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
