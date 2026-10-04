"use client";

import React from "react";
import { useStore } from "@/lib/store/useStore";
import { Subject } from "@/lib/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BarChart3,
  CheckCircle2,
  Code2,
  BookOpen,
  Calendar,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function PerformanceTrackingPage() {
  const { db, anurajSummary, soumyajitSummary } = useStore();

  // Subject-wise comparison data for Recharts across 17 subjects
  const subjectChartData = db.subjects.map((sub: Subject) => {
    const anuSub = anurajSummary.subjectBreakdown.find((s) => s.subjectId === sub.id);
    const soumSub = soumyajitSummary.subjectBreakdown.find((s) => s.subjectId === sub.id);
    return {
      name: sub.code,
      fullName: sub.name,
      Anuraj: anuSub ? anuSub.percent : 0,
      Soumyajit: soumSub ? soumSub.percent : 0,
    };
  });

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#C5A059]" />
              Performance Tracking
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
              Anuraj × Soumyajit
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Actual database records only &bull; Zero fake metrics &bull; Real preparation accountability
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A26] border border-white/[0.08] text-xs font-mono text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Target: 1 July 2027</span>
        </div>
      </div>

      {/* 1. Overall Topic Completion Percentage - Lovable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Anuraj Overall */}
        <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#141A26] border border-white/[0.1] text-slate-200 font-bold flex items-center justify-center text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                A
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Anuraj</h3>
                <span className="text-xs text-slate-400">Overall Topic Completion</span>
              </div>
            </div>
            <span className="text-2xl font-mono font-bold text-[#D8B668]">
              {anurajSummary.overallProgressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#141A26] overflow-hidden border border-white/[0.04] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            <div
              className="h-full bg-gradient-to-r from-[#B38D45] to-[#D8B668] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(197,160,89,0.3)]"
              style={{ width: `${anurajSummary.overallProgressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
              <span className="font-mono font-bold text-emerald-400 block text-sm">
                {anurajSummary.topicsMastered}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Completed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
              <span className="font-mono font-bold text-[#D8B668] block text-sm">
                {anurajSummary.topicsInProgress}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">In Study</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
              <span className="font-mono font-bold text-slate-300 block text-sm">
                {anurajSummary.topicsPending}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Pending</span>
            </div>
          </div>
        </div>

        {/* Soumyajit Overall */}
        <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#141A26] border border-white/[0.1] text-slate-200 font-bold flex items-center justify-center text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                S
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Soumyajit</h3>
                <span className="text-xs text-slate-400">Overall Topic Completion</span>
              </div>
            </div>
            <span className="text-2xl font-mono font-bold text-[#D8B668]">
              {soumyajitSummary.overallProgressPercent}%
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-[#141A26] overflow-hidden border border-white/[0.04] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
            <div
              className="h-full bg-gradient-to-r from-[#B38D45] to-[#D8B668] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(197,160,89,0.3)]"
              style={{ width: `${soumyajitSummary.overallProgressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
              <span className="font-mono font-bold text-emerald-400 block text-sm">
                {soumyajitSummary.topicsMastered}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Completed</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
              <span className="font-mono font-bold text-[#D8B668] block text-sm">
                {soumyajitSummary.topicsInProgress}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">In Study</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
              <span className="font-mono font-bold text-slate-300 block text-sm">
                {soumyajitSummary.topicsPending}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total LeetCode Problems Solved Comparison */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#C5A059]" />
            LeetCode Problems Solved Comparison
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Actual Solved Logs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Anuraj LeetCode */}
          <div className="p-3.5 rounded-lg bg-[#141A26] border border-white/[0.06] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">Anuraj</span>
              <span className="font-mono font-bold text-[#D8B668] text-base">
                {anurajSummary.leetcodeTotal} Solved
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded bg-[#0E121B] border border-emerald-900/40">
                <span className="text-emerald-400 font-mono font-bold block">{anurajSummary.leetcodeEasy}</span>
                <span className="text-[10px] text-slate-400">Easy</span>
              </div>
              <div className="p-2 rounded bg-[#0E121B] border border-amber-900/40">
                <span className="text-amber-300 font-mono font-bold block">{anurajSummary.leetcodeMedium}</span>
                <span className="text-[10px] text-slate-400">Medium</span>
              </div>
              <div className="p-2 rounded bg-[#0E121B] border border-rose-900/40">
                <span className="text-rose-400 font-mono font-bold block">{anurajSummary.leetcodeHard}</span>
                <span className="text-[10px] text-slate-400">Hard</span>
              </div>
            </div>
          </div>

          {/* Soumyajit LeetCode */}
          <div className="p-3.5 rounded-lg bg-[#141A26] border border-white/[0.06] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-200">Soumyajit</span>
              <span className="font-mono font-bold text-[#D8B668] text-base">
                {soumyajitSummary.leetcodeTotal} Solved
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded bg-[#0E121B] border border-emerald-900/40">
                <span className="text-emerald-400 font-mono font-bold block">{soumyajitSummary.leetcodeEasy}</span>
                <span className="text-[10px] text-slate-400">Easy</span>
              </div>
              <div className="p-2 rounded bg-[#0E121B] border border-amber-900/40">
                <span className="text-amber-300 font-mono font-bold block">{soumyajitSummary.leetcodeMedium}</span>
                <span className="text-[10px] text-slate-400">Medium</span>
              </div>
              <div className="p-2 rounded bg-[#0E121B] border border-rose-900/40">
                <span className="text-rose-400 font-mono font-bold block">{soumyajitSummary.leetcodeHard}</span>
                <span className="text-[10px] text-slate-400">Hard</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily Task Completion & Revision Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Task Completion */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Daily Task Completion
          </h3>
          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Anuraj: {anurajSummary.dailyTasksCompleted} / {anurajSummary.dailyTasksTotal} tasks</span>
                <span className="font-mono font-bold text-[#D8B668]">{anurajSummary.taskCompletionRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#141A26] overflow-hidden">
                <div
                  className="h-full bg-[#C5A059] rounded-full"
                  style={{ width: `${anurajSummary.taskCompletionRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Soumyajit: {soumyajitSummary.dailyTasksCompleted} / {soumyajitSummary.dailyTasksTotal} tasks</span>
                <span className="font-mono font-bold text-[#D8B668]">{soumyajitSummary.taskCompletionRate}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#141A26] overflow-hidden">
                <div
                  className="h-full bg-[#C5A059] rounded-full"
                  style={{ width: `${soumyajitSummary.taskCompletionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Revision Progress Distribution */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Revision Pipeline Stages
          </h3>
          <div className="space-y-2 text-xs">
            {db.pipelineStages.map((stage) => {
              const anuCount =
                stage.stageNumber === 1
                  ? anurajSummary.stageDistribution.stage1Study
                  : stage.stageNumber === 2
                  ? anurajSummary.stageDistribution.stage2FirstRev
                  : stage.stageNumber === 3
                  ? anurajSummary.stageDistribution.stage3FinalRev
                  : stage.stageNumber === 4
                  ? anurajSummary.stageDistribution.stage4SuperFinal
                  : anurajSummary.stageDistribution.stage5Interview;

              const soumCount =
                stage.stageNumber === 1
                  ? soumyajitSummary.stageDistribution.stage1Study
                  : stage.stageNumber === 2
                  ? soumyajitSummary.stageDistribution.stage2FirstRev
                  : stage.stageNumber === 3
                  ? soumyajitSummary.stageDistribution.stage3FinalRev
                  : stage.stageNumber === 4
                  ? soumyajitSummary.stageDistribution.stage4SuperFinal
                  : soumyajitSummary.stageDistribution.stage5Interview;

              return (
                <div
                  key={stage.id}
                  className="p-2 rounded-lg bg-[#141A26] border border-white/[0.04] flex items-center justify-between"
                >
                  <span className="text-slate-300 font-medium">{stage.name}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-400">Anuraj: <strong className="text-slate-200">{anuCount}</strong></span>
                    <span className="text-slate-400">Soumyajit: <strong className="text-slate-200">{soumCount}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Subject-wise Completion (17 Subjects Bar Chart) - Lovable Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Subject-Wise Completion (% of 5 Stages Mastered)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">17 SAP & CS Subjects</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={subjectChartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <XAxis
                dataKey="name"
                stroke="#64748B"
                fontSize={10}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
              />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E121B",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#E2E8F0",
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "10px", fontSize: "11px" }}
              />
              <Bar dataKey="Anuraj" fill="#C5A059" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Soumyajit" fill="#3E6E9F" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
