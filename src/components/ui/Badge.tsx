import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Priority, Difficulty } from "@/lib/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "green" | "amber" | "red" | "neutral" | "blue";
  size?: "xs" | "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "gold",
  size = "xs",
  className,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded border uppercase tracking-wider font-mono flex-shrink-0 whitespace-nowrap";

  const sizeStyles = {
    xs: "text-[9px] px-1.5 py-0.2",
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const variantStyles = {
    gold: "bg-[#C5A059]/15 text-[#D8B668] border-[#C5A059]/30",
    blue: "bg-[#1B3654]/60 text-slate-200 border-[#2B527E]/50",
    green: "bg-emerald-950/40 text-emerald-300 border-emerald-900/60",
    amber: "bg-amber-950/40 text-amber-300 border-amber-900/60",
    red: "bg-rose-950/40 text-rose-300 border-rose-900/60",
    neutral: "bg-white/[0.04] text-slate-400 border-white/[0.06]",
  };

  return (
    <span className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}>
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; size?: "xs" | "sm" | "md"; className?: string }> = ({
  priority,
  size = "xs",
  className,
}) => {
  switch (priority) {
    case "CRITICAL":
      return <Badge variant="red" size={size} className={className}>CRITICAL</Badge>;
    case "HIGH":
      return <Badge variant="amber" size={size} className={className}>HIGH</Badge>;
    case "MEDIUM":
      return <Badge variant="blue" size={size} className={className}>MED</Badge>;
    case "LOW":
      return <Badge variant="neutral" size={size} className={className}>LOW</Badge>;
  }
};

export const DifficultyBadge: React.FC<{ difficulty: Difficulty; size?: "xs" | "sm" | "md"; className?: string }> = ({
  difficulty,
  size = "xs",
  className,
}) => {
  switch (difficulty) {
    case "HARD":
      return <Badge variant="red" size={size} className={className}>HARD</Badge>;
    case "MEDIUM":
      return <Badge variant="amber" size={size} className={className}>MED</Badge>;
    case "EASY":
      return <Badge variant="green" size={size} className={className}>EASY</Badge>;
  }
};
