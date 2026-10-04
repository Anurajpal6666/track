"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodingProblem } from "@/lib/types";
import {
  Flame,
  Calendar as CalendarIcon,
  Trophy,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  BarChart3,
  CalendarDays,
} from "lucide-react";

interface LeetCodeCalendarProps {
  problems: CodingProblem[];
  selectedDate?: string | null;
  onSelectDate?: (dateStr: string | null) => void;
  candidateName: string;
}

// 269-Day Mission Month Definitions (4 October 2026 to 1 July 2027)
const MISSION_MONTHS = [
  { key: "2026-10", name: "October 2026", year: 2026, month: 9, days: 31, startDay: 4 },
  { key: "2026-11", name: "November 2026", year: 2026, month: 10, days: 30, startDay: 1 },
  { key: "2026-12", name: "December 2026", year: 2026, month: 11, days: 31, startDay: 1 },
  { key: "2027-01", name: "January 2027", year: 2027, month: 0, days: 31, startDay: 1 },
  { key: "2027-02", name: "February 2027", year: 2027, month: 1, days: 28, startDay: 1 },
  { key: "2027-03", name: "March 2027", year: 2027, month: 2, days: 31, startDay: 1 },
  { key: "2027-04", name: "April 2027", year: 2027, month: 3, days: 30, startDay: 1 },
  { key: "2027-05", name: "May 2027", year: 2027, month: 4, days: 31, startDay: 1 },
  { key: "2027-06", name: "June 2027", year: 2027, month: 5, days: 30, startDay: 1 },
  { key: "2027-07", name: "July 2027", year: 2027, month: 6, days: 1, startDay: 1, endDay: 1 },
];

export const LeetCodeCalendar: React.FC<LeetCodeCalendarProps> = ({
  problems,
  selectedDate,
  onSelectDate,
  candidateName,
}) => {
  // Calendar View Mode: "month" | "year" | "heatmap"
  const [viewMode, setViewMode] = useState<"month" | "year" | "heatmap">("month");

  // Selected Month (Default to current month or October 2026)
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const initialMonthKey = MISSION_MONTHS.some((m) => m.key === currentMonthKey)
    ? currentMonthKey
    : "2026-10";
  const [activeMonthKey, setActiveMonthKey] = useState<string>(initialMonthKey);

  // Selected Year for year view
  const [selectedYear, setSelectedYear] = useState<2026 | 2027 | "all">(2026);

  // Tooltip / hover day state
  const [hoveredDay, setHoveredDay] = useState<{
    dateStr: string;
    count: number;
    problems: CodingProblem[];
  } | null>(null);

  // Solves map by date (YYYY-MM-DD)
  const solvesByDate = useMemo(() => {
    const map = new Map<string, CodingProblem[]>();
    problems.forEach((p) => {
      if (p.status === "SOLVED" && p.dateSolved) {
        const existing = map.get(p.dateSolved) || [];
        existing.push(p);
        map.set(p.dateSolved, existing);
      }
    });
    return map;
  }, [problems]);

  // Overall candidate stats
  const overallStats = useMemo(() => {
    const activeDates = Array.from(solvesByDate.keys()).sort();
    const activeDaysCount = activeDates.length;

    let maxStreak = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    activeDates.forEach((dateStr) => {
      const curr = new Date(dateStr);
      if (prevDate) {
        const diffMs = curr.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) tempStreak++;
        else tempStreak = 1;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      prevDate = curr;
    });

    // Current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let currentStreak = 0;
    let checkDate = solvesByDate.has(todayStr)
      ? new Date(today)
      : solvesByDate.has(yesterdayStr)
      ? new Date(yesterday)
      : null;

    if (checkDate) {
      while (true) {
        const checkStr = checkDate.toISOString().split("T")[0];
        if (solvesByDate.has(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      totalSolves: problems.filter((p) => p.status === "SOLVED").length,
      activeDaysCount,
      currentStreak,
      maxStreak: Math.max(maxStreak, currentStreak),
    };
  }, [problems, solvesByDate]);

  // Month-by-Month summary data for Year View
  const monthsData = useMemo(() => {
    return MISSION_MONTHS.map((m) => {
      let monthSolvesCount = 0;
      let activeDaysCount = 0;

      for (let day = 1; day <= m.days; day++) {
        const dayStr = `${m.year}-${String(m.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayProblems = solvesByDate.get(dayStr) || [];
        if (dayProblems.length > 0) {
          monthSolvesCount += dayProblems.length;
          activeDaysCount += 1;
        }
      }

      const activeRatio = Math.round((activeDaysCount / m.days) * 100);

      return {
        ...m,
        totalSolves: monthSolvesCount,
        activeDays: activeDaysCount,
        activeRatio,
      };
    });
  }, [solvesByDate]);

  // Active month detailed calendar days
  const activeMonthConfig = useMemo(() => {
    return MISSION_MONTHS.find((m) => m.key === activeMonthKey) || MISSION_MONTHS[0];
  }, [activeMonthKey]);

  // Generate calendar grid matrix for active month (Sun-Sat)
  const activeMonthMatrix = useMemo(() => {
    const year = activeMonthConfig.year;
    const month = activeMonthConfig.month; // 0-indexed

    // First day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const matrix: Array<
      Array<{
        dayNumber: number | null;
        dateStr: string | null;
        count: number;
        problems: CodingProblem[];
        isToday: boolean;
        isMissionDay: boolean;
      }>
    > = [];

    const todayStr = new Date().toISOString().split("T")[0];
    let currentWeek: Array<{
      dayNumber: number | null;
      dateStr: string | null;
      count: number;
      problems: CodingProblem[];
      isToday: boolean;
      isMissionDay: boolean;
    }> = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      currentWeek.push({
        dayNumber: null,
        dateStr: null,
        count: 0,
        problems: [],
        isToday: false,
        isMissionDay: false,
      });
    }

    // Days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const dayProblems = solvesByDate.get(dateStr) || [];
      const isToday = dateStr === todayStr;

      // Mission timeframe check: 2026-10-04 to 2027-07-01
      const isBeforeMission = year === 2026 && month === 9 && day < 4;
      const isAfterMission = year === 2027 && (month > 6 || (month === 6 && day > 1));
      const isMissionDay = !isBeforeMission && !isAfterMission;

      currentWeek.push({
        dayNumber: day,
        dateStr,
        count: dayProblems.length,
        problems: dayProblems,
        isToday,
        isMissionDay,
      });

      if (currentWeek.length === 7) {
        matrix.push(currentWeek);
        currentWeek = [];
      }
    }

    // Trailing empty cells
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          dayNumber: null,
          dateStr: null,
          count: 0,
          problems: [],
          isToday: false,
          isMissionDay: false,
        });
      }
      matrix.push(currentWeek);
    }

    return matrix;
  }, [activeMonthConfig, solvesByDate]);

  // Full 269-Day Rolling Heatmap Data
  const heatmapData = useMemo(() => {
    // Start date: 2026-10-04
    const startDate = new Date(2026, 9, 4);
    // Align startDate backward to Sunday
    const startSunday = new Date(startDate);
    startSunday.setDate(startDate.getDate() - startDate.getDay());

    // End date: 2027-07-01
    const endDate = new Date(2027, 6, 1);
    // Align endDate forward to Saturday
    const endSaturday = new Date(endDate);
    endSaturday.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const weeks: Array<
      Array<{
        date: Date;
        dateStr: string;
        count: number;
        isToday: boolean;
        isMissionRange: boolean;
      }>
    > = [];

    let currentWeek: Array<{
      date: Date;
      dateStr: string;
      count: number;
      isToday: boolean;
      isMissionRange: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split("T")[0];
    const cursor = new Date(startSunday);

    while (cursor <= endSaturday) {
      const dateStr = cursor.toISOString().split("T")[0];
      const count = solvesByDate.get(dateStr)?.length || 0;
      const isToday = dateStr === todayStr;
      const isMissionRange = cursor >= startDate && cursor <= endDate;

      currentWeek.push({
        date: new Date(cursor),
        dateStr,
        count,
        isToday,
        isMissionRange,
      });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [solvesByDate]);

  // Precise month start week indices for heatmap headers (prevents any overlapping)
  const monthHeaderPositions = useMemo(() => {
    const positions: Array<{ key: string; label: string; weekIndex: number }> = [];
    const seenMonths = new Set<string>();

    heatmapData.forEach((week, wIdx) => {
      for (const day of week) {
        if (day.isMissionRange) {
          const monthKey = day.dateStr.slice(0, 7);
          if (!seenMonths.has(monthKey)) {
            seenMonths.add(monthKey);
            const monthConfig = MISSION_MONTHS.find((m) => m.key === monthKey);
            positions.push({
              key: monthKey,
              label: monthConfig ? monthConfig.name.split(" ")[0].slice(0, 3) : monthKey.slice(5),
              weekIndex: wIdx,
            });
            break;
          }
        }
      }
    });

    return positions;
  }, [heatmapData]);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const curIdx = MISSION_MONTHS.findIndex((m) => m.key === activeMonthKey);
    if (curIdx > 0) {
      setActiveMonthKey(MISSION_MONTHS[curIdx - 1].key);
    }
  };

  const handleNextMonth = () => {
    const curIdx = MISSION_MONTHS.findIndex((m) => m.key === activeMonthKey);
    if (curIdx < MISSION_MONTHS.length - 1) {
      setActiveMonthKey(MISSION_MONTHS[curIdx + 1].key);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-4">
      {/* Top Header: Title, Candidate Badge & Streak Counters */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-3.5 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-[#C5A059]" />
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              LeetCode Submission Calendar
            </h3>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
              {candidateName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Mission 2027 Timeline (4 Oct 2026 &rarr; 1 Jul 2027 &bull; 269 Days)
          </p>
        </div>

        {/* 3 Metric Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-[#141A26] border border-white/[0.07] flex items-center gap-2">
            <Award className="w-3.5 h-3.5 text-slate-300" />
            <div>
              <span className="text-xs font-mono font-bold text-slate-100">
                {overallStats.activeDaysCount}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">Active Days</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#141A26] border border-[#C5A059]/30 flex items-center gap-2 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.06)]">
            <Flame className="w-3.5 h-3.5 text-[#D8B668] animate-pulse" />
            <div>
              <span className="text-xs font-mono font-bold text-[#D8B668]">
                {overallStats.currentStreak}
              </span>
              <span className="text-[10px] text-slate-300 ml-1">Day Streak</span>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#141A26] border border-white/[0.07] flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <div>
              <span className="text-xs font-mono font-bold text-slate-100">
                {overallStats.maxStreak}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">Max Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs: Month View | Year Breakdown | 269-Day Heatmap */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#141A26] p-1.5 rounded-xl border border-white/[0.06]">
        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setViewMode("month")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              viewMode === "month"
                ? "bg-[#C5A059] text-[#080A0F] font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Month Calendar</span>
          </button>

          <button
            onClick={() => setViewMode("year")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              viewMode === "year"
                ? "bg-[#C5A059] text-[#080A0F] font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Monthly Performance</span>
          </button>

          <button
            onClick={() => setViewMode("heatmap")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
              viewMode === "heatmap"
                ? "bg-[#C5A059] text-[#080A0F] font-bold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Full 269-Day Heatmap</span>
          </button>
        </div>

        {/* Month Dropdown / Navigator in Month View */}
        {viewMode === "month" && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={handlePrevMonth}
              disabled={MISSION_MONTHS.findIndex((m) => m.key === activeMonthKey) === 0}
              className="p-1 rounded-lg bg-[#0E121B] border border-white/[0.06] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={activeMonthKey}
              onChange={(e) => setActiveMonthKey(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg bg-[#0E121B] border border-white/[0.08] text-[#D8B668] font-bold focus:outline-none focus:border-[#C5A059]"
            >
              {MISSION_MONTHS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleNextMonth}
              disabled={
                MISSION_MONTHS.findIndex((m) => m.key === activeMonthKey) ===
                MISSION_MONTHS.length - 1
              }
              className="p-1 rounded-lg bg-[#0E121B] border border-white/[0.06] text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Year Selector in Year View */}
        {viewMode === "year" && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedYear(2026)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedYear === 2026
                  ? "bg-[#C5A059] text-[#080A0F]"
                  : "bg-[#0E121B] text-slate-400 hover:text-white"
              }`}
            >
              2026 (Oct - Dec)
            </button>
            <button
              onClick={() => setSelectedYear(2027)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedYear === 2027
                  ? "bg-[#C5A059] text-[#080A0F]"
                  : "bg-[#0E121B] text-slate-400 hover:text-white"
              }`}
            >
              2027 (Jan - Jul)
            </button>
            <button
              onClick={() => setSelectedYear("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedYear === "all"
                  ? "bg-[#C5A059] text-[#080A0F]"
                  : "bg-[#0E121B] text-slate-400 hover:text-white"
              }`}
            >
              All 269 Days
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: DETAILED MONTH-WISE CALENDAR GRID
         ========================================================================= */}
      {viewMode === "month" && (
        <div className="space-y-4">
          {/* Active Month Stats Header */}
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-bold text-slate-200">
              {activeMonthConfig.name}
            </span>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>
                Solves:{" "}
                <strong className="text-[#D8B668]">
                  {monthsData.find((m) => m.key === activeMonthKey)?.totalSolves || 0}
                </strong>
              </span>
              <span>&bull;</span>
              <span>
                Active Days:{" "}
                <strong className="text-emerald-400">
                  {monthsData.find((m) => m.key === activeMonthKey)?.activeDays || 0}
                </strong>
              </span>
              <span>&bull;</span>
              <span>
                Consistency:{" "}
                <strong className="text-slate-200">
                  {monthsData.find((m) => m.key === activeMonthKey)?.activeRatio || 0}%
                </strong>
              </span>
            </div>
          </div>

          {/* 7-Column Calendar Grid (Sun to Sat) */}
          <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#0A0D14]">
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-white/[0.08] bg-[#141A26] text-center py-2 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Weeks */}
            <div className="divide-y divide-white/[0.06]">
              {activeMonthMatrix.map((week, wIdx) => (
                <div key={wIdx} className="grid grid-cols-7 divide-x divide-white/[0.06]">
                  {week.map((cell, cIdx) => {
                    if (cell.dayNumber === null || !cell.dateStr) {
                      return (
                        <div
                          key={cIdx}
                          className="min-h-[64px] sm:min-h-[72px] bg-[#0E121B]/30 p-2 opacity-25"
                        />
                      );
                    }

                    const isSelected = selectedDate === cell.dateStr;
                    const hasSolved = cell.count > 0;

                    return (
                      <div
                        key={cIdx}
                        onClick={() => {
                          if (onSelectDate) {
                            onSelectDate(isSelected ? null : cell.dateStr);
                          }
                        }}
                        className={`min-h-[64px] sm:min-h-[72px] p-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#C5A059]/20 border-2 border-[#C5A059] shadow-[inset_0_0_12px_rgba(197,160,89,0.3)]"
                            : hasSolved
                            ? "bg-emerald-950/30 hover:bg-emerald-950/50"
                            : "bg-[#0E121B]/60 hover:bg-[#141A26]"
                        } ${cell.isToday ? "ring-1 ring-[#C5A059]/60" : ""}`}
                      >
                        {/* Day Number + Today Indicator */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-mono font-bold ${
                              hasSolved
                                ? "text-emerald-400"
                                : cell.isToday
                                ? "text-[#D8B668]"
                                : "text-slate-400"
                            }`}
                          >
                            {cell.dayNumber}
                          </span>

                          {cell.isToday && (
                            <span className="text-[9px] px-1 rounded bg-[#C5A059]/20 text-[#D8B668] font-bold">
                              Today
                            </span>
                          )}
                        </div>

                        {/* Solved Status Box */}
                        {hasSolved ? (
                          <div className="mt-1 flex items-center justify-between bg-emerald-900/40 px-1.5 py-0.5 rounded border border-emerald-700/60">
                            <span className="text-[10px] font-mono font-bold text-emerald-300">
                              {cell.count} Solved
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-600 font-mono text-center">
                            -
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: YEAR & MONTHS PERFORMANCE BREAKDOWN
         ========================================================================= */}
      {viewMode === "year" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Month-Wise Progress Cards &bull; 269-Day Placement Target
            </span>
            <span className="text-xs font-mono text-slate-400">
              Total Solved: <strong className="text-[#D8B668]">{overallStats.totalSolves}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthsData
              .filter((m) => {
                if (selectedYear === "all") return true;
                return m.year === selectedYear;
              })
              .map((m) => {
                const isCurrent = m.key === currentMonthKey;
                return (
                  <motion.div
                    key={m.key}
                    whileHover={{ y: -2 }}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? "bg-[#141A26] border-[#C5A059]/50 shadow-[0_4px_20px_rgba(197,160,89,0.1)]"
                        : "bg-[#0E121B] border-white/[0.08]"
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <span className="text-xs font-bold text-slate-100">{m.name}</span>
                      {isCurrent && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C5A059]/20 text-[#D8B668] font-mono font-bold">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 my-3 text-center">
                      <div className="p-2 rounded-lg bg-[#080A0F] border border-white/[0.04]">
                        <span className="text-lg font-mono font-bold text-[#D8B668] block">
                          {m.totalSolves}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Solves
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[#080A0F] border border-white/[0.04]">
                        <span className="text-lg font-mono font-bold text-emerald-400 block">
                          {m.activeDays}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          Active Days
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Month Consistency */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Consistency</span>
                        <span>{m.activeRatio}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#080A0F] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, m.activeRatio)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveMonthKey(m.key);
                        setViewMode("month");
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-white/[0.04] hover:bg-[#C5A059] hover:text-[#080A0F] text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <span>View Month Calendar</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 3: FULL 269-DAY MISSION HEATMAP (4 OCT 2026 -> 1 JUL 2027)
         ========================================================================= */}
      {viewMode === "heatmap" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Entire Mission Horizon (October 2026 &rarr; July 2027)</span>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-[#141A26] border border-white/[0.04]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#163828] border border-emerald-800" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0D6E42] border border-emerald-600" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981] border border-emerald-400" />
              <span>More</span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <div className="min-w-[720px] space-y-1.5">
              {/* Month Markers (Aligned with exact week columns to prevent overlapping) */}
              <div className="flex text-[10px] font-mono text-slate-400 pl-7 h-4 relative">
                {monthHeaderPositions.map((m) => (
                  <span
                    key={m.key}
                    className="absolute font-bold text-slate-300"
                    style={{ left: `${28 + m.weekIndex * 15.5}px` }}
                  >
                    {m.label}
                  </span>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="flex gap-1">
                {/* Weekday labels */}
                <div className="flex flex-col justify-between text-[9px] font-mono text-slate-500 pr-2 py-0.5 select-none w-5">
                  <span>Sun</span>
                  <span>Tue</span>
                  <span>Thu</span>
                  <span>Sat</span>
                </div>

                {/* Weeks Columns */}
                <div className="flex gap-[3.5px]">
                  {heatmapData.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3.5px]">
                      {week.map((day) => {
                        const isSelected = selectedDate === day.dateStr;
                        const cellColor = isSelected
                          ? "bg-[#D8B668] border-[#C5A059] ring-2 ring-[#C5A059]/50"
                          : !day.isMissionRange
                          ? "bg-[#0E121B]/30 border-transparent opacity-20"
                          : day.count === 0
                          ? "bg-[#141A26] border-white/[0.04] hover:border-white/[0.2]"
                          : day.count === 1
                          ? "bg-[#163828] border-emerald-800/80"
                          : day.count === 2
                          ? "bg-[#0D6E42] border-emerald-600"
                          : "bg-[#10B981] border-emerald-400";

                        return (
                          <div
                            key={day.dateStr}
                            onClick={() => {
                              if (onSelectDate) {
                                onSelectDate(isSelected ? null : day.dateStr);
                              }
                            }}
                            onMouseEnter={() =>
                              setHoveredDay({
                                dateStr: day.dateStr,
                                count: day.count,
                                problems: solvesByDate.get(day.dateStr) || [],
                              })
                            }
                            onMouseLeave={() => setHoveredDay(null)}
                            className={`w-3 h-3 rounded-[3px] border transition-all cursor-pointer ${cellColor} ${
                              day.isToday ? "ring-1 ring-[#C5A059]" : ""
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/[0.04]">
        <span>
          {selectedDate ? (
            <span className="text-[#D8B668] font-bold">
              Filtered by: {selectedDate} (
              {solvesByDate.get(selectedDate)?.length || 0} solves) &bull;{" "}
              <button
                onClick={() => onSelectDate && onSelectDate(null)}
                className="underline hover:text-white"
              >
                Clear filter
              </button>
            </span>
          ) : (
            "Click any day to inspect and filter solves below."
          )}
        </span>
        <span className="font-mono text-slate-500">Target Date: 1 July 2027</span>
      </div>
    </div>
  );
};
