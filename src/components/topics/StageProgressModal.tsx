"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store/useStore";
import { Topic, UserTopicProgress } from "@/lib/types";
import { CheckCircle2, ChevronRight, ArrowRight, ArrowLeft, Star, Coins } from "lucide-react";

interface StageProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic | null;
  progress: UserTopicProgress | null;
}

export const StageProgressModal: React.FC<StageProgressModalProps> = ({
  isOpen,
  onClose,
  topic,
  progress,
}) => {
  const { db, advanceTopicStage, regressTopicStage, setTopicStage, markTopicMastered, currentUser } = useStore();
  const [notes, setNotes] = useState("");
  const [score, setScore] = useState(5);

  if (!topic) return null;

  const currentStageNum = progress ? progress.currentStage : 1;
  const currentStageConfig = db.pipelineStages.find((s) => s.stageNumber === currentStageNum);
  const isMastered = progress?.isMastered || currentStageNum > db.pipelineStages.length;
  const coinPerTopic = db.economySettings?.coinsPerTopicMastered ?? 500;
  const currSymbol = db.economySettings?.currencySymbol ?? "₹";

  const handleAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    advanceTopicStage(topic.id, notes.trim() || undefined, score);
    setNotes("");
    onClose();
  };

  const handleRegress = () => {
    regressTopicStage(topic.id);
    onClose();
  };

  const handleSetStageDirectly = (stageNum: number) => {
    setTopicStage(topic.id, stageNum);
    onClose();
  };

  const handleMarkMasteredDirectly = () => {
    markTopicMastered(topic.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={topic.name}
      subtitle={`5-Stage Placement Completion Pipeline • ${currentUser.fullName}`}
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Pipeline Stepper Visualizer - Clickable Jump Steps */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Click Any Stage to Jump or Step:
          </label>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {db.pipelineStages.map((stage) => {
              const isCompleted =
                progress && (progress.isMastered || progress.currentStage > stage.stageNumber);
              const isCurrent =
                progress
                  ? progress.currentStage === stage.stageNumber && !progress.isMastered
                  : stage.stageNumber === 1;

              return (
                <div key={stage.id} className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSetStageDirectly(stage.stageNumber)}
                    title={`Jump to ${stage.name}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                      isCompleted
                        ? "bg-emerald-950/40 border-emerald-800 text-emerald-300 hover:bg-emerald-900/50"
                        : isCurrent
                        ? "bg-[#C5A059] border-[#C5A059] text-[#080A0F] font-bold shadow-[0_0_12px_rgba(197,160,89,0.35)]"
                        : "bg-[#141A26] border-white/[0.06] text-slate-400 hover:text-white hover:bg-[#1A2233]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-[#0E121B] text-[10px] flex items-center justify-center font-mono">
                        {stage.stageNumber}
                      </span>
                    )}
                    <span>{stage.shortName}</span>
                  </button>
                  {stage.stageNumber < db.pipelineStages.length && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </div>
              );
            })}

            {/* Mastered Step Pill */}
            <div className="flex items-center gap-1.5 flex-shrink-0 pl-1 border-l border-white/[0.08]">
              <button
                type="button"
                onClick={() => handleSetStageDirectly(db.pipelineStages.length + 1)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${
                  isMastered
                    ? "bg-emerald-950/60 border-emerald-800 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                    : "bg-[#141A26] border-white/[0.06] text-slate-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Mastered</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Stage Requirements & Details */}
        <div className="p-4 rounded-xl bg-[#141A26] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              {isMastered ? "Topic Fully Mastered" : currentStageConfig?.name || "Topic Review"}
            </h4>
            {isMastered ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ALL 5 STAGES COMPLETED (+{currSymbol}{coinPerTopic} EARNED)
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400">
                Min {currentStageConfig?.minIntervalDays || 1}d interval
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {isMastered
              ? "All learning, revisions, and mock interview preparations for this topic have been successfully completed."
              : currentStageConfig?.description}
          </p>

          {/* Stage Requirements Checklist */}
          {!isMastered && currentStageConfig?.requirements && currentStageConfig.requirements.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Stage Requirements Checklist:
              </span>
              <ul className="space-y-1 text-xs text-slate-300">
                {currentStageConfig.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C5A059]" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Advance Form */}
        {!isMastered && (
          <form onSubmit={handleAdvance} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1 uppercase tracking-wider">
                Revision &amp; Understanding Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log key insights, tricky edge cases, and formulas mastered during this stage..."
                rows={3}
                className="w-full text-xs p-3 bg-[#0E121B] border border-white/[0.08] rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2">
              <div className="flex items-center gap-2">
                {currentStageNum > 1 && (
                  <button
                    type="button"
                    onClick={handleRegress}
                    className="px-3 py-2 rounded-xl bg-[#141A26] text-slate-300 text-xs hover:bg-slate-800 border border-white/[0.06] flex items-center gap-1 font-semibold transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Stage {currentStageNum - 1}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleMarkMasteredDirectly}
                  className="px-3 py-2 rounded-xl bg-[#141A26] text-[#D8B668] text-xs hover:bg-[#1A2233] border border-[#C5A059]/30 flex items-center gap-1.5 font-semibold transition-all"
                >
                  <Coins className="w-3.5 h-3.5 text-[#D8B668]" />
                  <span>Mark Mastered (+{currSymbol}{coinPerTopic})</span>
                </button>
              </div>

              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>Advance to Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        )}

        {isMastered && (
          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={() => handleSetStageDirectly(db.pipelineStages.length)}
              className="px-3.5 py-2 rounded-xl bg-[#141A26] text-slate-300 text-xs hover:bg-slate-800 border border-white/[0.06] flex items-center gap-1 font-semibold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Revert to Stage 5 for Revision
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-[#C5A059] text-[#080A0F] font-bold text-xs"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
