"use client";

import React from "react";
import { CodingProblem } from "@/lib/types";

interface HeatmapCalendarProps {
  problems: CodingProblem[];
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({ problems }) => {
  // Count solves per date
  const countsByDate = new Map<string, number>();
  problems.forEach((p) => {
    if (p.dateSolved) {
      countsByDate.set(p.dateSolved, (countsByDate.get(p.dateSolved) || 0) + 1);
    }
  });

  // Generate 16 weeks of calendar blocks ending at current date
  const weeks: { dateStr: string; dayOfMonth: number; count: number; dayOfWeek: number }[][] = [];
  const today = new Date();

  // Create 120 days array
  const totalDays = 112; // 16 weeks * 7 days
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - totalDays + 1);

  let currentWeek: { dateStr: string; dayOfMonth: number; count: number; dayOfWeek: number }[] = [];

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const count = countsByDate.get(dateStr) || 0;

    currentWeek.push({
      dateStr,
      dayOfMonth: d.getDate(),
      count,
      dayOfWeek: d.getDay(),
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-sap-charcoal border border-sap-border/40";
    if (count === 1) return "bg-sap-gold-muted/40 border border-sap-gold/30";
    if (count === 2) return "bg-sap-gold/60 border border-sap-gold/60";
    return "bg-sap-gold border border-sap-gold-light";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-sap-silver">
        <span>16-Week Consistency Heatmap</span>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span>Less</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-sap-charcoal border border-sap-border" />
          <div className="w-2.5 h-2.5 rounded-sm bg-sap-gold-muted/40" />
          <div className="w-2.5 h-2.5 rounded-sm bg-sap-gold/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-sap-gold" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex gap-1.5 min-w-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day) => (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.count} solved`}
                  className={`w-3.5 h-3.5 rounded-sm transition-all hover:scale-125 cursor-pointer ${getHeatmapColor(
                    day.count
                  )}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
