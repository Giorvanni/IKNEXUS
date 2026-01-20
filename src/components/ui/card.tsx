import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, style }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white dark:bg-gray-800 p-8 border border-ik-gold/10 dark:border-ik-gold/20',
        'shadow-md hover:shadow-xl transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)',
        hover && 'hover:-translate-y-2 hover:border-ik-gold/30 hover:shadow-2xl dark:hover:shadow-ik-gold/10',
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('text-ik-charcoal dark:text-gray-200', className)}>{children}</div>;
}
