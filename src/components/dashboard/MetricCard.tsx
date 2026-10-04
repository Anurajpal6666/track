import React from "react";
import { Card } from "@/components/ui/Card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  badgeText?: string;
  progressPercent?: number;
  variant?: "blue" | "green" | "amber" | "gold" | "silver" | "bronze" | "default";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  progressPercent,
  variant = "blue",
}) => {
  const accentColors = {
    blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
    gold: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
    green: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800",
    silver: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700",
    bronze: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
    default: "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700",
  };

  return (
    <Card variant="default" className="p-4 sm:p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
          <div className={`p-2 rounded-lg border ${accentColors[variant]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">{value}</span>
          {badgeText && (
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
              {badgeText}
            </span>
          )}
        </div>

        {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>

      {progressPercent !== undefined && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-1">
            <span>Progress</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-blue-600 transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};
