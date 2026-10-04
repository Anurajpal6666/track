import {
  AppDatabase,
  User,
  Subject,
  Topic,
  UserTopicProgress,
  CodingProblem,
  DailyTask,
} from "../types";

export interface SubjectProgressBreakdown {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  totalTopics: number;
  completedTopics: number;
  inProgressTopics: number;
  completedStages: number;
  maxStages: number;
  percent: number;
  color: string;
}

export interface UserPerformanceSummary {
  userId: string;
  userName: string;
  overallProgressPercent: number;
  topicsMastered: number;
  topicsInProgress: number;
  topicsPending: number;
  topicsTotal: number;
  leetcodeTotal: number;
  leetcodeEasy: number;
  leetcodeMedium: number;
  leetcodeHard: number;
  leetcodeToday: number;
  pendingRevisionsCount: number;
  activeStreakDays: number;
  taskCompletionRate: number;
  dailyTasksTotal: number;
  dailyTasksCompleted: number;
  dailyTasksPending: number;
  dailyTasksOverdue: number;
  stageDistribution: {
    stage1Study: number;
    stage2FirstRev: number;
    stage3FinalRev: number;
    stage4SuperFinal: number;
    stage5Interview: number;
    completed: number;
  };
  subjectBreakdown: SubjectProgressBreakdown[];
}

export function computeUserSummary(db: AppDatabase, userId: string): UserPerformanceSummary {
  const user = db.users.find((u) => u.id === userId) || db.users[0] || {
    id: userId,
    fullName: userId === "user-anuraj" ? "Anuraj" : "Soumyajit",
  };

  const userProgressList = db.userProgress.filter((p) => p.userId === userId);
  const userProblems = db.codingProblems.filter((p) => p.userId === userId);
  const userTasks = db.dailyTasks.filter((t) => t.userId === userId);

  const todayStr = new Date().toISOString().split("T")[0];

  // Active topics assigned to this user or common
  const assignedTopics = db.topics.filter(
    (t) => t.isActive && !t.isArchived && (t.assignedTo === "all" || t.assignedTo === (userId === "user-anuraj" ? "anuraj" : "soumyajit"))
  );

  const totalTopics = assignedTopics.length || 1;
  const numStages = db.pipelineStages.length || 5;

  let totalStagesCompleted = 0;
  let masteredCount = 0;
  let inProgressCount = 0;
  let pendingCount = 0;

  const stageDistribution = {
    stage1Study: 0,
    stage2FirstRev: 0,
    stage3FinalRev: 0,
    stage4SuperFinal: 0,
    stage5Interview: 0,
    completed: 0,
  };

  assignedTopics.forEach((topic) => {
    const prog = userProgressList.find((p) => p.topicId === topic.id);
    if (!prog || (!prog.isMastered && prog.currentStage === 1 && prog.stageHistory.length === 0)) {
      pendingCount++;
      stageDistribution.stage1Study++;
    } else if (prog.isMastered || prog.currentStage > numStages) {
      masteredCount++;
      totalStagesCompleted += numStages;
      stageDistribution.completed++;
    } else {
      inProgressCount++;
      totalStagesCompleted += Math.max(0, prog.currentStage - 1);
      if (prog.currentStage === 1) stageDistribution.stage1Study++;
      else if (prog.currentStage === 2) stageDistribution.stage2FirstRev++;
      else if (prog.currentStage === 3) stageDistribution.stage3FinalRev++;
      else if (prog.currentStage === 4) stageDistribution.stage4SuperFinal++;
      else if (prog.currentStage === 5) stageDistribution.stage5Interview++;
    }
  });

  const maxTotalStages = totalTopics * numStages;
  const overallProgressPercent = Math.min(100, Math.round((totalStagesCompleted / (maxTotalStages || 1)) * 100));

  // Subject-wise Breakdown across 17 subjects
  const subjectColors: Record<string, string> = {
    C: "#C5A059",
    CPP: "#3E6E9F",
    PYTHON: "#94A3B8",
    DSA: "#C5A059",
    DBMS: "#3E6E9F",
    SQL: "#D8B668",
    OS: "#64748B",
    CN: "#2B527E",
    OOP: "#9E7B35",
    "SAP-FUND": "#C5A059",
    "SAP-HANA": "#D8B668",
    ABAP: "#3E6E9F",
    CLOUD: "#2B527E",
    LINUX: "#94A3B8",
    APTITUDE: "#CBD5E1",
    COMM: "#A6ACB8",
    "TECH-INT": "#C5A059",
  };

  const subjectBreakdown: SubjectProgressBreakdown[] = db.subjects.map((sub) => {
    const subTopics = assignedTopics.filter((t) => t.subjectId === sub.id);
    let subStagesCompleted = 0;
    let subMastered = 0;
    let subInProgress = 0;
    const maxSubStages = (subTopics.length || 1) * numStages;

    subTopics.forEach((topic) => {
      const prog = userProgressList.find((p) => p.topicId === topic.id);
      if (prog) {
        if (prog.isMastered || prog.currentStage > numStages) {
          subStagesCompleted += numStages;
          subMastered++;
        } else {
          subStagesCompleted += Math.max(0, prog.currentStage - 1);
          subInProgress++;
        }
      }
    });

    const percent = subTopics.length > 0 ? Math.min(100, Math.round((subStagesCompleted / maxSubStages) * 100)) : 0;

    return {
      subjectId: sub.id,
      subjectName: sub.name,
      subjectCode: sub.code,
      totalTopics: subTopics.length,
      completedTopics: subMastered,
      inProgressTopics: subInProgress,
      completedStages: subStagesCompleted,
      maxStages: maxSubStages,
      percent,
      color: subjectColors[sub.code] || "#94A3B8",
    };
  });

  // LeetCode Stats
  const leetcodeTotal = userProblems.filter((p) => p.status === "SOLVED").length;
  const leetcodeEasy = userProblems.filter((p) => p.status === "SOLVED" && p.difficulty === "EASY").length;
  const leetcodeMedium = userProblems.filter((p) => p.status === "SOLVED" && p.difficulty === "MEDIUM").length;
  const leetcodeHard = userProblems.filter((p) => p.status === "SOLVED" && p.difficulty === "HARD").length;
  const leetcodeToday = userProblems.filter((p) => p.status === "SOLVED" && p.dateSolved === todayStr).length;

  // Pending Revisions Count
  const pendingRevisionsCount = userProgressList.filter((p) => {
    if (p.isMastered) return false;
    if (!p.nextRevisionDate) return false;
    return p.nextRevisionDate <= todayStr;
  }).length;

  // Task Stats
  const dailyTasksTotal = userTasks.length;
  const dailyTasksCompleted = userTasks.filter((t) => t.status === "COMPLETED").length;
  const dailyTasksPending = userTasks.filter((t) => t.status === "TODO" && t.targetDate >= todayStr).length;
  const dailyTasksOverdue = userTasks.filter((t) => t.status === "OVERDUE" || (t.status === "TODO" && t.targetDate < todayStr)).length;
  const taskCompletionRate = dailyTasksTotal > 0 ? Math.round((dailyTasksCompleted / dailyTasksTotal) * 100) : 100;

  // Streak calculation (actual activity logs across tasks and problems)
  const activeDates = new Set<string>();
  userProblems.forEach((p) => {
    if (p.dateSolved) activeDates.add(p.dateSolved);
  });
  userTasks.forEach((t) => {
    if (t.completedAt) activeDates.add(t.completedAt.split("T")[0]);
  });
  const activeStreakDays = Math.max(1, activeDates.size);

  return {
    userId,
    userName: user.fullName,
    overallProgressPercent,
    topicsMastered: masteredCount,
    topicsInProgress: inProgressCount,
    topicsPending: pendingCount,
    topicsTotal: totalTopics,
    leetcodeTotal,
    leetcodeEasy,
    leetcodeMedium,
    leetcodeHard,
    leetcodeToday,
    pendingRevisionsCount,
    activeStreakDays,
    taskCompletionRate,
    dailyTasksTotal,
    dailyTasksCompleted,
    dailyTasksPending,
    dailyTasksOverdue,
    stageDistribution,
    subjectBreakdown,
  };
}
