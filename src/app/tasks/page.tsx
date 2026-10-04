"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store/useStore";
import { DailyTask, Priority } from "@/lib/types";
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Trash2,
  Filter,
} from "lucide-react";

export default function DailyTasksPage() {
  const {
    db,
    currentUser,
    setCurrentUser,
    activeUserSummary,
    addTask,
    toggleTaskComplete,
    deleteTask,
  } = useStore();

  const todayStr = new Date().toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState<"today" | "pending" | "completed" | "overdue">("today");

  // Quick Task Form
  const [quickTitle, setQuickTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("HIGH");
  const [category, setCategory] = useState("Core DSA");
  const [targetDate, setTargetDate] = useState(todayStr);
  const [isSharedTask, setIsSharedTask] = useState(false);

  // Active user's tasks
  const userTasks = db.dailyTasks.filter((t) => t.userId === currentUser.id);

  // 4 Mandated Task Categories from Section 8:
  // 1. TODAY'S TASKS
  const todayTasks = userTasks.filter(
    (t) => t.targetDate === todayStr && t.status !== "COMPLETED"
  );

  // 2. PENDING TASKS (Upcoming after today)
  const pendingTasks = userTasks.filter(
    (t) => t.targetDate > todayStr && t.status !== "COMPLETED"
  );

  // 3. COMPLETED TASKS
  const completedTasks = userTasks.filter((t) => t.status === "COMPLETED");

  // 4. OVERDUE TASKS (Date before today and not completed)
  const overdueTasks = userTasks.filter(
    (t) => t.targetDate < todayStr && t.status !== "COMPLETED"
  );

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      description: "",
      priority,
      category,
      targetDate,
      estimatedMinutes: 45,
      status: "TODO",
      isSharedTask,
    });

    setQuickTitle("");
  };

  const getActiveList = () => {
    switch (activeTab) {
      case "today":
        return todayTasks;
      case "pending":
        return pendingTasks;
      case "completed":
        return completedTasks;
      case "overdue":
        return overdueTasks;
      default:
        return todayTasks;
    }
  };

  const activeList = getActiveList();

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header & User Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-[#C5A059]" />
              Daily Tasks
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
              {currentUser.fullName}&apos;s Tasks
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            4 Core Task Sections: Today, Pending, Completed &amp; Overdue
          </p>
        </div>

        {/* User Switcher Tab */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E121B] border border-white/[0.08] relative">
          <button
            onClick={() => setCurrentUser("user-anuraj")}
            className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              currentUser.id === "user-anuraj"
                ? "text-[#080A0F] font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {currentUser.id === "user-anuraj" && (
              <motion.div
                layoutId="tasks-user-pill"
                className="absolute inset-0 rounded-lg bg-[#C5A059] shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-10">Anuraj</span>
          </button>
          <button
            onClick={() => setCurrentUser("user-soumyajit")}
            className={`relative px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              currentUser.id === "user-soumyajit"
                ? "text-[#080A0F] font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {currentUser.id === "user-soumyajit" && (
              <motion.div
                layoutId="tasks-user-pill"
                className="absolute inset-0 rounded-lg bg-[#C5A059] shadow-sm"
                transition={{ type: "spring", stiffness: 450, damping: 30 }}
              />
            )}
            <span className="relative z-10">Soumyajit</span>
          </button>
        </div>
      </div>

      {/* 4 Category Metric Tabs (Section 8 Requirements) - Lovable Tactile Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5">
        {/* TODAY'S TASKS */}
        <motion.button
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          onClick={() => setActiveTab("today")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
            activeTab === "today"
              ? "bg-[#141A26] border-[#C5A059]/60 border-t-[#C5A059] shadow-[0_6px_24px_-4px_rgba(197,160,89,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "bg-[#0E121B] border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/[0.18]"
          }`}
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-[#D8B668] block tracking-tight">
            {todayTasks.length}
          </span>
          <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider block mt-1.5">
            TODAY&apos;S TASKS
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Due today ({todayStr})</span>
        </motion.button>

        {/* PENDING TASKS */}
        <motion.button
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          onClick={() => setActiveTab("pending")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
            activeTab === "pending"
              ? "bg-[#141A26] border-[#C5A059]/60 border-t-[#C5A059] shadow-[0_6px_24px_-4px_rgba(197,160,89,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "bg-[#0E121B] border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/[0.18]"
          }`}
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-300 block tracking-tight">
            {pendingTasks.length}
          </span>
          <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider block mt-1.5">
            PENDING TASKS
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Scheduled for later</span>
        </motion.button>

        {/* COMPLETED TASKS */}
        <motion.button
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          onClick={() => setActiveTab("completed")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
            activeTab === "completed"
              ? "bg-[#141A26] border-emerald-600/60 border-t-emerald-500 shadow-[0_6px_24px_-4px_rgba(16,185,129,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "bg-[#0E121B] border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/[0.18]"
          }`}
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 block tracking-tight">
            {completedTasks.length}
          </span>
          <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider block mt-1.5">
            COMPLETED TASKS
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Marked finished</span>
        </motion.button>

        {/* OVERDUE TASKS */}
        <motion.button
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          onClick={() => setActiveTab("overdue")}
          className={`p-4 sm:p-5 rounded-2xl border text-left transition-all active:scale-[0.98] ${
            activeTab === "overdue"
              ? "bg-[#141A26] border-rose-600/60 border-t-rose-500 shadow-[0_6px_24px_-4px_rgba(244,63,94,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]"
              : "bg-[#0E121B] border-white/[0.08] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-white/[0.18]"
          }`}
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-rose-400 block tracking-tight">
            {overdueTasks.length}
          </span>
          <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider block mt-1.5">
            OVERDUE TASKS
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Passed deadline</span>
        </motion.button>
      </div>

      {/* Quick Add Task Form */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-[#C5A059]" />
          Add Daily Task
        </h3>

        <form onSubmit={handleQuickAdd} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              type="text"
              required
              placeholder="What do you need to study or complete? (e.g. Solve 3 DP problems, Revise OS Paging)"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              className="sm:col-span-6 text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="sm:col-span-2 text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-200 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="Core DSA">Core DSA</option>
              <option value="C / C++">C / C++</option>
              <option value="DBMS / SQL">DBMS / SQL</option>
              <option value="OS / Networks">OS / Networks</option>
              <option value="SAP HANA">SAP HANA</option>
              <option value="ABAP">ABAP</option>
              <option value="Aptitude / Soft">Aptitude / Soft</option>
            </select>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="sm:col-span-2 text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-200 focus:outline-none focus:border-[#C5A059]"
            >
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="sm:col-span-2 text-xs px-3 py-2 rounded-lg bg-[#141A26] border border-white/[0.08] text-slate-200 focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isSharedTask}
                onChange={(e) => setIsSharedTask(e.target.checked)}
                className="rounded border-white/[0.2] bg-[#141A26] text-[#C5A059] focus:ring-0"
              />
              <span>Common Mission Task (visible to both, tracked independently)</span>
            </label>

            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
        </form>
      </div>

      {/* Task List for Active Tab */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {activeTab.toUpperCase()} ({activeList.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Click checkbox to mark complete or revert
          </span>
        </div>

        <motion.div layout className="space-y-2.5">
          {activeList.length === 0 ? (
            <div className="py-10 text-center rounded-xl bg-[#141A26]/30 border border-white/[0.04] space-y-1">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No tasks in this section right now.</p>
              <p className="text-[11px] text-slate-500">
                Keep following the daily mission schedule until 1 July 2027.
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {activeList.map((task) => {
                const isDone = task.status === "COMPLETED";

                return (
                  <motion.div
                    layout
                    key={task.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ x: 2 }}
                    className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                      isDone
                        ? "bg-[#141A26]/30 border-white/[0.04] text-slate-500"
                        : "bg-[#141A26] border-white/[0.06] text-slate-200 hover:border-white/[0.12]"
                    }`}
                  >
                    <div
                      onClick={() => toggleTaskComplete(task.id)}
                      className="flex items-start gap-3 flex-1 cursor-pointer"
                    >
                      <button type="button" className="mt-0.5">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500" />
                        )}
                      </button>
                      <div>
                        <h4
                          className={`text-xs font-semibold leading-relaxed ${
                            isDone ? "line-through text-slate-500" : "text-slate-100"
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span className="px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06]">
                            {task.category}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-mono font-medium border ${
                              task.priority === "CRITICAL"
                                ? "bg-rose-950/40 text-rose-300 border-rose-900/60"
                                : task.priority === "HIGH"
                                ? "bg-amber-950/40 text-amber-300 border-amber-900/60"
                                : "bg-slate-800 text-slate-300 border-slate-700"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <span className="font-mono text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {task.targetDate}
                          </span>
                          {task.isSharedTask && (
                            <span className="text-[#D8B668] font-medium">Common Mission Task</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}
