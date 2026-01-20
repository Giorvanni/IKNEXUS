import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 cubic-bezier(0.4, 0, 0.2, 1) disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ik-gold/50 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-gradient-to-r from-ik-gold to-ik-dark-gold text-white shadow-md hover:shadow-xl hover:scale-105 active:scale-95',
    secondary: 'bg-ik-cream text-ik-charcoal border border-ik-gold/30 hover:bg-ik-gold hover:text-white hover:shadow-md',
    outline: 'border border-ik-gold text-ik-charcoal dark:text-white hover:bg-ik-gold hover:text-white hover:shadow-md',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
