import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "interactive" | "subtle" | "bordered";
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = "default",
  hoverEffect = false,
  ...props
}) => {
  const baseStyles = "rounded-xl border transition-all duration-200";

  const variantStyles = {
    default: "bg-[#0E121B] border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)]",
    surface: "bg-[#141A26] border-white/[0.08] shadow-sm",
    interactive: "bg-[#0E121B] border-white/[0.08] hover:border-[#C5A059]/40 cursor-pointer",
    subtle: "bg-[#141A26]/40 border-white/[0.04]",
    bordered: "bg-transparent border-white/[0.08]",
  };

  const hoverStyles = hoverEffect ? "hover:border-[#C5A059]/50 hover:shadow-lg hover:-translate-y-0.5" : "";

  return (
    <div
      className={twMerge(clsx(baseStyles, variantStyles[variant], hoverStyles, className))}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={twMerge(clsx("p-4 sm:p-5 pb-3 border-b border-white/[0.06] flex items-center justify-between", className))} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => (
  <h3 className={twMerge(clsx("text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2", className))} {...props}>
    {children}
  </h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => (
  <div className={twMerge(clsx("p-4 sm:p-5", className))} {...props}>
    {children}
  </div>
);
