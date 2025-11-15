import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'pink' | 'cyan';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  onClick,
}) => {
  const variants = {
    default: 'border-kintsugi-gold bg-kintsugi-gold/5 shadow-neo',
    pink: 'border-cyber-pink bg-cyber-pink/5 shadow-neo-pink',
    cyan: 'border-cyber-cyan bg-cyber-cyan/5 shadow-[8px_8px_0px_0px_rgba(0,255,255,1)]',
  };

  return (
    <div
      className={cn(
        'border-3 p-6 transition-all',
        onClick && 'cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-none',
        variants[variant],
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
