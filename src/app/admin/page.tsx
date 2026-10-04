"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store/useStore";
import { User, Topic, Subject, PipelineStageConfig, Achievement, EconomySettings } from "@/lib/types";
import { INITIAL_LEETCODE_TOPICS } from "@/lib/store/initialData";
import {
  ShieldAlert,
  Calendar,
  Save,
  Download,
  Upload,
  CheckCircle2,
  Lock,
  Layers,
  RotateCcw,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  Bell,
  CheckSquare,
  FileText,
  Coins,
  Trophy,
  Flame,
  Zap,
  Crown,
  Award,
  Code2,
  X,
  ArrowUp,
  ArrowDown,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function AdminControlPage() {
  const {
    db,
    currentUser,
    updateMissionConfig,
    addSubject,
    updateSubject,
    deleteSubject,
    reorderSubjects,
    addTopic,
    updateTopic,
    deleteTopic,
    updatePipelineStages,
    addTask,
    deleteTask,
    updateEconomySettings,
    grantUserMoney,
    addAchievement,
    deleteAchievement,
    addLeetCodeTopic,
    deleteLeetCodeTopic,
    resetDatabase,
    restoreDatabase,
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    "economy" | "subjects" | "stages" | "mission" | "users" | "tasks" | "notifications" | "backup"
  >("economy");

  // Mission Deadline & Title State
  const [missionTitle, setMissionTitle] = useState(db.missionConfig.title);
  const [targetDeadline, setTargetDeadline] = useState(
    db.missionConfig.targetDeadline
      ? db.missionConfig.targetDeadline.replace(":00.000Z", "").slice(0, 16)
      : "2027-07-01T00:00"
  );
  const [announcementText, setAnnouncementText] = useState(db.missionConfig.announcement?.text || "");
  const [announcementActive, setAnnouncementActive] = useState(db.missionConfig.announcement?.active ?? true);

  // Subject Form State
  const [newSubName, setNewSubName] = useState("");
  const [newSubCode, setNewSubCode] = useState("");
  const [newSubDesc, setNewSubDesc] = useState("");

  // Inline Subject Editing State
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState("");
  const [editSubCode, setEditSubCode] = useState("");
  const [editSubDesc, setEditSubDesc] = useState("");

  // Expanded Subject for topics management
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  // Dynamic Topic Form State
  const [selectedSubIdForTopic, setSelectedSubIdForTopic] = useState(db.subjects[0]?.id || "");
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicDesc, setNewTopicDesc] = useState("");
  const [newTopicPriority, setNewTopicPriority] = useState<"CRITICAL" | "HIGH" | "MEDIUM">("HIGH");
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [newTopicHours, setNewTopicHours] = useState(4);

  // Common Task Form State
  const [commonTaskTitle, setCommonTaskTitle] = useState("");
  const [commonTaskCat, setCommonTaskCat] = useState("Core DSA");
  const [commonTaskDate, setCommonTaskDate] = useState(new Date().toISOString().split("T")[0]);

  // Virtual Money / Economy Settings State
  const [coinPerProblem, setCoinPerProblem] = useState(db.economySettings?.coinsPerProblem ?? 100);
  const [coinPerStreakDay, setCoinPerStreakDay] = useState(db.economySettings?.coinsPerStreakDay ?? 250);
  const [coinPerTopicMastered, setCoinPerTopicMastered] = useState(db.economySettings?.coinsPerTopicMastered ?? 500);
  const [coinPerTaskCompleted, setCoinPerTaskCompleted] = useState(db.economySettings?.coinsPerTaskCompleted ?? 50);
  const [currSymbol, setCurrSymbol] = useState(db.economySettings?.currencySymbol ?? "₹");
  const [currName, setCurrName] = useState(db.economySettings?.currencyName ?? "Prep Cash");

  // Grant Money Form State
  const [grantCandidateId, setGrantCandidateId] = useState("user-anuraj");
  const [grantAmount, setGrantAmount] = useState(500);
  const [grantReason, setGrantReason] = useState("Disciplined daily consistency bonus");

  // Add Achievement State
  const [achTitle, setAchTitle] = useState("");
  const [achDesc, setAchDesc] = useState("");
  const [achTarget, setAchTarget] = useState(15);
  const [achReward, setAchReward] = useState(2000);
  const [achCategory, setAchCategory] = useState<"SOLVES" | "STREAK" | "TOPICS" | "SPECIAL">("SOLVES");

  // Dynamic LeetCode Topic State
  const [adminNewLeetCodeTopic, setAdminNewLeetCodeTopic] = useState("");

  // Editable 5-Stage Pipeline Configuration
  const [editableStages, setEditableStages] = useState<PipelineStageConfig[]>(db.pipelineStages);

  useEffect(() => {
    setEditableStages(db.pipelineStages);
  }, [db.pipelineStages]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveMission = (e: React.FormEvent) => {
    e.preventDefault();
    updateMissionConfig({
      title: missionTitle,
      targetDeadline: new Date(targetDeadline).toISOString(),
      announcement: {
        active: announcementActive,
        text: announcementText,
        updatedAt: new Date().toISOString(),
      },
    });
    showStatus("Mission parameters saved successfully!");
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubCode.trim()) return;
    addSubject({
      name: newSubName.trim(),
      code: newSubCode.trim().toUpperCase(),
      icon: "Code2",
      description: newSubDesc.trim(),
      orderIndex: db.subjects.length + 1,
    });
    setNewSubName("");
    setNewSubCode("");
    setNewSubDesc("");
    showStatus("New subject added!");
  };

  const handleStartEditSubject = (sub: Subject) => {
    setEditingSubId(sub.id);
    setEditSubName(sub.name);
    setEditSubCode(sub.code);
    setEditSubDesc(sub.description);
  };

  const handleSaveEditSubject = (subjectId: string) => {
    if (!editSubName.trim()) return;
    updateSubject(subjectId, {
      name: editSubName.trim(),
      code: editSubCode.trim().toUpperCase(),
      description: editSubDesc.trim(),
    });
    setEditingSubId(null);
    showStatus("Subject updated successfully!");
  };

  const handleMoveSubject = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= db.subjects.length) return;
    const newSubjects = [...db.subjects];
    const temp = newSubjects[index];
    newSubjects[index] = newSubjects[newIndex];
    newSubjects[newIndex] = temp;
    reorderSubjects(newSubjects.map((s) => s.id));
    showStatus("Subject order updated!");
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedSubIdForTopic) return;
    addTopic({
      subjectId: selectedSubIdForTopic,
      categoryId: "cat-default",
      name: newTopicName.trim(),
      description: newTopicDesc.trim(),
      priority: newTopicPriority,
      difficulty: newTopicDifficulty,
      estimatedHours: Number(newTopicHours),
      assignedTo: "all",
      orderIndex: db.topics.length + 1,
      isActive: true,
      subtopics: [],
    });
    setNewTopicName("");
    setNewTopicDesc("");
    showStatus("New topic created dynamically!");
  };

  const handleSaveEconomy = (e: React.FormEvent) => {
    e.preventDefault();
    updateEconomySettings({
      coinsPerProblem: Number(coinPerProblem),
      coinsPerStreakDay: Number(coinPerStreakDay),
      coinsPerTopicMastered: Number(coinPerTopicMastered),
      coinsPerTaskCompleted: Number(coinPerTaskCompleted),
      currencySymbol: currSymbol.trim() || "₹",
      currencyName: currName.trim() || "Prep Cash",
    });
    showStatus("Virtual economy settings saved dynamically!");
  };

  const handleGrantMoney = (e: React.FormEvent) => {
    e.preventDefault();
    if (grantAmount <= 0) return;
    grantUserMoney(grantCandidateId, Number(grantAmount), grantReason);
    showStatus(`Granted ${currSymbol}${grantAmount} to ${grantCandidateId === "user-anuraj" ? "Anuraj" : "Soumyajit"}!`);
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achTitle.trim()) return;
    addAchievement({
      title: achTitle.trim(),
      description: achDesc.trim(),
      icon: achCategory === "STREAK" ? "Flame" : achCategory === "SOLVES" ? "Trophy" : "Crown",
      category: achCategory,
      rewardAmount: Number(achReward),
      targetCount: Number(achTarget),
    });
    setAchTitle("");
    setAchDesc("");
    showStatus("New game achievement created!");
  };

  const handleAddAdminLeetCodeTopic = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminNewLeetCodeTopic.trim();
    if (!clean) return;
    addLeetCodeTopic(clean);
    setAdminNewLeetCodeTopic("");
    showStatus(`Added LeetCode topic: ${clean}!`);
  };

  const handleSaveStages = (e: React.FormEvent) => {
    e.preventDefault();
    updatePipelineStages(editableStages);
    showStatus("5-Stage Placement Pipeline saved dynamically!");
  };

  const handleUpdateStageField = (index: number, field: keyof PipelineStageConfig, value: any) => {
    const updated = [...editableStages];
    updated[index] = { ...updated[index], [field]: value };
    setEditableStages(updated);
  };

  const handleAddCommonTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commonTaskTitle.trim()) return;
    db.users.forEach((u) => {
      addTask({
        title: commonTaskTitle.trim(),
        description: "Shared Mission Task",
        priority: "HIGH",
        category: commonTaskCat,
        targetDate: commonTaskDate,
        estimatedMinutes: 60,
        status: "TODO",
        isSharedTask: true,
      });
    });
    setCommonTaskTitle("");
    showStatus("Common mission task created for both candidates!");
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `SAP_Mission_2027_Backup_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        restoreDatabase(parsed);
        showStatus("Database restored from backup snapshot!");
      } catch (err) {
        alert("Invalid JSON backup file.");
      }
    };
    reader.readAsText(file);
  };

  const wallets = db.virtualWallets || [];
  const anurajWallet = wallets.find((w) => w.userId === "user-anuraj") || { balance: 0, totalEarned: 0 };
  const soumyajitWallet = wallets.find((w) => w.userId === "user-soumyajit") || { balance: 0, totalEarned: 0 };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#C5A059]" />
              Shared Administrator Panel
            </h1>
            <span className="text-[10px] px-2.5 py-0.5 rounded-md bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
              Anuraj × Soumyajit (Dual Admin)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fully dynamic settings &bull; Virtual economy, subjects, topics, 5 stages, deadlines &amp; schedules
          </p>
        </div>

        {statusMessage && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-1.5 font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 p-1.5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
        {[
          { id: "economy", label: "Virtual Money & Game Awards", icon: Coins },
          { id: "subjects", label: `Subjects (${db.subjects.length}) & Topics`, icon: BookOpen },
          { id: "stages", label: "5 Revision Stages", icon: Layers },
          { id: "mission", label: "Mission Deadline", icon: Calendar },
          { id: "users", label: "Candidates & Privileges", icon: Lock },
          { id: "tasks", label: "Common Tasks", icon: CheckSquare },
          { id: "notifications", label: "Push Schedules", icon: Bell },
          { id: "backup", label: "Backup & Restore", icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                isActive
                  ? "bg-[#C5A059] text-[#080A0F] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_6px_rgba(0,0,0,0.4)]"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB: VIRTUAL MONEY & GAME AWARDS (GAMIFICATION CONTROLLER)
         ========================================================================= */}
      {activeTab === "economy" && (
        <div className="space-y-6">
          {/* Candidate Wallets Live Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#0E121B] border border-[#C5A059]/40 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Anuraj&apos;s Virtual Wallet
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#C5A059]/20 text-[#D8B668] font-mono font-bold">
                  ADMIN
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#D8B668]">
                  {currSymbol}{anurajWallet.balance.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">
                  (Total Earned: {currSymbol}{anurajWallet.totalEarned.toLocaleString()})
                </span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#0E121B] border border-[#C5A059]/40 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Soumyajit&apos;s Virtual Wallet
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#C5A059]/20 text-[#D8B668] font-mono font-bold">
                  ADMIN
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-[#D8B668]">
                  {currSymbol}{soumyajitWallet.balance.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">
                  (Total Earned: {currSymbol}{soumyajitWallet.totalEarned.toLocaleString()})
                </span>
              </div>
            </div>
          </div>

          {/* Form 1: Economy Settings */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#C5A059]" />
                  Dynamic Reward Rates
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set how much virtual cash is awarded for solving problems, maintaining streaks, and mastering topics.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEconomy} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Coins Per Problem Solved
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={coinPerProblem}
                    onChange={(e) => setCoinPerProblem(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Coins Per Daily Streak Day
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={coinPerStreakDay}
                    onChange={(e) => setCoinPerStreakDay(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Coins Per Topic Mastered (All 5 Stages)
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={coinPerTopicMastered}
                    onChange={(e) => setCoinPerTopicMastered(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Coins Per Common Task Completed
                  </label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={coinPerTaskCompleted}
                    onChange={(e) => setCoinPerTaskCompleted(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currSymbol}
                    onChange={(e) => setCurrSymbol(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Currency Name
                  </label>
                  <input
                    type="text"
                    value={currName}
                    onChange={(e) => setCurrName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                >
                  <Save className="w-4 h-4" /> Save Economy Settings
                </button>
              </div>
            </form>
          </div>

          {/* Form 2: Manual Wallet Grant / Bonus */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#C5A059]" />
              Grant Virtual Cash to Candidate
            </h3>

            <form onSubmit={handleGrantMoney} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-3">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Candidate</label>
                <select
                  value={grantCandidateId}
                  onChange={(e) => setGrantCandidateId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                >
                  <option value="user-anuraj">Anuraj</option>
                  <option value="user-soumyajit">Soumyajit</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Amount</label>
                <input
                  type="number"
                  min="50"
                  step="50"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono font-bold"
                  required
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={grantReason}
                  onChange={(e) => setGrantReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  placeholder="e.g. 5 days unbroken discipline award"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full px-3 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Grant Cash
                </button>
              </div>
            </form>
          </div>

          {/* Form 3: Game Achievements & Awards Manager */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#C5A059]" />
              Manage Game Achievements &amp; Awards ({(db.achievements || []).length})
            </h3>

            {/* List of active achievements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(db.achievements || []).map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-xl bg-[#141A26] border border-white/[0.06] flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">{ach.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#C5A059]/20 text-[#D8B668] border border-[#C5A059]/40 font-bold">
                        +{currSymbol}{ach.rewardAmount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">{ach.description}</p>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">
                      Target: {ach.targetCount} ({ach.category})
                    </span>
                  </div>

                  <button
                    onClick={() => deleteAchievement(ach.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete achievement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Create New Achievement */}
            <form onSubmit={handleAddAchievement} className="pt-3 border-t border-white/[0.06] space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                + Create Custom Game Award
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    required
                    placeholder="Award Title (e.g. Graph Grandmaster)"
                    value={achTitle}
                    onChange={(e) => setAchTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    required
                    placeholder="Requirement (e.g. Solve 20 Graph problems)"
                    value={achDesc}
                    onChange={(e) => setAchDesc(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="number"
                    min="1"
                    placeholder="Target Count"
                    value={achTarget}
                    onChange={(e) => setAchTarget(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full px-3 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs"
                  >
                    Add Award
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: SUBJECTS & DYNAMIC TOPICS MANAGER
         ========================================================================= */}
      {activeTab === "subjects" && (
        <div className="space-y-6">
          {/* Add Subject Card */}
          <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#C5A059]" />
              Add New Subject
            </h3>

            <form onSubmit={handleAddSubject} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-5">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems or Generative AI"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIST"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 font-mono focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="sm:col-span-4">
                <button
                  type="submit"
                  className="w-full px-3 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Subject
                </button>
              </div>
            </form>
          </div>

          {/* Add Topic Under Subject Card */}
          <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#C5A059]" />
              Add New Topic Under Subject
            </h3>

            <form onSubmit={handleAddTopic} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Select Subject</label>
                  <select
                    value={selectedSubIdForTopic}
                    onChange={(e) => setSelectedSubIdForTopic(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  >
                    {db.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Topic Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red-Black Trees, Raft Consensus"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newTopicPriority}
                    onChange={(e) => setNewTopicPriority(e.target.value as "CRITICAL" | "HIGH" | "MEDIUM")}
                    className="w-full text-xs px-2 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Difficulty</label>
                  <select
                    value={newTopicDifficulty}
                    onChange={(e) => setNewTopicDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
                    className="w-full text-xs px-2 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Short description or syllabus scope..."
                    value={newTopicDesc}
                    onChange={(e) => setNewTopicDesc(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs whitespace-nowrap"
                >
                  + Add Topic
                </button>
              </div>
            </form>
          </div>

          {/* Subjects Table with Inline Editing, Reordering, and Expandable Topics */}
          <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Active Subjects ({db.subjects.length}) &bull; Reorder, Edit &amp; View Topics
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Order</th>
                    <th className="py-2.5 px-3">Subject Name</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Topics Count</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {db.subjects.map((sub, i) => {
                    const topics = db.topics.filter((t) => t.subjectId === sub.id && !t.isArchived);
                    const isEditing = editingSubId === sub.id;
                    const isExpanded = expandedSubId === sub.id;

                    return (
                      <React.Fragment key={sub.id}>
                        <tr className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            <div className="flex items-center gap-1">
                              <span>{i + 1}</span>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  disabled={i === 0}
                                  onClick={() => handleMoveSubject(i, "up")}
                                  className="text-slate-500 hover:text-white disabled:opacity-20"
                                  title="Move Up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={i === db.subjects.length - 1}
                                  onClick={() => handleMoveSubject(i, "down")}
                                  className="text-slate-500 hover:text-white disabled:opacity-20"
                                  title="Move Down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editSubName}
                                onChange={(e) => setEditSubName(e.target.value)}
                                className="text-xs px-2 py-1 rounded bg-[#141A26] border border-[#C5A059] text-white w-full"
                              />
                            ) : (
                              <span className="font-bold text-slate-200">{sub.name}</span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 font-mono text-[#D8B668]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editSubCode}
                                onChange={(e) => setEditSubCode(e.target.value)}
                                className="text-xs px-2 py-1 rounded bg-[#141A26] border border-[#C5A059] text-white font-mono w-20"
                              />
                            ) : (
                              sub.code
                            )}
                          </td>

                          <td className="py-2.5 px-3 text-slate-400">
                            <button
                              type="button"
                              onClick={() => setExpandedSubId(isExpanded ? null : sub.id)}
                              className="text-xs text-slate-300 hover:text-[#D8B668] flex items-center gap-1"
                            >
                              <span>{topics.length} topics</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEditSubject(sub.id)}
                                    className="p-1 rounded text-emerald-400 hover:bg-emerald-950/60"
                                    title="Save"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingSubId(null)}
                                    className="p-1 rounded text-slate-400 hover:bg-slate-800"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEditSubject(sub)}
                                    className="p-1 rounded text-slate-400 hover:text-[#D8B668]"
                                    title="Edit Subject"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteSubject(sub.id)}
                                    className="p-1 rounded text-slate-500 hover:text-rose-400"
                                    title="Delete Subject"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>

                        {/* Collapsible Topics Drawer under Subject */}
                        {isExpanded && (
                          <tr className="bg-[#141A26]/50">
                            <td colSpan={5} className="p-3">
                              <div className="pl-6 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Topics in {sub.name}:
                                </span>
                                {topics.length === 0 ? (
                                  <p className="text-xs text-slate-500">No topics added under this subject yet.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {topics.map((t) => (
                                      <div
                                        key={t.id}
                                        className="p-2 rounded-lg bg-[#0E121B] border border-white/[0.06] flex items-center justify-between text-xs"
                                      >
                                        <div>
                                          <span className="font-semibold text-slate-200">{t.name}</span>
                                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                                            <span className="font-mono text-[#D8B668]">{t.priority}</span>
                                            <span>&bull;</span>
                                            <span>{t.difficulty}</span>
                                            <span>&bull;</span>
                                            <span>{t.estimatedHours}h</span>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => deleteTopic(t.id)}
                                          className="p-1 text-slate-500 hover:text-rose-400"
                                          title="Delete topic"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dynamic LeetCode Topics Manager */}
          <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-[#C5A059]" />
                  LeetCode Practice Topics ({(db.leetcodeTopics || INITIAL_LEETCODE_TOPICS).length})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Manage practice question categories available in the solve logger.
                </p>
              </div>
            </div>

            {/* Active Topics Pills */}
            <div className="flex flex-wrap gap-2">
              {(db.leetcodeTopics || INITIAL_LEETCODE_TOPICS).map((topic) => (
                <span
                  key={topic}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#141A26] border border-white/[0.08] text-xs text-slate-200 font-medium"
                >
                  <span>{topic}</span>
                  <button
                    type="button"
                    onClick={() => deleteLeetCodeTopic(topic)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                    title="Delete topic"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add Topic Input Form */}
            <form onSubmit={handleAddAdminLeetCodeTopic} className="pt-2 border-t border-white/[0.06] flex items-center gap-3">
              <input
                type="text"
                required
                placeholder="e.g. Trie, Segment Tree, Backtracking, System Design..."
                value={adminNewLeetCodeTopic}
                onChange={(e) => setAdminNewLeetCodeTopic(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#C5A059]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs whitespace-nowrap transition-colors"
              >
                + Add LeetCode Topic
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: 5 REVISION STAGES (FULLY EDITABLE PIPELINE)
         ========================================================================= */}
      {activeTab === "stages" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C5A059]" />
                5-Stage Placement Pipeline Configuration
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize stage names, descriptions, and interval days dynamically. Both Anuraj and Soumyajit follow this sequence.
              </p>
            </div>

            <button
              onClick={handleSaveStages}
              className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" /> Save Pipeline Stages
            </button>
          </div>

          <form onSubmit={handleSaveStages} className="space-y-4">
            {editableStages.map((stage, idx) => (
              <div
                key={stage.id}
                className="p-4 rounded-xl bg-[#141A26] border border-white/[0.06] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#0E121B] border border-white/[0.08] text-xs font-mono font-bold text-[#D8B668] flex items-center justify-center">
                      {stage.stageNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      Stage {stage.stageNumber} Settings
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {stage.id}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-5">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase">
                      Stage Full Name
                    </label>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleUpdateStageField(idx, "name", e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#0E121B] border border-white/[0.08] text-slate-100 font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase">
                      Short Name (Pill Display)
                    </label>
                    <input
                      type="text"
                      value={stage.shortName}
                      onChange={(e) => handleUpdateStageField(idx, "shortName", e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#0E121B] border border-white/[0.08] text-slate-100 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase">
                      Min Days Interval
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stage.minIntervalDays}
                      onChange={(e) =>
                        handleUpdateStageField(idx, "minIntervalDays", Number(e.target.value))
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl bg-[#0E121B] border border-white/[0.08] text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1 uppercase">
                    Description &amp; Purpose
                  </label>
                  <textarea
                    rows={2}
                    value={stage.description}
                    onChange={(e) => handleUpdateStageField(idx, "description", e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-[#0E121B] border border-white/[0.08] text-slate-100"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" /> Save All Pipeline Stage Changes
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB: MISSION DEADLINE
         ========================================================================= */}
      {activeTab === "mission" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Mission Target Deadline &amp; Title
          </h3>

          <form onSubmit={handleSaveMission} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Mission Title
              </label>
              <input
                type="text"
                value={missionTitle}
                onChange={(e) => setMissionTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[#141A26] border border-white/[0.08] rounded-xl text-slate-100 focus:outline-none focus:border-[#C5A059]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Target Deadline (Live Countdown Destination)
                </label>
                <input
                  type="datetime-local"
                  value={targetDeadline}
                  onChange={(e) => setTargetDeadline(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-[#141A26] border border-white/[0.08] rounded-xl text-slate-100 font-mono focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Mission Target Standard
                </label>
                <input
                  type="text"
                  value="1 July 2027 (Asia/Kolkata)"
                  disabled
                  className="w-full text-xs px-3 py-2 bg-[#141A26]/50 border border-white/[0.04] rounded-xl text-slate-400 font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                Announcement Banner
              </label>
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full text-xs p-3 bg-[#141A26] border border-white/[0.08] rounded-xl text-slate-100 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" /> Save Mission Parameters
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB: USERS & PRIVILEGES
         ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {db.users.map((u: User) => (
              <div
                key={u.id}
                className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#141A26] border border-white/[0.1] text-[#D8B668] font-bold text-base flex items-center justify-center">
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-100">{u.fullName}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#C5A059]/15 text-[#D8B668] font-mono font-bold border border-[#C5A059]/30">
                        FULL ADMINISTRATOR
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{u.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] text-xs text-slate-400 space-y-1">
                  <p>Target: <strong className="text-slate-200">{u.targetRole}</strong></p>
                  <p className="text-[11px] text-[#D8B668]">
                    Granted: Add/Edit/Delete Subjects &amp; Topics, Manage Stages, Manage Common Tasks, Change Deadline, Economy.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: COMMON TASKS
         ========================================================================= */}
      {activeTab === "tasks" && (
        <div className="p-5 sm:p-6 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Create Shared Task for Both Anuraj &amp; Soumyajit
          </h3>

          <form onSubmit={handleAddCommonTask} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-6">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete 5 DP Problems and review SAP HANA Column Store"
                value={commonTaskTitle}
                onChange={(e) => setCommonTaskTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Date</label>
              <input
                type="date"
                value={commonTaskDate}
                onChange={(e) => setCommonTaskDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[#141A26] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full px-3 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Create for Both
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================================================================
          TAB: PUSH NOTIFICATION SCHEDULES
         ========================================================================= */}
      {activeTab === "notifications" && (
        <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Daily Notification Schedules (Section 9 Defaults)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              8:00 AM (Start Preparation) &bull; 1:00 PM (Check Progress) &bull; 9:00 PM (Daily Progress Update)
            </p>
          </div>

          <div className="space-y-3">
            {db.notificationSchedules.map((sched) => (
              <div
                key={sched.id}
                className="p-3.5 rounded-xl bg-[#141A26] border border-white/[0.06] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#D8B668]">{sched.time}</span>
                    <h4 className="text-xs font-bold text-slate-200">{sched.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{sched.defaultMessage}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 font-mono">
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB: BACKUP & RESTORE
         ========================================================================= */}
      {activeTab === "backup" && (
        <div className="p-5 rounded-2xl bg-[#0E121B] border border-white/[0.08] shadow-sm space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Database Snapshot Backup &amp; Restore
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Export and restore all subjects, topics, LeetCode records, virtual money balances, and progress records
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#141A26] border border-white/[0.06] space-y-2">
              <h4 className="text-xs font-bold text-slate-200">Export Full JSON Database</h4>
              <p className="text-[11px] text-slate-400">
                Download a complete, offline backup JSON file of all data.
              </p>
              <button
                onClick={handleExportJSON}
                className="mt-2 px-3 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B668] text-[#080A0F] font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" /> Download JSON Backup
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#141A26] border border-white/[0.06] space-y-2">
              <h4 className="text-xs font-bold text-slate-200">Restore from JSON Backup</h4>
              <p className="text-[11px] text-slate-400">
                Upload and replace current state with a saved JSON file.
              </p>
              <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1F2839] hover:bg-slate-700 text-slate-200 font-medium text-xs cursor-pointer border border-white/[0.08]">
                <Upload className="w-3.5 h-3.5" />
                <span>Select JSON Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-rose-300">Reset to Pristine Default Seed</h4>
              <p className="text-[11px] text-rose-400/80">
                Restores the 17 subjects and default mission configuration.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm("Reset database to initial pristine seed?")) {
                  resetDatabase();
                  showStatus("Database reset to pristine initial seed.");
                }
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-200 text-xs font-semibold"
            >
              Reset Seed
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
