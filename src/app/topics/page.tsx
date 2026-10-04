"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store/useStore";
import { Topic, UserTopicProgress } from "@/lib/types";
import { StageProgressModal } from "@/components/topics/StageProgressModal";
import { TopicEditorModal } from "@/components/topics/TopicEditorModal";
import { StudyMaterialsModal } from "@/components/topics/StudyMaterialsModal";
import {
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  Edit2,
  Trash2,
  RotateCcw,
  Coins,
  Sparkles,
  Trophy,
} from "lucide-react";

export default function TopicsPipelinePage() {
  const {
    db,
    currentUser,
    advanceTopicStage,
    regressTopicStage,
    setTopicStage,
    deleteTopic,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_progress" | "mastered" | "pending">("all");

  // Modals state
  const [selectedTopicForProgress, setSelectedTopicForProgress] = useState<Topic | null>(null);
  const [selectedTopicForMaterials, setSelectedTopicForMaterials] = useState<Topic | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [topicToEdit, setTopicToEdit] = useState<Topic | null>(null);

  // Celebration Toast
  const [celebrationMessage, setCelebrationMessage] = useState<string | null>(null);

  const coinPerTopic = db.economySettings?.coinsPerTopicMastered ?? 500;
  const currencySymbol = db.economySettings?.currencySymbol ?? "₹";

  const userProgressMap = new Map<string, UserTopicProgress>();
  db.userProgress
    .filter((p: UserTopicProgress) => p.userId === currentUser.id)
    .forEach((p: UserTopicProgress) => userProgressMap.set(p.topicId, p));

  const stages = db.pipelineStages;

  // Filter topics
  const filteredTopics = db.topics.filter((topic: Topic) => {
    if (!topic.isActive || topic.isArchived) return false;
    if (
      topic.assignedTo !== "all" &&
      topic.assignedTo !== (currentUser.id === "user-anuraj" ? "anuraj" : "soumyajit")
    ) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = topic.name.toLowerCase().includes(q);
      const matchDesc = topic.description.toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    if (selectedSubject !== "all" && topic.subjectId !== selectedSubject) return false;

    const prog = userProgressMap.get(topic.id);
    const currentStageNum = prog ? prog.currentStage : 1;
    const isMastered = prog?.isMastered || currentStageNum > stages.length;

    if (statusFilter === "mastered" && !isMastered) return false;
    if (statusFilter === "in_progress" && (isMastered || currentStageNum === 1 && !prog?.lastStudiedAt)) return false;
    if (statusFilter === "pending" && (isMastered || currentStageNum > 1 || prog?.lastStudiedAt)) return false;

    return true;
  });

  const handleAdvance = (topic: Topic) => {
    const prog = userProgressMap.get(topic.id);
    const currentStageNum = prog ? prog.currentStage : 1;
    const isGoingToMaster = currentStageNum === stages.length;

    advanceTopicStage(topic.id);

    if (isGoingToMaster) {
      setCelebrationMessage(
        `🎉 ${topic.name} Mastered! +${currencySymbol}${coinPerTopic} credited to ${currentUser.fullName}'s wallet!`
      );
      setTimeout(() => setCelebrationMessage(null), 4500);
    }
  };

  const handleRegress = (topicId: string, currentStage: number, isMastered: boolean) => {
    if (isMastered) {
      setTopicStage(topicId, stages.length);
    } else {
      regressTopicStage(topicId);
    }
  };

  const handleDirectStageClick = (topic: Topic, stageNumber: number) => {
    const isMastering = stageNumber > stages.length;
    setTopicStage(topic.id, stageNumber);

    if (isMastering) {
      setCelebrationMessage(
        `🎉 ${topic.name} Mastered! +${currencySymbol}${coinPerTopic} credited to ${currentUser.fullName}'s wallet!`
      );
      setTimeout(() => setCelebrationMessage(null), 4500);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Toast Alert for Mastered Reward */}
      <AnimatePresence>
        {celebrationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-[#141A26] to-[#1C1608] border border-[#C5A059]/60 shadow-[0_8px_32px_rgba(197,160,89,0.3)] flex items-center justify-between gap-3 sticky top-20 z-40 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C5A059]/20 border border-[#C5A059] flex items-center justify-center text-[#D8B668]">
                <Trophy className="w-5 h-5 text-[#D8B668]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D8B668]" />
                  Topic Mastered &bull; Cash Credited!
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">{celebrationMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setCelebrationMessage(null)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-xs font-semibold text-slate-200"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C5A059]" />
              Syllabus &amp; 5-Stage Pipeline
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
              {currentUser.fullName}&apos;s Workspace
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bidirectional progress: Step forward or back anytime &bull; Earn +{currencySymbol}{coinPerTopic} on completing all 5 stages
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTopicToEdit(null);
              setIsEditorOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#D8B668] to-[#C5A059] hover:brightness-105 active:scale-95 text-[#080A0F] font-bold text-xs flex items-center gap-1.5 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_8px_rgba(197,160,89,0.3)]"
          >
            <Plus className="w-4 h-4" /> Add Topic
          </button>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex items-center gap-1.5 bg-[#0E121B] p-1.5 rounded-xl border border-white/[0.06] overflow-x-auto">
        {[
          { id: "all", label: `All Topics (${db.topics.length})` },
          { id: "in_progress", label: "In Revision / In Progress" },
          { id: "mastered", label: "Mastered / Completed" },
          { id: "pending", label: "Not Started" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? "bg-[#C5A059] text-[#080A0F] font-bold shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 17 Subjects Filter Pill Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>Filter by Subject (17 SAP &amp; CS Subjects):</span>
          <span className="font-mono text-slate-300">{filteredTopics.length} topics shown</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedSubject("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
              selectedSubject === "all"
                ? "bg-[#C5A059] text-[#080A0F] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.4)]"
                : "bg-[#141A26] text-slate-300 border border-white/[0.08] hover:border-white/[0.18]"
            }`}
          >
            All Subjects ({db.topics.length})
          </button>
          {db.subjects.map((sub) => {
            const count = db.topics.filter((t) => t.subjectId === sub.id && !t.isArchived).length;
            const isSelected = selectedSubject === sub.id;

            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubject(sub.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  isSelected
                    ? "bg-[#C5A059] text-[#080A0F] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.4)]"
                    : "bg-[#141A26] text-slate-300 border border-white/[0.08] hover:border-white/[0.18]"
                }`}
              >
                {sub.name} <span className="opacity-70 text-[10px] font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search topics by keyword, algorithm, or concept..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-[#0E121B] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]/60"
        />
      </div>

      {/* Topics Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredTopics.map((topic) => {
            const prog = userProgressMap.get(topic.id);
            const currentStageNum = prog ? prog.currentStage : 1;
            const isMastered = prog?.isMastered || currentStageNum > stages.length;
            const subject = db.subjects.find((s) => s.id === topic.subjectId);
            const materialsCount = db.studyMaterials.filter((m) => m.topicId === topic.id).length;

            return (
              <motion.div
                layout
                key={topic.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.22 }}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-2xl bg-[#0E121B] border transition-all flex flex-col justify-between space-y-4 ${
                  isMastered
                    ? "border-emerald-900/60 shadow-[0_6px_24px_-4px_rgba(16,185,129,0.12),inset_0_1px_0_rgba(16,185,129,0.05)]"
                    : "border-white/[0.08] hover:border-white/[0.15] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.03)]"
                }`}
              >
                <div className="space-y-2.5">
                  {/* Subject & Difficulty Header */}
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-mono uppercase text-[#C5A059] font-bold tracking-wider">
                      {subject?.name || topic.subjectId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-mono font-medium border ${
                          topic.difficulty === "HARD"
                            ? "bg-rose-950/40 text-rose-300 border-rose-900/60"
                            : topic.difficulty === "MEDIUM"
                            ? "bg-amber-950/40 text-amber-300 border-amber-900/60"
                            : "bg-emerald-950/40 text-emerald-300 border-emerald-900/60"
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/[0.06] font-mono">
                        {topic.estimatedHours}h
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 leading-snug">{topic.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>

                  {/* Subtopics preview */}
                  {topic.subtopics && topic.subtopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {topic.subtopics.slice(0, 3).map((st, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#141A26] text-slate-300 border border-white/[0.05]"
                        >
                          {st}
                        </span>
                      ))}
                      {topic.subtopics.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono self-center">
                          +{topic.subtopics.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 5-Stage Stepper & Bidirectional Control Area */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Stage Progress:</span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isMastered ? "text-emerald-400" : "text-[#D8B668]"
                      }`}
                    >
                      {isMastered
                        ? "🏆 MASTERED"
                        : stages[currentStageNum - 1]?.name || `Stage ${currentStageNum}`}
                    </span>
                  </div>

                  {/* Interactive 5-Stage Stepper: Click any step to jump forward or backward! */}
                  <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-[#080A0F] border border-white/[0.06]">
                    {stages.map((stage) => {
                      const isPassed = isMastered || currentStageNum > stage.stageNumber;
                      const isCurrent = !isMastered && currentStageNum === stage.stageNumber;

                      return (
                        <button
                          key={stage.id}
                          type="button"
                          onClick={() => handleDirectStageClick(topic, stage.stageNumber)}
                          title={`Click to set stage: ${stage.name}`}
                          className={`h-7 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center justify-center gap-1 active:scale-95 ${
                            isPassed
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/60"
                              : isCurrent
                              ? "bg-[#C5A059] text-[#080A0F] shadow-[0_0_12px_rgba(197,160,89,0.4)] font-bold scale-[1.02]"
                              : "bg-[#141A26] text-slate-500 hover:text-slate-300 hover:bg-[#1A2233]"
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <span>{stage.stageNumber}</span>
                          )}
                          <span className="hidden sm:inline">{stage.shortName.slice(0, 5)}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Bidirectional Step Buttons, Materials, & Edit */}
                  <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Materials Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedTopicForMaterials(topic)}
                        className="text-[11px] px-3 py-1.5 rounded-xl bg-[#141A26] hover:bg-[#1F2839] text-slate-300 hover:text-white border border-white/[0.08] active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Materials ({materialsCount})</span>
                      </button>

                      {/* Edit Topic Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setTopicToEdit(topic);
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-[#141A26] hover:bg-[#1F2839] text-slate-400 hover:text-slate-200 border border-white/[0.06] active:scale-95 transition-all"
                        title="Edit Topic"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Forward and Backward Action Buttons */}
                    <div className="flex items-center gap-1.5 justify-end">
                      {/* Back Button (Active if past Stage 1 or Mastered) */}
                      {(currentStageNum > 1 || isMastered) && (
                        <button
                          type="button"
                          onClick={() => handleRegress(topic.id, currentStageNum, isMastered)}
                          className="text-[11px] px-2.5 py-1.5 rounded-xl bg-[#141A26] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] font-medium flex items-center gap-1 transition-all active:scale-95"
                          title="Step back to previous stage"
                        >
                          <ArrowLeft className="w-3 h-3" />
                          <span>Back</span>
                        </button>
                      )}

                      {/* Forward / Complete / Review Button */}
                      {isMastered ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[11px] px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Mastered</span>
                          </span>
                        </div>
                      ) : currentStageNum === stages.length ? (
                        <button
                          type="button"
                          onClick={() => handleAdvance(topic)}
                          className="text-[11px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:brightness-110 text-white font-bold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                        >
                          <span>Complete &amp; Earn +{currencySymbol}{coinPerTopic}</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAdvance(topic)}
                          className="text-[11px] px-3.5 py-1.5 rounded-xl bg-gradient-to-b from-[#D8B668] to-[#C5A059] hover:brightness-105 text-[#080A0F] font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95"
                        >
                          <span>Next Stage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <StageProgressModal
        isOpen={Boolean(selectedTopicForProgress)}
        onClose={() => setSelectedTopicForProgress(null)}
        topic={selectedTopicForProgress}
        progress={
          selectedTopicForProgress ? userProgressMap.get(selectedTopicForProgress.id) || null : null
        }
      />

      <StudyMaterialsModal
        isOpen={Boolean(selectedTopicForMaterials)}
        onClose={() => setSelectedTopicForMaterials(null)}
        topic={selectedTopicForMaterials}
      />

      <TopicEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setTopicToEdit(null);
        }}
        topicToEdit={topicToEdit}
      />
    </div>
  );
}
