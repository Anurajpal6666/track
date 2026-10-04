import {
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
  AppDatabase,
} from "../types";
import {
  INITIAL_USERS,
  INITIAL_MISSION_CONFIG,
  INITIAL_PIPELINE_STAGES,
  INITIAL_SUBJECTS,
  INITIAL_CATEGORIES,
  INITIAL_TOPICS,
  INITIAL_USER_PROGRESS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_CODING_PROBLEMS,
  INITIAL_DAILY_TASKS,
  INITIAL_DAILY_JOURNALS,
  INITIAL_MOCK_INTERVIEWS,
  INITIAL_INTERVIEW_QUESTIONS,
  INITIAL_PROJECT_PORTFOLIOS,
  INITIAL_RESUME_CHECKLIST,
  INITIAL_NOTIFICATION_SCHEDULES,
  INITIAL_AUDIT_LOGS,
  INITIAL_ECONOMY_SETTINGS,
  INITIAL_VIRTUAL_WALLETS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_LEETCODE_TOPICS,
} from "./initialData";

export type { AppDatabase };

const STORAGE_KEY = "sap_labs_mission_2027_v4";

export function getInitialDatabase(): AppDatabase {
  return {
    version: "4.0.0",
    currentUserId: "user-anuraj", // Default to Anuraj
    theme: "dark",
    missionConfig: INITIAL_MISSION_CONFIG,
    users: INITIAL_USERS,
    subjects: INITIAL_SUBJECTS,
    categories: INITIAL_CATEGORIES,
    topics: INITIAL_TOPICS,
    pipelineStages: INITIAL_PIPELINE_STAGES,
    userProgress: INITIAL_USER_PROGRESS,
    studyMaterials: INITIAL_STUDY_MATERIALS,
    codingProblems: [], // Starts clean with 0 fake records
    dailyTasks: INITIAL_DAILY_TASKS,
    dailyJournals: INITIAL_DAILY_JOURNALS,
    mockInterviews: INITIAL_MOCK_INTERVIEWS,
    interviewQuestions: INITIAL_INTERVIEW_QUESTIONS,
    projectPortfolios: INITIAL_PROJECT_PORTFOLIOS,
    resumeChecklist: INITIAL_RESUME_CHECKLIST,
    notificationSchedules: INITIAL_NOTIFICATION_SCHEDULES,
    notificationLogs: [
      {
        id: "notif-1",
        userId: "user-anuraj",
        title: "Welcome to Mission 2027",
        body: "Your placement command center is primed. 1 July 2027 is the target.",
        category: "system",
        sentAt: "2026-10-04T08:00:00.000Z",
        status: "DELIVERED",
        read: false,
      },
    ],
    auditLogs: INITIAL_AUDIT_LOGS,
    virtualWallets: INITIAL_VIRTUAL_WALLETS,
    achievements: INITIAL_ACHIEVEMENTS,
    economySettings: INITIAL_ECONOMY_SETTINGS,
    leetcodeTopics: INITIAL_LEETCODE_TOPICS,
  };
}

export function loadDatabase(): AppDatabase {
  if (typeof window === "undefined") {
    return getInitialDatabase();
  }

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(serialized);

    // Auto-migrate if subjects count is less than 17 or old admin exists
    if (!parsed.subjects || parsed.subjects.length < 17 || (parsed.users && parsed.users.length > 2)) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }

    // Filter out old mock coding problems if present
    const cleanCodingProblems = (parsed.codingProblems || []).filter(
      (p: CodingProblem) => !p.id.startsWith("code-a-") && !p.id.startsWith("code-s-")
    );

    const topics = parsed.leetcodeTopics && parsed.leetcodeTopics.length > 0
      ? parsed.leetcodeTopics
      : INITIAL_LEETCODE_TOPICS;

    return {
      ...getInitialDatabase(),
      ...parsed,
      leetcodeTopics: topics,
      codingProblems: cleanCodingProblems,
    };
  } catch (err) {
    console.error("Failed to parse database from localStorage:", err);
    return getInitialDatabase();
  }
}

export function saveDatabase(db: AppDatabase): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    // Dispatch custom event for intra-tab updates
    window.dispatchEvent(new CustomEvent("sap_mission_db_updated", { detail: db }));
  } catch (err) {
    console.error("Failed to save database to localStorage:", err);
  }
}
