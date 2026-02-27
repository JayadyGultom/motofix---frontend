import React from 'react';
import { Hexagon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  className, 
  iconSize = 32, 
  textSize = "text-2xl",
  showText = true 
}) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-brand-orange/20 blur-md rounded-full" />
        <div className="relative bg-brand-dark border border-brand-orange/50 p-2 rounded-xl">
          <Hexagon size={iconSize} className="text-brand-orange fill-brand-orange/10" />
        </div>
      </div>
      {showText && (
        <h1 className={cn("font-display font-bold tracking-tighter", textSize)}>
          <span className="text-white">MOTO</span>
          <span className="text-brand-orange">FIX</span>
        </h1>
      )}
    </div>
  );
};
