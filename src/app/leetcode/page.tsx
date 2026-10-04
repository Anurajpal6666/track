"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store/useStore";
import { LeetCodeCalendar } from "@/components/leetcode/LeetCodeCalendar";
import { INITIAL_LEETCODE_TOPICS } from "@/lib/store/initialData";
import {
  Code2,
  Plus,
  CheckCircle2,
  Calendar,
  Trash2,
  Search,
  RotateCcw,
  X,
  ChevronDown,
} from "lucide-react";

export default function LeetCodeTrackerPage() {
  const {
    db,
    currentUser,
    setCurrentUser,
    addCodingProblem,
    deleteCodingProblem,
    clearCandidateSolves,
    addLeetCodeTopic,
  } = useStore();

  const todayStr = new Date().toISOString().split("T")[0];

  // Calendar date filter state
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);

  // Dynamic Topics list
  const availableTopics = useMemo(() => {
    return db.leetcodeTopics && db.leetcodeTopics.length > 0
      ? db.leetcodeTopics
      : INITIAL_LEETCODE_TOPICS;
  }, [db.leetcodeTopics]);

  // Minimal Form State - ONLY TYPE OF QUESTION + SUBMIT BUTTON
  const [questionType, setQuestionType] = useState<string>(availableTopics[0] || "Arrays");
  const [questionName, setQuestionName] = useState("");
  const [showAddCustomTopic, setShowAddCustomTopic] = useState(false);
  const [customTopicName, setCustomTopicName] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Economy settings
  const coinPerProblem = db.economySettings?.coinsPerProblem ?? 100;
  const currencySymbol = db.economySettings?.currencySymbol ?? "₹";
  const currencyName = db.economySettings?.currencyName ?? "Prep Cash";

  // Active user's problems (Strictly candidate-isolated)
  const userProblems = useMemo(() => {
    return db.codingProblems.filter((p) => p.userId === currentUser.id);
  }, [db.codingProblems, currentUser.id]);

  // Handle adding a custom dynamic topic
  const handleAddCustomTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = customTopicName.trim();
    if (!clean) return;
    addLeetCodeTopic(clean);
    setQuestionType(clean);
    setCustomTopicName("");
    setShowAddCustomTopic(false);
  };

  // Handle form submission (ONLY TYPE OF QUESTION + SUBMIT)
  const handleSubmitSolved = (e: React.FormEvent) => {
    e.preventDefault();
    const typeClean = questionType.trim() || "Arrays";
    const nameClean = questionName.trim() || `${typeClean} Practice #${userProblems.length + 1}`;

    addCodingProblem({
      problemName: nameClean,
      problemUrl: "",
      difficulty: "MEDIUM",
      topicTag: typeClean,
      language: currentUser.id === "user-anuraj" ? "C++" : "Python",
      dateSolved: todayStr,
      solutionApproach: "Solved and recorded into Mission calendar",
      timeComplexity: "O(N)",
      spaceComplexity: "O(1)",
      personalNotes: `Logged during practice on ${todayStr}`,
      status: "SOLVED",
      needsRevision: false,
    });

    setJustSubmitted(nameClean);
    setQuestionName("");
    setTimeout(() => setJustSubmitted(null), 3000);
  };

  // Filtered records
  const filteredProblems = useMemo(() => {
    return userProblems.filter((p) => {
      if (selectedCalendarDate && p.dateSolved !== selectedCalendarDate) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.problemName.toLowerCase().includes(q);
        const matchTopic = p.topicTag?.toLowerCase().includes(q);
        if (!matchName && !matchTopic) return false;
      }
      return true;
    });
  }, [userProblems, selectedCalendarDate, searchQuery]);

  // 5 Count metrics
  const totalSolved = userProblems.filter((p) => p.status === "SOLVED").length;
  const easySolved = userProblems.filter((p) => p.status === "SOLVED" && p.difficulty === "EASY").length;
  const mediumSolved = userProblems.filter((p) => p.status === "SOLVED" && p.difficulty === "MEDIUM").length;
  const hardSolved = userProblems.filter((p) => p.status === "SOLVED" && p.difficulty === "HARD").length;
  const solvedToday = userProblems.filter(
    (p) => p.status === "SOLVED" && p.dateSolved === todayStr
  ).length;

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* =========================================================================
          HEADER: CANDIDATE SWITCHER & VIRTUAL WALLET BALANCE
         ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#C5A059]" />
              LeetCode Arena
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
              {currentUser.fullName}&apos;s Workspace
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pick question topic &bull; Submit to fill today&apos;s calendar and earn {currencyName}
          </p>
        </div>

        {/* User Switcher Tab + Clear Solves Button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0E121B] border border-white/[0.08] relative">
            <button
              onClick={() => {
                setCurrentUser("user-anuraj");
                setSelectedCalendarDate(null);
              }}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                currentUser.id === "user-anuraj"
                  ? "text-[#080A0F] font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {currentUser.id === "user-anuraj" && (
                <motion.div
                  layoutId="leetcode-user-pill"
                  className="absolute inset-0 rounded-lg bg-[#C5A059] shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">Anuraj</span>
            </button>
            <button
              onClick={() => {
                setCurrentUser("user-soumyajit");
                setSelectedCalendarDate(null);
              }}
              className={`relative px-4 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                currentUser.id === "user-soumyajit"
                  ? "text-[#080A0F] font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {currentUser.id === "user-soumyajit" && (
                <motion.div
                  layoutId="leetcode-user-pill"
                  className="absolute inset-0 rounded-lg bg-[#C5A059] shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                />
              )}
              <span className="relative z-10">Soumyajit</span>
            </button>
          </div>

          {/* Optional Clear / Reset Solves Button */}
          {userProblems.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              title="Reset candidate solves to zero"
              className="p-2 rounded-xl bg-[#0E121B] border border-white/[0.08] text-slate-400 hover:text-rose-400 hover:border-rose-900/60 text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal to Clear Solves */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-xl bg-[#141A26] border border-rose-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl"
          >
            <div className="text-xs text-slate-300">
              <span className="font-bold text-rose-400">Clear all records?</span> This will wipe all{" "}
              <span className="font-mono font-bold text-white">{userProblems.length}</span> recorded solves for{" "}
              <span className="font-semibold text-[#D8B668]">{currentUser.fullName}</span> to start fresh at 0.
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-xs text-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearCandidateSolves(currentUser.id);
                  setSelectedCalendarDate(null);
                  setShowClearConfirm(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs text-white font-bold"
              >
                Yes, Clear All Solves
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* =========================================================================
          THE 5 MANDATED METRICS (TOTAL, EASY, MEDIUM, HARD, TODAY)
         ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-3.5">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] text-center space-y-1 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-100 tracking-tight">
            {totalSolved}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Total Solved
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-emerald-900/50 text-center space-y-1 shadow-[0_4px_24px_-4px_rgba(16,185,129,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tracking-tight">
            {easySolved}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-300 block uppercase tracking-wider">
            Easy
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-amber-900/50 text-center space-y-1 shadow-[0_4px_24px_-4px_rgba(245,158,11,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-300 tracking-tight">
            {mediumSolved}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-amber-200 block uppercase tracking-wider">
            Medium
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-rose-900/50 text-center space-y-1 shadow-[0_4px_24px_-4px_rgba(244,63,94,0.1),inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-rose-400 tracking-tight">
            {hardSolved}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-rose-300 block uppercase tracking-wider">
            Hard
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.15 }}
          className="col-span-2 sm:col-span-1 p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-[#C5A059]/40 text-center space-y-1 shadow-[0_4px_24px_-4px_rgba(197,160,89,0.18),inset_0_1px_0_rgba(255,255,255,0.04)]"
        >
          <span className="text-2xl sm:text-3xl font-mono font-bold text-[#D8B668] tracking-tight">
            {solvedToday}
          </span>
          <span className="text-[10px] sm:text-[11px] font-semibold text-[#D8B668] block uppercase tracking-wider">
            Solved Today
          </span>
        </motion.div>
      </div>

      {/* =========================================================================
          AUTHENTIC LEETCODE SUBMISSION CALENDAR (MONTH-WISE, YEARLY, & 269-DAY HEATMAP)
         ========================================================================= */}
      <LeetCodeCalendar
        problems={userProblems}
        selectedDate={selectedCalendarDate}
        onSelectDate={setSelectedCalendarDate}
        candidateName={currentUser.fullName}
      />

      {/* =========================================================================
          MINIMAL SOLVE LOGGER: ONLY "TYPE OF QUESTION" + "SUBMIT" BUTTON!
          (Pick question chips removed. Dynamic topic selector & inline add topic)
         ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-[#C5A059]/40 shadow-[0_8px_30px_-6px_rgba(197,160,89,0.15),inset_0_1px_0_rgba(255,255,255,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#C5A059]" />
              Log Solved Question
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choose or add question topic &bull; Hit submit to fill today&apos;s calendar box &amp; earn {currencySymbol}{coinPerProblem}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#D8B668] px-3 py-1 rounded-xl bg-[#C5A059]/15 border border-[#C5A059]/30">
            +{currencySymbol}{coinPerProblem} {currencyName} / Solve
          </span>
        </div>

        {/* Success Alert Banner */}
        <AnimatePresence>
          {justSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  <strong>Recorded &amp; Solved:</strong> {justSubmitted}! Calendar box filled for today.
                </span>
              </div>
              <span className="font-mono font-bold text-[#D8B668] bg-[#C5A059]/20 px-2.5 py-0.5 rounded-full border border-[#C5A059]/40">
                +{currencySymbol}{coinPerProblem} Credited!
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Topic Management & Minimal Solve Form */}
        <form onSubmit={handleSubmitSolved} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {/* Type of Question Dropdown & Dynamic Topic Input */}
            <div className="sm:col-span-7 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Type of Question (Topic)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddCustomTopic(!showAddCustomTopic)}
                  className="text-[10px] text-[#D8B668] hover:text-[#C5A059] flex items-center gap-1 font-semibold transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {showAddCustomTopic ? "Choose from existing" : "+ Add Custom Topic"}
                </button>
              </div>

              {/* Dynamic Add Topic Input or Clean Select Dropdown */}
              {showAddCustomTopic ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Trie, Segment Tree, Bit Manipulation..."
                    value={customTopicName}
                    onChange={(e) => setCustomTopicName(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[#141A26] border border-[#C5A059]/60 text-slate-100 placeholder-slate-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomTopic()}
                    className="px-3.5 py-2.5 rounded-xl bg-[#C5A059] text-[#080A0F] font-bold text-xs whitespace-nowrap hover:bg-[#D8B668] transition-colors"
                  >
                    Save &amp; Select
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 pr-8 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059] appearance-none"
                  >
                    {availableTopics.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Optional Specific Question Name or Note */}
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 block">
                Problem Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Two Sum, 3Sum, Invert Tree (or leave blank)"
                value={questionName}
                onChange={(e) => setQuestionName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Big Golden Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#B38D45] via-[#D8B668] to-[#C5A059] text-[#080A0F] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_4px_16px_rgba(197,160,89,0.25)] hover:brightness-105 active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-[#080A0F]" />
            <span>Submit Solved &amp; Fill Calendar Box (+{currencySymbol}{coinPerProblem})</span>
          </motion.button>
        </form>
      </div>

      {/* =========================================================================
          SOLVED PROBLEM RECORDS TABLE
         ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)] space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Solved Problem Log ({filteredProblems.length})
              </h3>
              {selectedCalendarDate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C5A059]/15 text-[#D8B668] text-[10px] font-mono font-bold border border-[#C5A059]/30">
                  <Calendar className="w-3 h-3" />
                  Date: {selectedCalendarDate}
                  <button
                    onClick={() => setSelectedCalendarDate(null)}
                    className="ml-1 hover:text-white"
                    title="Clear date filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Solved questions log for {currentUser.fullName}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search question type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Question Type</th>
                <th className="py-2.5 px-3">Problem Name</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Reward</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center">
                    <div className="max-w-xs mx-auto space-y-1">
                      <p className="text-xs font-semibold text-slate-400">
                        {selectedCalendarDate
                          ? `No problems recorded on ${selectedCalendarDate}.`
                          : `No LeetCode records found for ${currentUser.fullName}.`}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {selectedCalendarDate ? (
                          <button
                            onClick={() => setSelectedCalendarDate(null)}
                            className="text-[#D8B668] hover:underline"
                          >
                            Click here to show all problems
                          </button>
                        ) : (
                          "Choose a question type above and click Submit to fill today's calendar box and earn virtual money."
                        )}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProblems.map((prob) => (
                  <tr key={prob.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                      {prob.dateSolved}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[11px] text-[#D8B668] font-medium">
                        {prob.topicTag || "Arrays"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-200">
                      {prob.problemName}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px]">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-[#D8B668]">
                      +{currencySymbol}{coinPerProblem}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => deleteCodingProblem(prob.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
