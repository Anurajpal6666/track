import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "blue" | "gold";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = "gold",
  size = "md",
  icon,
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-xs sm:text-sm px-3.5 py-2 gap-2",
    lg: "text-sm sm:text-base px-5 py-2.5 gap-2.5",
  };

  const variantStyles = {
    gold: "bg-[#C5A059] text-[#080A0F] font-bold hover:bg-[#D8B668] shadow-sm active:scale-[0.98]",
    primary: "bg-[#C5A059] text-[#080A0F] font-bold hover:bg-[#D8B668] shadow-sm active:scale-[0.98]",
    secondary: "bg-[#141A26] text-slate-200 hover:bg-slate-800 border border-white/[0.08] active:scale-[0.98]",
    outline: "bg-transparent text-slate-300 border border-white/[0.12] hover:border-[#C5A059]/60 hover:text-white active:scale-[0.98]",
    blue: "bg-[#1B3654] text-slate-100 hover:bg-[#2B527E] border border-white/[0.08] active:scale-[0.98]",
    ghost: "bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-slate-100",
    danger: "bg-rose-950/40 text-rose-300 border border-rose-900/60 hover:bg-rose-900/50 active:scale-[0.98]",
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
      ) : (
        icon && <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
