"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store/useStore";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import {
  CheckCircle2,
  Circle,
  Plus,
  Code2,
  BookOpen,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const {
    db,
    currentUser,
    setCurrentUser,
    activeUserSummary,
    anurajSummary,
    soumyajitSummary,
    toggleTaskComplete,
    addTask,
    advanceTopicStage,
    activeUserWallet,
  } = useStore();

  // Quick Task Input
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  // Active user's today's tasks
  const todayTasks = db.dailyTasks.filter(
    (t) => t.userId === currentUser.id && t.targetDate === todayStr
  );
  const completedTodayTasksCount = todayTasks.filter((t) => t.status === "COMPLETED").length;

  // Active user's LeetCode solves today
  const todayUserSolves = db.codingProblems.filter(
    (p) => p.userId === currentUser.id && p.dateSolved === todayStr && p.status === "SOLVED"
  );

  // Topics currently in progress (Stage 1 to 5, not mastered)
  const userProgressMap = new Map();
  db.userProgress
    .filter((p) => p.userId === currentUser.id)
    .forEach((p) => userProgressMap.set(p.topicId, p));

  const topicsInStudy = db.topics.filter((topic) => {
    const prog = userProgressMap.get(topic.id);
    return prog && !prog.isMastered && prog.currentStage <= db.pipelineStages.length;
  });

  const topicsCompleted = db.topics.filter((topic) => {
    const prog = userProgressMap.get(topic.id);
    return prog && (prog.isMastered || prog.currentStage > db.pipelineStages.length);
  });

  const topicsPending = db.topics.filter((topic) => {
    const prog = userProgressMap.get(topic.id);
    return !prog || (!prog.isMastered && prog.currentStage === 1 && prog.stageHistory.length === 0);
  });

  // Next topics to complete (prioritize In-Study, then Pending)
  const nextTopicsToStudy = [
    ...topicsInStudy.slice(0, 3),
    ...topicsPending.slice(0, Math.max(0, 3 - topicsInStudy.length)),
  ].slice(0, 3);

  // Quick task submit handler
  const handleAddTodayTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    addTask({
      title: quickTaskTitle.trim(),
      description: "",
      priority: "HIGH",
      category: "Daily Focus",
      targetDate: todayStr,
      estimatedMinutes: 45,
      status: "TODO",
    });
    setQuickTaskTitle("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="space-y-6 pb-12 max-w-6xl mx-auto"
    >
      {/* =========================================================================
          QUESTION 1: HOW MUCH TIME IS LEFT?
          Live Countdown to 1 July 2027
         ========================================================================= */}
      <CountdownTimer />

      {/* =========================================================================
          QUESTION 2: WHAT HAVE WE COMPLETED?
          Side-by-side Progress for Anuraj and Soumyajit (1-Click Switchable Cards)
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Preparation Progress</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-normal normal-case">Anuraj × Soumyajit</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
                Active: {currentUser.fullName}
              </span>
            </h2>
          </div>
          <Link
            href="/topics"
            className="text-xs text-[#D8B668] hover:underline flex items-center gap-1 font-medium"
          >
            View Full Syllabus <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Anuraj's Progress Card */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCurrentUser("user-anuraj")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              currentUser.id === "user-anuraj"
                ? "bg-[#0E121B] border-[#C5A059]/40 border-t-[#C5A059]/60 shadow-[0_8px_30px_-6px_rgba(197,160,89,0.18),inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "bg-[#0E121B] border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] opacity-85 hover:opacity-100 hover:border-white/[0.18]"
            }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border font-bold flex items-center justify-center text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
                  currentUser.id === "user-anuraj"
                    ? "bg-[#141A26] border-[#C5A059]/40 text-[#D8B668]"
                    : "bg-[#141A26] border-white/[0.1] text-slate-300"
                }`}>
                  A
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">Anuraj</h3>
                    {currentUser.id === "user-anuraj" ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C5A059]/20 text-[#D8B668] border border-[#C5A059]/40 font-mono font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400 font-mono">
                        Click to switch
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {anurajSummary.overallProgressPercent}% Complete
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold text-[#D8B668]">
                  {anurajSummary.leetcodeTotal}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">LeetCode Solved</span>
              </div>
            </div>

            {/* Recessed Progress Bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Overall Syllabus</span>
                <span className="text-slate-200 font-semibold">{anurajSummary.overallProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#141A26] overflow-hidden border border-white/[0.04] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                <div
                  className="h-full bg-gradient-to-r from-[#B38D45] to-[#D8B668] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(197,160,89,0.3)]"
                  style={{ width: `${anurajSummary.overallProgressPercent}%` }}
                />
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {anurajSummary.topicsMastered}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Completed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
                <span className="text-sm font-mono font-bold text-[#D8B668]">
                  {anurajSummary.topicsInProgress}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">In Study</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
                <span className="text-sm font-mono font-bold text-slate-300">
                  {anurajSummary.topicsPending}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Pending</span>
              </div>
            </div>
          </motion.div>

          {/* Soumyajit's Progress Card */}
          <motion.div
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            onClick={() => setCurrentUser("user-soumyajit")}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              currentUser.id === "user-soumyajit"
                ? "bg-[#0E121B] border-[#C5A059]/40 border-t-[#C5A059]/60 shadow-[0_8px_30px_-6px_rgba(197,160,89,0.18),inset_0_1px_0_rgba(255,255,255,0.05)]"
                : "bg-[#0E121B] border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] opacity-85 hover:opacity-100 hover:border-white/[0.18]"
            }`}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl border font-bold flex items-center justify-center text-xs shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ${
                  currentUser.id === "user-soumyajit"
                    ? "bg-[#141A26] border-[#C5A059]/40 text-[#D8B668]"
                    : "bg-[#141A26] border-white/[0.1] text-slate-300"
                }`}>
                  S
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-100">Soumyajit</h3>
                    {currentUser.id === "user-soumyajit" ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C5A059]/20 text-[#D8B668] border border-[#C5A059]/40 font-mono font-bold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/[0.05] text-slate-400 font-mono">
                        Click to switch
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {soumyajitSummary.overallProgressPercent}% Complete
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold text-[#D8B668]">
                  {soumyajitSummary.leetcodeTotal}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">LeetCode Solved</span>
              </div>
            </div>

            {/* Recessed Progress Bar */}
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Overall Syllabus</span>
                <span className="text-slate-200 font-semibold">{soumyajitSummary.overallProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#141A26] overflow-hidden border border-white/[0.04] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                <div
                  className="h-full bg-gradient-to-r from-[#B38D45] to-[#D8B668] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(197,160,89,0.3)]"
                  style={{ width: `${soumyajitSummary.overallProgressPercent}%` }}
                />
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {soumyajitSummary.topicsMastered}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Completed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
                <span className="text-sm font-mono font-bold text-[#D8B668]">
                  {soumyajitSummary.topicsInProgress}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">In Study</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#141A26] border border-white/[0.06] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]">
                <span className="text-sm font-mono font-bold text-slate-300">
                  {soumyajitSummary.topicsPending}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Pending</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* =========================================================================
          QUESTION 3: WHAT DO WE NEED TO COMPLETE TODAY?
          Today's Tasks + Today's LeetCode Activity & Checklist
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Module 1: Today's Tasks - Lovable Card */}
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>Today&apos;s Tasks</span>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-200 border border-white/[0.06]">
                    {completedTodayTasksCount}/{todayTasks.length} Done
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mark complete as you study today • {currentUser.fullName}&apos;s tasks
                </p>
              </div>
              <Link
                href="/tasks"
                className="text-xs text-[#D8B668] hover:underline flex items-center gap-1 font-medium"
              >
                All Tasks <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Task Checklist Items */}
            <div className="space-y-2 min-h-[140px]">
              {todayTasks.length === 0 ? (
                <div className="p-4 text-center rounded-xl bg-[#141A26]/40 border border-white/[0.04]">
                  <p className="text-xs text-slate-400">No tasks scheduled for today yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Add one below to stay disciplined.</p>
                </div>
              ) : (
                todayTasks.map((task) => {
                  const isDone = task.status === "COMPLETED";
                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isDone
                          ? "bg-[#141A26]/40 border-white/[0.04] text-slate-500"
                          : "bg-[#141A26] border-white/[0.07] text-slate-200 hover:border-[#C5A059]/40 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)]"
                      }`}
                    >
                      <button type="button" className="mt-0.5 text-slate-400">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${isDone ? "line-through text-slate-500" : "text-slate-100"}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
                            {task.category}
                          </span>
                          {task.isSharedTask && (
                            <span className="text-[#D8B668] font-medium">Shared Mission Task</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Add Task Input - Lovable Form Controls */}
          <form onSubmit={handleAddTodayTask} className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center gap-2">
            <input
              type="text"
              placeholder="Add quick task for today..."
              value={quickTaskTitle}
              onChange={(e) => setQuickTaskTitle(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]/60 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#D8B668] to-[#C5A059] hover:brightness-105 active:scale-95 text-[#080A0F] font-bold text-xs flex items-center gap-1.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(197,160,89,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </motion.button>
          </form>
        </motion.div>

        {/* Module 2: Today's LeetCode Activity Status (Non-duplicated, links to Arena) */}
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ duration: 0.2 }}
          className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] flex flex-col justify-between"
        >
          <div className="space-y-3.5">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#C5A059]" />
                    <span>Today&apos;s LeetCode</span>
                  </h3>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-200 border border-white/[0.06]">
                    {todayUserSolves.length} Solved Today
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Fill 269-day calendar &bull; Earn +{db.economySettings?.currencySymbol || "₹"}{db.economySettings?.coinsPerProblem || 100} / solve
                </p>
              </div>
              <Link
                href="/leetcode"
                className="text-xs text-[#D8B668] hover:underline flex items-center gap-1 font-medium"
              >
                Calendar &amp; Arena <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Today's Solved Problems List */}
            <div className="space-y-2 min-h-[140px]">
              {todayUserSolves.length === 0 ? (
                <div className="p-5 text-center rounded-xl bg-[#141A26]/40 border border-white/[0.04] space-y-1.5 flex flex-col items-center justify-center min-h-[140px]">
                  <p className="text-xs font-semibold text-slate-300">No questions logged yet today.</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Head to the LeetCode Arena to choose your question topic, record your solution, and fill today&apos;s calendar square.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                  {todayUserSolves.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-[#141A26] border border-white/[0.06] flex items-center justify-between text-xs hover:border-[#C5A059]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-100 truncate">{p.problemName}</span>
                        <span className="text-[10px] text-[#D8B668] px-2 py-0.5 rounded bg-white/[0.05] font-mono">
                          {p.topicTag}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 shrink-0 font-bold">
                        +{db.economySettings?.currencySymbol || "₹"}{db.economySettings?.coinsPerProblem || 100}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clean Direct CTA to Arena */}
          <div className="mt-4 pt-3.5 border-t border-white/[0.06]">
            <Link
              href="/leetcode"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#B38D45] via-[#D8B668] to-[#C5A059] text-[#080A0F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:brightness-105 active:scale-98 shadow-sm"
            >
              <Code2 className="w-4 h-4 text-[#080A0F]" />
              <span>Go to LeetCode Tracker &amp; Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#080A0F]" />
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* =========================================================================
          SHOW WHAT NEEDS TO BE COMPLETED NEXT
          Clear next topics in sequence with 5-stage progression
         ========================================================================= */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C5A059]" />
              <span>What Needs to be Completed Next</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Topics in your active sequence &bull; Complete all 5 stages to mark Mastered
            </p>
          </div>
          <Link
            href="/topics"
            className="text-xs text-[#D8B668] hover:underline flex items-center gap-1 font-medium"
          >
            All 17 Subjects <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {nextTopicsToStudy.map((topic) => {
            const prog = userProgressMap.get(topic.id);
            const currentStageNum = prog ? prog.currentStage : 1;
            const currentStageConfig = db.pipelineStages.find((s) => s.stageNumber === currentStageNum);
            const isCompleted = prog?.isMastered || currentStageNum > db.pipelineStages.length;

            return (
              <motion.div
                key={topic.id}
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="p-4 rounded-xl bg-[#141A26] border border-white/[0.07] shadow-[inset_0_0.5px_0_rgba(255,255,255,0.04)] flex flex-col justify-between space-y-3 hover:border-white/[0.15] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
                    <span className="font-mono uppercase text-[#C5A059] font-bold tracking-wider">
                      {topic.subjectId.replace("sub-", "")}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] font-mono">
                      {topic.difficulty}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-100 leading-snug">{topic.name}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">{topic.description}</p>
                </div>

                <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#0E121B] text-slate-300 border border-white/[0.06]">
                    {isCompleted ? "COMPLETED" : currentStageConfig?.name || `Stage ${currentStageNum}`}
                  </span>
                  {!isCompleted && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => advanceTopicStage(topic.id)}
                      className="text-[11px] px-3 py-1 rounded-full bg-gradient-to-b from-[#D8B668] to-[#C5A059] hover:brightness-105 active:scale-95 text-[#080A0F] font-bold border border-[#C5A059]/40 transition-all flex items-center gap-1 shadow-[inset_0_0.5px_0_rgba(255,255,255,0.4),0_2px_6px_rgba(197,160,89,0.25)]"
                    >
                      Advance <ArrowRight className="w-3 h-3" />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
