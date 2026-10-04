"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AppDatabase,
  User,
  Subject,
  Category,
  Topic,
  PipelineStageConfig,
  UserTopicProgress,
  StudyMaterial,
  CodingProblem,
  DailyTask,
  DailyJournal,
  MockInterview,
  InterviewQuestion,
  ProjectPortfolio,
  ResumeChecklistItem,
  NotificationScheduleConfig,
  MissionConfig,
  AuditLog,
  NotificationLog,
  VirtualWallet,
  WalletTransaction,
  Achievement,
  EconomySettings,
} from "../types";
import { loadDatabase, saveDatabase, getInitialDatabase } from "./storage";
import { INITIAL_LEETCODE_TOPICS } from "./initialData";
import { computeUserSummary, UserPerformanceSummary } from "../services/analyticsEngine";

export function useStore() {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loaded = loadDatabase();
    setDb(loaded);

    const handleStorageChange = () => {
      setDb(loadDatabase());
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("sap_mission_db_updated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("sap_mission_db_updated", handleStorageChange);
    };
  }, []);

  const updateDb = useCallback((updater: (prev: AppDatabase) => AppDatabase) => {
    setDb((prev) => {
      const next = updater(prev);
      saveDatabase(next);
      return next;
    });
  }, []);

  const currentUser = useMemo(() => {
    return db.users.find((u) => u.id === db.currentUserId) || db.users[0];
  }, [db.users, db.currentUserId]);

  const activeUserSummary = useMemo(() => {
    return computeUserSummary(db, currentUser.id);
  }, [db, currentUser.id]);

  const anurajSummary = useMemo(() => {
    return computeUserSummary(db, "user-anuraj");
  }, [db]);

  const soumyajitSummary = useMemo(() => {
    return computeUserSummary(db, "user-soumyajit");
  }, [db]);

  const activeUserWallet = useMemo<VirtualWallet>(() => {
    const wallets = db.virtualWallets || [];
    return (
      wallets.find((w) => w.userId === currentUser.id) || {
        userId: currentUser.id,
        balance: 0,
        totalEarned: 0,
        transactions: [],
      }
    );
  }, [db.virtualWallets, currentUser.id]);

  // Log audit helper
  const logAudit = useCallback((action: string, entityType: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: db.currentUserId,
      userName: db.users.find((u) => u.id === db.currentUserId)?.fullName || "User",
      action,
      entityType,
      details,
    };
    updateDb((prev) => ({
      ...prev,
      auditLogs: [newLog, ...(prev.auditLogs || []).slice(0, 99)],
    }));
  }, [db.currentUserId, db.users, updateDb]);

  // User Actions
  const setCurrentUser = useCallback((userId: string) => {
    updateDb((prev) => ({ ...prev, currentUserId: userId }));
    logAudit("SWITCH_USER", "User", `Switched active session to ${userId}`);
  }, [updateDb, logAudit]);

  const setTheme = useCallback((theme: "dark" | "light") => {
    updateDb((prev) => ({ ...prev, theme }));
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [updateDb]);

  // 5-Stage Topic Pipeline Actions with Gamified Virtual Money Rewards
  const advanceTopicStage = useCallback((topicId: string, notes?: string, score?: number) => {
    updateDb((prev) => {
      const existingProgIdx = prev.userProgress.findIndex(
        (p) => p.userId === prev.currentUserId && p.topicId === topicId
      );
      const totalStages = prev.pipelineStages.length || 5;

      let isNewlyMastered = false;
      const newUserProgress = [...prev.userProgress];

      if (existingProgIdx >= 0) {
        const current = prev.userProgress[existingProgIdx];
        const nextStage = current.currentStage + 1;
        const isMastered = nextStage > totalStages;
        isNewlyMastered = isMastered && !current.isMastered;

        const stageConfig = prev.pipelineStages.find((s) => s.stageNumber === current.currentStage);
        const stageName = stageConfig ? stageConfig.name : `Stage ${current.currentStage}`;

        const nextRevision = new Date();
        nextRevision.setDate(nextRevision.getDate() + 7);

        newUserProgress[existingProgIdx] = {
          ...current,
          currentStage: Math.min(totalStages + 1, nextStage),
          isMastered,
          notes: notes !== undefined ? notes : current.notes,
          lastStudiedAt: new Date().toISOString(),
          nextRevisionDate: isMastered ? undefined : nextRevision.toISOString().split("T")[0],
          completedAt: isMastered ? new Date().toISOString() : undefined,
          stageHistory: [
            ...current.stageHistory,
            {
              stageNumber: current.currentStage,
              stageName,
              completedAt: new Date().toISOString(),
              notes,
              score: score || 5,
            },
          ],
        };
      } else {
        newUserProgress.push({
          id: `prog-${Date.now()}`,
          userId: prev.currentUserId,
          topicId,
          currentStage: 2,
          isMastered: false,
          confidenceLevel: 4,
          notes: notes || "Started learning",
          lastStudiedAt: new Date().toISOString(),
          stageHistory: [
            {
              stageNumber: 1,
              stageName: prev.pipelineStages[0]?.name || "Stage 1: Learning / Study",
              completedAt: new Date().toISOString(),
              notes,
              score: score || 5,
            },
          ],
        });
      }

      // If newly mastered, credit virtual wallet & evaluate achievements!
      let wallets = prev.virtualWallets ? [...prev.virtualWallets] : [];
      let updatedAchievements = prev.achievements ? [...prev.achievements] : [];

      if (isNewlyMastered) {
        const coinReward = prev.economySettings?.coinsPerTopicMastered ?? 500;
        let walletIdx = wallets.findIndex((w) => w.userId === prev.currentUserId);
        if (walletIdx === -1) {
          wallets.push({
            userId: prev.currentUserId,
            balance: 0,
            totalEarned: 0,
            transactions: [],
          });
          walletIdx = wallets.length - 1;
        }
        const curWallet = wallets[walletIdx];
        const topicObj = prev.topics.find((t) => t.id === topicId);
        const topicTitle = topicObj?.name || "Topic";

        const newTx: WalletTransaction = {
          id: `tx-topic-${Date.now()}`,
          userId: prev.currentUserId,
          amount: coinReward,
          type: "TOPIC_MASTERED",
          description: `Mastered 5-Stage Pipeline: ${topicTitle}`,
          timestamp: new Date().toISOString(),
        };

        let newBalance = curWallet.balance + coinReward;
        let newTotalEarned = curWallet.totalEarned + coinReward;
        const newTransactions = [newTx, ...(curWallet.transactions || [])];

        const masteredCount = newUserProgress.filter(
          (p) => p.userId === prev.currentUserId && p.isMastered
        ).length;

        updatedAchievements = (prev.achievements || []).map((ach) => {
          const alreadyUnlocked = ach.unlockedUsers?.some((u) => u.userId === prev.currentUserId);
          if (alreadyUnlocked) return ach;
          if (ach.id === "ach-5-topics" && masteredCount >= ach.targetCount) {
            newBalance += ach.rewardAmount;
            newTotalEarned += ach.rewardAmount;
            newTransactions.unshift({
              id: `tx-ach-${Date.now()}-${ach.id}`,
              userId: prev.currentUserId,
              amount: ach.rewardAmount,
              type: "ACHIEVEMENT_UNLOCKED",
              description: `Award unlocked: ${ach.title}!`,
              timestamp: new Date().toISOString(),
            });
            return {
              ...ach,
              unlockedUsers: [
                ...ach.unlockedUsers,
                { userId: prev.currentUserId, unlockedAt: new Date().toISOString() },
              ],
            };
          }
          return ach;
        });

        wallets[walletIdx] = {
          ...curWallet,
          balance: newBalance,
          totalEarned: newTotalEarned,
          transactions: newTransactions.slice(0, 100),
        };
      }

      return {
        ...prev,
        userProgress: newUserProgress,
        virtualWallets: wallets,
        achievements: updatedAchievements,
      };
    });

    logAudit("ADVANCE_STAGE", "TopicPipeline", `Advanced topic ${topicId} in pipeline`);
  }, [updateDb, logAudit]);

  const regressTopicStage = useCallback((topicId: string) => {
    updateDb((prev) => {
      const existingProgIdx = prev.userProgress.findIndex(
        (p) => p.userId === prev.currentUserId && p.topicId === topicId
      );
      if (existingProgIdx >= 0) {
        const current = prev.userProgress[existingProgIdx];
        const prevStage = Math.max(1, current.currentStage - 1);
        const updatedProg: UserTopicProgress = {
          ...current,
          currentStage: prevStage,
          isMastered: false,
          lastStudiedAt: new Date().toISOString(),
        };
        const newUserProgress = [...prev.userProgress];
        newUserProgress[existingProgIdx] = updatedProg;
        return { ...prev, userProgress: newUserProgress };
      }
      return prev;
    });
    logAudit("REGRESS_STAGE", "TopicPipeline", `Regressed topic ${topicId} for revision`);
  }, [updateDb, logAudit]);

  const setTopicStage = useCallback((topicId: string, targetStage: number) => {
    updateDb((prev) => {
      const totalStages = prev.pipelineStages.length || 5;
      const clampedStage = Math.max(1, Math.min(totalStages + 1, targetStage));
      const isMastered = clampedStage > totalStages;
      const existingProgIdx = prev.userProgress.findIndex(
        (p) => p.userId === prev.currentUserId && p.topicId === topicId
      );

      let newUserProgress = [...prev.userProgress];
      let isNewlyMastered = false;

      if (existingProgIdx >= 0) {
        const current = prev.userProgress[existingProgIdx];
        isNewlyMastered = isMastered && !current.isMastered;
        newUserProgress[existingProgIdx] = {
          ...current,
          currentStage: clampedStage,
          isMastered,
          lastStudiedAt: new Date().toISOString(),
          completedAt: isMastered ? new Date().toISOString() : undefined,
        };
      } else {
        isNewlyMastered = isMastered;
        newUserProgress.push({
          id: `prog-${Date.now()}`,
          userId: prev.currentUserId,
          topicId,
          currentStage: clampedStage,
          isMastered,
          confidenceLevel: 4,
          notes: isMastered ? "Completed all stages" : `Set to stage ${clampedStage}`,
          lastStudiedAt: new Date().toISOString(),
          completedAt: isMastered ? new Date().toISOString() : undefined,
          stageHistory: [],
        });
      }

      // If newly mastered, credit virtual wallet & evaluate achievements!
      let wallets = prev.virtualWallets ? [...prev.virtualWallets] : [];
      let updatedAchievements = prev.achievements ? [...prev.achievements] : [];

      if (isNewlyMastered) {
        const coinReward = prev.economySettings?.coinsPerTopicMastered ?? 500;
        let walletIdx = wallets.findIndex((w) => w.userId === prev.currentUserId);
        if (walletIdx === -1) {
          wallets.push({
            userId: prev.currentUserId,
            balance: 0,
            totalEarned: 0,
            transactions: [],
          });
          walletIdx = wallets.length - 1;
        }
        const curWallet = wallets[walletIdx];
        const topicObj = prev.topics.find((t) => t.id === topicId);
        const topicTitle = topicObj?.name || "Topic";

        const newTx: WalletTransaction = {
          id: `tx-topic-${Date.now()}`,
          userId: prev.currentUserId,
          amount: coinReward,
          type: "TOPIC_MASTERED",
          description: `Mastered 5-Stage Pipeline: ${topicTitle}`,
          timestamp: new Date().toISOString(),
        };

        let newBalance = curWallet.balance + coinReward;
        let newTotalEarned = curWallet.totalEarned + coinReward;
        const newTransactions = [newTx, ...(curWallet.transactions || [])];

        const masteredCount = newUserProgress.filter(
          (p) => p.userId === prev.currentUserId && p.isMastered
        ).length;

        updatedAchievements = (prev.achievements || []).map((ach) => {
          const alreadyUnlocked = ach.unlockedUsers?.some((u) => u.userId === prev.currentUserId);
          if (alreadyUnlocked) return ach;
          if (ach.id === "ach-5-topics" && masteredCount >= ach.targetCount) {
            newBalance += ach.rewardAmount;
            newTotalEarned += ach.rewardAmount;
            newTransactions.unshift({
              id: `tx-ach-${Date.now()}-${ach.id}`,
              userId: prev.currentUserId,
              amount: ach.rewardAmount,
              type: "ACHIEVEMENT_UNLOCKED",
              description: `Award unlocked: ${ach.title}!`,
              timestamp: new Date().toISOString(),
            });
            return {
              ...ach,
              unlockedUsers: [
                ...ach.unlockedUsers,
                { userId: prev.currentUserId, unlockedAt: new Date().toISOString() },
              ],
            };
          }
          return ach;
        });

        wallets[walletIdx] = {
          ...curWallet,
          balance: newBalance,
          totalEarned: newTotalEarned,
          transactions: newTransactions.slice(0, 100),
        };
      }

      return {
        ...prev,
        userProgress: newUserProgress,
        virtualWallets: wallets,
        achievements: updatedAchievements,
      };
    });
    logAudit("SET_TOPIC_STAGE", "TopicPipeline", `Set topic ${topicId} stage to ${targetStage}`);
  }, [updateDb, logAudit]);

  const markTopicMastered = useCallback((topicId: string) => {
    updateDb((prev) => {
      const totalStages = prev.pipelineStages.length || 5;
      const existingProgIdx = prev.userProgress.findIndex(
        (p) => p.userId === prev.currentUserId && p.topicId === topicId
      );

      let isNewlyMastered = false;
      const newUserProgress = [...prev.userProgress];

      if (existingProgIdx >= 0) {
        const current = prev.userProgress[existingProgIdx];
        isNewlyMastered = !current.isMastered;
        newUserProgress[existingProgIdx] = {
          ...current,
          currentStage: totalStages + 1,
          isMastered: true,
          completedAt: new Date().toISOString(),
          lastStudiedAt: new Date().toISOString(),
        };
      } else {
        isNewlyMastered = true;
        newUserProgress.push({
          id: `prog-${Date.now()}`,
          userId: prev.currentUserId,
          topicId,
          currentStage: totalStages + 1,
          isMastered: true,
          confidenceLevel: 5,
          notes: "Marked completed",
          lastStudiedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          stageHistory: [],
        });
      }

      let wallets = prev.virtualWallets ? [...prev.virtualWallets] : [];
      let updatedAchievements = prev.achievements ? [...prev.achievements] : [];

      if (isNewlyMastered) {
        const coinReward = prev.economySettings?.coinsPerTopicMastered ?? 500;
        let walletIdx = wallets.findIndex((w) => w.userId === prev.currentUserId);
        if (walletIdx === -1) {
          wallets.push({
            userId: prev.currentUserId,
            balance: 0,
            totalEarned: 0,
            transactions: [],
          });
          walletIdx = wallets.length - 1;
        }
        const curWallet = wallets[walletIdx];
        const topicObj = prev.topics.find((t) => t.id === topicId);
        const topicTitle = topicObj?.name || "Topic";

        const newTx: WalletTransaction = {
          id: `tx-topic-${Date.now()}`,
          userId: prev.currentUserId,
          amount: coinReward,
          type: "TOPIC_MASTERED",
          description: `Mastered 5-Stage Pipeline: ${topicTitle}`,
          timestamp: new Date().toISOString(),
        };

        let newBalance = curWallet.balance + coinReward;
        let newTotalEarned = curWallet.totalEarned + coinReward;
        const newTransactions = [newTx, ...(curWallet.transactions || [])];

        const masteredCount = newUserProgress.filter(
          (p) => p.userId === prev.currentUserId && p.isMastered
        ).length;

        updatedAchievements = (prev.achievements || []).map((ach) => {
          const alreadyUnlocked = ach.unlockedUsers?.some((u) => u.userId === prev.currentUserId);
          if (alreadyUnlocked) return ach;
          if (ach.id === "ach-5-topics" && masteredCount >= ach.targetCount) {
            newBalance += ach.rewardAmount;
            newTotalEarned += ach.rewardAmount;
            newTransactions.unshift({
              id: `tx-ach-${Date.now()}-${ach.id}`,
              userId: prev.currentUserId,
              amount: ach.rewardAmount,
              type: "ACHIEVEMENT_UNLOCKED",
              description: `Award unlocked: ${ach.title}!`,
              timestamp: new Date().toISOString(),
            });
            return {
              ...ach,
              unlockedUsers: [
                ...ach.unlockedUsers,
                { userId: prev.currentUserId, unlockedAt: new Date().toISOString() },
              ],
            };
          }
          return ach;
        });

        wallets[walletIdx] = {
          ...curWallet,
          balance: newBalance,
          totalEarned: newTotalEarned,
          transactions: newTransactions.slice(0, 100),
        };
      }

      return {
        ...prev,
        userProgress: newUserProgress,
        virtualWallets: wallets,
        achievements: updatedAchievements,
      };
    });
    logAudit("TOPIC_COMPLETED", "Topic", `Topic ${topicId} completed all stages.`);
  }, [updateDb, logAudit]);

  const updateTopicNotes = useCallback((topicId: string, notes: string, confidenceLevel?: number) => {
    updateDb((prev) => {
      const existingProgIdx = prev.userProgress.findIndex(
        (p) => p.userId === prev.currentUserId && p.topicId === topicId
      );
      if (existingProgIdx >= 0) {
        const current = prev.userProgress[existingProgIdx];
        const updatedProg: UserTopicProgress = {
          ...current,
          notes,
          confidenceLevel: confidenceLevel !== undefined ? confidenceLevel : current.confidenceLevel,
          lastStudiedAt: new Date().toISOString(),
        };
        const newUserProgress = [...prev.userProgress];
        newUserProgress[existingProgIdx] = updatedProg;
        return { ...prev, userProgress: newUserProgress };
      } else {
        const newProg: UserTopicProgress = {
          id: `prog-${Date.now()}`,
          userId: prev.currentUserId,
          topicId,
          currentStage: 1,
          isMastered: false,
          confidenceLevel: confidenceLevel || 3,
          notes,
          lastStudiedAt: new Date().toISOString(),
          stageHistory: [],
        };
        return { ...prev, userProgress: [...prev.userProgress, newProg] };
      }
    });
  }, [updateDb]);

  const scheduleTopicRevision = useCallback((topicId: string, dateStr: string) => {
    updateDb((prev) => {
      const existingProgIdx = prev.userProgress.findIndex(
        (p) => p.userId === prev.currentUserId && p.topicId === topicId
      );
      if (existingProgIdx >= 0) {
        const current = prev.userProgress[existingProgIdx];
        const updatedProg: UserTopicProgress = {
          ...current,
          nextRevisionDate: dateStr,
        };
        const newUserProgress = [...prev.userProgress];
        newUserProgress[existingProgIdx] = updatedProg;
        return { ...prev, userProgress: newUserProgress };
      }
      return prev;
    });
    logAudit("SCHEDULE_REVISION", "Topic", `Scheduled revision for topic ${topicId} on ${dateStr}`);
  }, [updateDb, logAudit]);

  // Topic CRUD
  const addTopic = useCallback((topic: Omit<Topic, "id">) => {
    const newTopic: Topic = {
      ...topic,
      id: `top-${Date.now()}`,
      isActive: true,
      subtopics: topic.subtopics || [],
    };
    updateDb((prev) => ({
      ...prev,
      topics: [...prev.topics, newTopic],
    }));
    logAudit("CREATE_TOPIC", "Topic", `Created new topic: ${topic.name}`);
  }, [updateDb, logAudit]);

  const updateTopic = useCallback((topicId: string, data: Partial<Topic>) => {
    updateDb((prev) => ({
      ...prev,
      topics: prev.topics.map((t) => (t.id === topicId ? { ...t, ...data } : t)),
    }));
    logAudit("UPDATE_TOPIC", "Topic", `Updated topic ${topicId}`);
  }, [updateDb, logAudit]);

  const deleteTopic = useCallback((topicId: string) => {
    updateDb((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== topicId),
      userProgress: prev.userProgress.filter((p) => p.topicId !== topicId),
      studyMaterials: prev.studyMaterials.filter((m) => m.topicId !== topicId),
    }));
    logAudit("DELETE_TOPIC", "Topic", `Permanently deleted topic ${topicId}`);
  }, [updateDb, logAudit]);

  const softDeleteTopic = useCallback((topicId: string) => {
    updateDb((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId ? { ...t, isArchived: true, archivedAt: new Date().toISOString() } : t
      ),
    }));
    logAudit("ARCHIVE_TOPIC", "Topic", `Archived topic ${topicId}`);
  }, [updateDb, logAudit]);

  const restoreTopic = useCallback((topicId: string) => {
    updateDb((prev) => ({
      ...prev,
      topics: prev.topics.map((t) =>
        t.id === topicId ? { ...t, isArchived: false, archivedAt: undefined } : t
      ),
    }));
    logAudit("RESTORE_TOPIC", "Topic", `Restored topic ${topicId}`);
  }, [updateDb, logAudit]);

  const reorderTopics = useCallback((topicIds: string[]) => {
    updateDb((prev) => {
      const idMap = new Map<string, number>();
      topicIds.forEach((id, index) => idMap.set(id, index + 1));
      return {
        ...prev,
        topics: prev.topics.map((t) => ({
          ...t,
          orderIndex: idMap.get(t.id) ?? t.orderIndex,
        })),
      };
    });
  }, [updateDb]);

  // Subject CRUD
  const addSubject = useCallback((sub: Omit<Subject, "id">) => {
    const newSub: Subject = {
      ...sub,
      id: `sub-${Date.now()}`,
      orderIndex: sub.orderIndex || db.subjects.length + 1,
    };
    updateDb((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSub],
    }));
    logAudit("CREATE_SUBJECT", "Subject", `Added subject: ${sub.name}`);
  }, [db.subjects.length, updateDb, logAudit]);

  const updateSubject = useCallback((subjectId: string, data: Partial<Subject>) => {
    updateDb((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === subjectId ? { ...s, ...data } : s)),
    }));
    logAudit("UPDATE_SUBJECT", "Subject", `Updated subject ${subjectId}`);
  }, [updateDb, logAudit]);

  const deleteSubject = useCallback((subjectId: string) => {
    updateDb((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== subjectId),
      topics: prev.topics.filter((t) => t.subjectId !== subjectId),
    }));
    logAudit("DELETE_SUBJECT", "Subject", `Deleted subject ${subjectId}`);
  }, [updateDb, logAudit]);

  const reorderSubjects = useCallback((subjectIds: string[]) => {
    updateDb((prev) => {
      const idMap = new Map<string, number>();
      subjectIds.forEach((id, index) => idMap.set(id, index + 1));
      return {
        ...prev,
        subjects: prev.subjects.map((s) => ({
          ...s,
          orderIndex: idMap.get(s.id) ?? s.orderIndex,
        })),
      };
    });
  }, [updateDb]);

  // LeetCode Actions & Gamified Virtual Money Rewards
  const addCodingProblem = useCallback((problem: Omit<CodingProblem, "id" | "userId">) => {
    const newProblem: CodingProblem = {
      ...problem,
      id: `code-${Date.now()}`,
      userId: db.currentUserId,
    };

    updateDb((prev) => {
      const nextProblems = [newProblem, ...prev.codingProblems];
      const userId = prev.currentUserId;
      const coinPerProblem = prev.economySettings?.coinsPerProblem ?? 100;

      // 1. Update wallet
      const wallets = prev.virtualWallets ? [...prev.virtualWallets] : [];
      let walletIdx = wallets.findIndex((w) => w.userId === userId);
      if (walletIdx === -1) {
        wallets.push({
          userId,
          balance: 0,
          totalEarned: 0,
          transactions: [],
        });
        walletIdx = wallets.length - 1;
      }
      const curWallet = wallets[walletIdx];

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        userId,
        amount: coinPerProblem,
        type: "PROBLEM_SOLVED",
        description: `Solved ${problem.topicTag || "Problem"}: ${problem.problemName}`,
        timestamp: new Date().toISOString(),
      };

      let newBalance = curWallet.balance + coinPerProblem;
      let newTotalEarned = curWallet.totalEarned + coinPerProblem;
      const newTransactions = [newTx, ...(curWallet.transactions || [])];

      // 2. Evaluate Achievements
      const userSolves = nextProblems.filter((p) => p.userId === userId && p.status === "SOLVED");
      const solvesCount = userSolves.length;

      // Calculate streak
      const uniqueDays = Array.from(new Set(userSolves.map((p) => p.dateSolved))).sort();
      let streak = 0;
      let tempStreak = 0;
      let prevDate: Date | null = null;
      uniqueDays.forEach((dStr) => {
        const curr = new Date(dStr);
        if (prevDate) {
          const diffDays = Math.round((curr.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
          if (diffDays === 1) tempStreak++;
          else tempStreak = 1;
        } else {
          tempStreak = 1;
        }
        if (tempStreak > streak) streak = tempStreak;
        prevDate = curr;
      });

      // Solves in past 5 days
      const today = new Date();
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(today.getDate() - 5);
      const solvesIn5Days = userSolves.filter((p) => new Date(p.dateSolved) >= fiveDaysAgo).length;

      const updatedAchievements = (prev.achievements || []).map((ach) => {
        const alreadyUnlocked = ach.unlockedUsers.some((u) => u.userId === userId);
        if (alreadyUnlocked) return ach;

        let shouldUnlock = false;
        if (ach.id === "ach-first-blood" && solvesCount >= 1) shouldUnlock = true;
        else if (ach.id === "ach-10-in-5" && solvesIn5Days >= 10) shouldUnlock = true;
        else if (ach.id === "ach-7-streak" && streak >= 7) shouldUnlock = true;
        else if (ach.id === "ach-20-streak" && streak >= 20) shouldUnlock = true;
        else if (ach.id === "ach-50-problems" && solvesCount >= 50) shouldUnlock = true;
        else if (ach.id === "ach-100-problems" && solvesCount >= 100) shouldUnlock = true;
        else if (ach.id === "ach-sap-elite" && solvesCount >= 75 && streak >= 30) shouldUnlock = true;

        if (shouldUnlock) {
          newBalance += ach.rewardAmount;
          newTotalEarned += ach.rewardAmount;
          newTransactions.unshift({
            id: `tx-ach-${Date.now()}-${ach.id}`,
            userId,
            amount: ach.rewardAmount,
            type: "ACHIEVEMENT_UNLOCKED",
            description: `Award unlocked: ${ach.title}!`,
            timestamp: new Date().toISOString(),
          });
          return {
            ...ach,
            unlockedUsers: [...ach.unlockedUsers, { userId, unlockedAt: new Date().toISOString() }],
          };
        }
        return ach;
      });

      wallets[walletIdx] = {
        ...curWallet,
        balance: newBalance,
        totalEarned: newTotalEarned,
        transactions: newTransactions.slice(0, 100),
      };

      return {
        ...prev,
        codingProblems: nextProblems,
        virtualWallets: wallets,
        achievements: updatedAchievements,
      };
    });

    logAudit(
      "LOG_LEETCODE",
      "LeetCode",
      `Logged problem: ${problem.problemName} (${problem.topicTag}) — Earned ${db.economySettings?.currencySymbol || "₹"}${db.economySettings?.coinsPerProblem || 100}`
    );
  }, [db.currentUserId, db.economySettings, updateDb, logAudit]);

  const updateCodingProblem = useCallback((problemId: string, data: Partial<CodingProblem>) => {
    updateDb((prev) => ({
      ...prev,
      codingProblems: prev.codingProblems.map((p) => (p.id === problemId ? { ...p, ...data } : p)),
    }));
  }, [updateDb]);

  const deleteCodingProblem = useCallback((problemId: string) => {
    updateDb((prev) => ({
      ...prev,
      codingProblems: prev.codingProblems.filter((p) => p.id !== problemId),
    }));
  }, [updateDb]);

  const clearCandidateSolves = useCallback((userId: string) => {
    updateDb((prev) => ({
      ...prev,
      codingProblems: prev.codingProblems.filter((p) => p.userId !== userId),
    }));
    logAudit("CLEAR_SOLVES", "LeetCode", `Cleared all LeetCode solves for ${userId}`);
  }, [updateDb, logAudit]);

  const toggleProblemRevision = useCallback((problemId: string) => {
    updateDb((prev) => ({
      ...prev,
      codingProblems: prev.codingProblems.map((p) =>
        p.id === problemId ? { ...p, needsRevision: !p.needsRevision } : p
      ),
    }));
  }, [updateDb]);

  // Quick 1-Click Practice Logger
  const logDailyPractice = useCallback((topicTag: string, count: number, customDate?: string) => {
    const dateStr = customDate || new Date().toISOString().split("T")[0];
    const newEntries: CodingProblem[] = [];

    for (let i = 0; i < count; i++) {
      newEntries.push({
        id: `code-quick-${Date.now()}-${i}`,
        userId: db.currentUserId,
        problemName: `${topicTag} Problem #${i + 1}`,
        problemUrl: "",
        difficulty: "MEDIUM",
        topicTag,
        language: db.currentUserId === "user-anuraj" ? "C++" : "Python",
        dateSolved: dateStr,
        solutionApproach: "Standard practice session",
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        personalNotes: `Logged during practice session on ${dateStr}`,
        status: "SOLVED",
        needsRevision: false,
      });
    }

    updateDb((prev) => ({
      ...prev,
      codingProblems: [...newEntries, ...prev.codingProblems],
    }));
    logAudit("QUICK_LOG_LEETCODE", "LeetCode", `Quick logged ${count} problems in ${topicTag}`);
  }, [db.currentUserId, updateDb, logAudit]);

  const addLeetCodeTopic = useCallback((topicName: string) => {
    const trimmed = topicName.trim();
    if (!trimmed) return;
    updateDb((prev) => {
      const existing = prev.leetcodeTopics || INITIAL_LEETCODE_TOPICS;
      if (existing.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      return {
        ...prev,
        leetcodeTopics: [...existing, trimmed],
      };
    });
    logAudit("ADD_LEETCODE_TOPIC", "LeetCode", `Added custom LeetCode topic: ${trimmed}`);
  }, [updateDb, logAudit]);

  const deleteLeetCodeTopic = useCallback((topicName: string) => {
    updateDb((prev) => ({
      ...prev,
      leetcodeTopics: (prev.leetcodeTopics || INITIAL_LEETCODE_TOPICS).filter((t) => t !== topicName),
    }));
    logAudit("DELETE_LEETCODE_TOPIC", "LeetCode", `Removed LeetCode topic: ${topicName}`);
  }, [updateDb, logAudit]);

  // Daily Tasks
  const addTask = useCallback((task: Omit<DailyTask, "id" | "userId">) => {
    const newTask: DailyTask = {
      ...task,
      id: `task-${Date.now()}`,
      userId: db.currentUserId,
    };
    updateDb((prev) => ({
      ...prev,
      dailyTasks: [newTask, ...prev.dailyTasks],
    }));
    logAudit("CREATE_TASK", "Task", `Added task: ${task.title}`);
  }, [db.currentUserId, updateDb, logAudit]);

  const toggleTaskComplete = useCallback((taskId: string) => {
    updateDb((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === "COMPLETED";
          return {
            ...t,
            status: isDone ? "TODO" : "COMPLETED",
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return t;
      }),
    }));
  }, [updateDb]);

  const updateTask = useCallback((taskId: string, data: Partial<DailyTask>) => {
    updateDb((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.map((t) => (t.id === taskId ? { ...t, ...data } : t)),
    }));
  }, [updateDb]);

  const deleteTask = useCallback((taskId: string) => {
    updateDb((prev) => ({
      ...prev,
      dailyTasks: prev.dailyTasks.filter((t) => t.id !== taskId),
    }));
  }, [updateDb]);

  // Study Materials
  const addStudyMaterial = useCallback((material: Omit<StudyMaterial, "id" | "uploadedBy" | "createdAt">) => {
    const user = db.users.find((u) => u.id === db.currentUserId);
    const newMaterial: StudyMaterial = {
      ...material,
      id: `mat-${Date.now()}`,
      uploadedBy: user?.fullName || "User",
      createdAt: new Date().toISOString(),
    };
    updateDb((prev) => ({
      ...prev,
      studyMaterials: [newMaterial, ...prev.studyMaterials],
    }));
    logAudit("UPLOAD_MATERIAL", "Materials", `Added material: ${material.title}`);
  }, [db.currentUserId, db.users, updateDb, logAudit]);

  const deleteStudyMaterial = useCallback((materialId: string) => {
    updateDb((prev) => ({
      ...prev,
      studyMaterials: prev.studyMaterials.filter((m) => m.id !== materialId),
    }));
  }, [updateDb]);

  // Admin & System Config
  const updateMissionConfig = useCallback((config: Partial<MissionConfig>) => {
    updateDb((prev) => ({
      ...prev,
      missionConfig: { ...prev.missionConfig, ...config },
    }));
    logAudit("UPDATE_MISSION_CONFIG", "System", "Updated mission parameters or deadline.");
  }, [updateDb, logAudit]);

  const updatePipelineStages = useCallback((stages: PipelineStageConfig[]) => {
    updateDb((prev) => ({
      ...prev,
      pipelineStages: stages,
    }));
    logAudit("UPDATE_PIPELINE_STAGES", "Pipeline", "Modified 5-stage pipeline settings.");
  }, [updateDb, logAudit]);

  const sendNotificationAnnouncement = useCallback((title: string, body: string, targetUserId?: string) => {
    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      userId: targetUserId || "all",
      title,
      body,
      category: "announcement",
      sentAt: new Date().toISOString(),
      status: "DELIVERED",
      read: false,
    };
    updateDb((prev) => ({
      ...prev,
      notificationLogs: [newNotif, ...(prev.notificationLogs || [])],
    }));
    logAudit("SEND_ANNOUNCEMENT", "Notification", `Sent announcement: ${title}`);
  }, [updateDb, logAudit]);

  // Economy & Gamification Actions
  const updateEconomySettings = useCallback((settings: Partial<EconomySettings>) => {
    updateDb((prev) => ({
      ...prev,
      economySettings: {
        ...(prev.economySettings || {
          coinsPerProblem: 100,
          coinsPerStreakDay: 250,
          coinsPerTopicMastered: 500,
          coinsPerTaskCompleted: 50,
          currencySymbol: "₹",
          currencyName: "Prep Cash",
        }),
        ...settings,
      },
    }));
    logAudit("UPDATE_ECONOMY", "Economy", "Updated virtual economy coins and reward rules.");
  }, [updateDb, logAudit]);

  const grantUserMoney = useCallback((userId: string, amount: number, reason: string) => {
    updateDb((prev) => {
      const wallets = prev.virtualWallets ? [...prev.virtualWallets] : [];
      let walletIdx = wallets.findIndex((w) => w.userId === userId);
      if (walletIdx === -1) {
        wallets.push({
          userId,
          balance: 0,
          totalEarned: 0,
          transactions: [],
        });
        walletIdx = wallets.length - 1;
      }
      const cur = wallets[walletIdx];
      const newTx: WalletTransaction = {
        id: `tx-admin-${Date.now()}`,
        userId,
        amount,
        type: "ADMIN_GRANT",
        description: reason || "Admin adjustment",
        timestamp: new Date().toISOString(),
      };
      wallets[walletIdx] = {
        ...cur,
        balance: Math.max(0, cur.balance + amount),
        totalEarned: amount > 0 ? cur.totalEarned + amount : cur.totalEarned,
        transactions: [newTx, ...(cur.transactions || [])].slice(0, 100),
      };
      return {
        ...prev,
        virtualWallets: wallets,
      };
    });
    logAudit("GRANT_MONEY", "Economy", `Admin modified wallet for ${userId}: ${amount} (${reason})`);
  }, [updateDb, logAudit]);

  const addAchievement = useCallback((achievement: Omit<Achievement, "id" | "unlockedUsers">) => {
    const newAch: Achievement = {
      ...achievement,
      id: `ach-custom-${Date.now()}`,
      unlockedUsers: [],
    };
    updateDb((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), newAch],
    }));
    logAudit("CREATE_ACHIEVEMENT", "Gamification", `Created new game award: ${achievement.title}`);
  }, [updateDb, logAudit]);

  const updateAchievement = useCallback((id: string, data: Partial<Achievement>) => {
    updateDb((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).map((a) => (a.id === id ? { ...a, ...data } : a)),
    }));
    logAudit("UPDATE_ACHIEVEMENT", "Gamification", `Updated award ${id}`);
  }, [updateDb, logAudit]);

  const deleteAchievement = useCallback((id: string) => {
    updateDb((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((a) => a.id !== id),
    }));
    logAudit("DELETE_ACHIEVEMENT", "Gamification", `Deleted award ${id}`);
  }, [updateDb, logAudit]);

  const resetDatabase = useCallback(() => {
    const fresh = getInitialDatabase();
    setDb(fresh);
    saveDatabase(fresh);
    logAudit("RESET_DATABASE", "System", "Reset database to pristine default seed.");
  }, [logAudit]);

  const restoreDatabase = useCallback((importedDb: AppDatabase) => {
    setDb(importedDb);
    saveDatabase(importedDb);
    logAudit("RESTORE_DATABASE", "System", "Restored database from imported snapshot.");
  }, [logAudit]);

  return {
    db,
    isClient,
    currentUser,
    activeUserSummary,
    anurajSummary,
    soumyajitSummary,
    activeUserWallet,
    // Actions
    setCurrentUser,
    setTheme,
    advanceTopicStage,
    regressTopicStage,
    setTopicStage,
    markTopicMastered,
    updateTopicNotes,
    scheduleTopicRevision,
    addTopic,
    updateTopic,
    deleteTopic,
    softDeleteTopic,
    restoreTopic,
    reorderTopics,
    addSubject,
    updateSubject,
    deleteSubject,
    reorderSubjects,
    addCodingProblem,
    updateCodingProblem,
    deleteCodingProblem,
    clearCandidateSolves,
    toggleProblemRevision,
    logDailyPractice,
    addLeetCodeTopic,
    deleteLeetCodeTopic,
    addTask,
    toggleTaskComplete,
    updateTask,
    deleteTask,
    addStudyMaterial,
    deleteStudyMaterial,
    updateMissionConfig,
    updatePipelineStages,
    sendNotificationAnnouncement,
    updateEconomySettings,
    grantUserMoney,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    resetDatabase,
    restoreDatabase,
  };
}
