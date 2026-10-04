// SAP LABS — MISSION 2027: Core TypeScript Definitions & Database Architecture
// Architecture: SHARED KNOWLEDGE. INDIVIDUAL PROGRESS. TWO ADMINISTRATORS. ONE MISSION.

export type UserRole = "admin" | "student";

// 1. PROFILES (Anuraj & Soumyajit's Accounts)
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string;
  githubUsername: string;
  leetcodeUsername: string;
  bio: string;
  targetRole: string;
  createdAt: string;
  themePreference: "dark" | "light";
  timezone: string; // Default "Asia/Kolkata"
  notificationPreferences: {
    morningReminder: boolean;
    middayCheck: boolean;
    eveningReminder: boolean;
    nightSubmission: boolean;
    lateReview: boolean;
    revisionReminders: boolean;
    mockInterviews: boolean;
    adminAnnouncements: boolean;
  };
}

export type UserProfile = User;

// 2. USER ROLES & DUAL-ADMIN CONFIRMATIONS
export interface UserRoleRecord {
  userId: string;
  role: UserRole;
  grantedAt: string;
  grantedBy: string;
}

export interface AdminConfirmationRequest {
  id: string;
  requestedBy: string;
  requestedByName: string;
  targetUserId: string;
  targetUserName: string;
  actionType: "ROLE_CHANGE" | "REVOKE_ADMIN" | "ARCHIVE_ADMIN";
  newRole?: UserRole;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
  requestedAt: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type AssignedTo = "all" | "anuraj" | "soumyajit";

// 3. SUBJECTS (Shared)
export interface Subject {
  id: string;
  name: string;
  code: string;
  icon: string;
  description: string;
  orderIndex: number;
  isArchived?: boolean;
  archivedAt?: string;
}

export interface Category {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  orderIndex: number;
  isArchived?: boolean;
  archivedAt?: string;
}

// 4. TOPICS (Shared)
export interface Topic {
  id: string;
  categoryId: string;
  subjectId: string;
  name: string;
  description: string;
  priority: Priority;
  difficulty: Difficulty;
  estimatedHours: number;
  assignedTo: AssignedTo;
  orderIndex: number;
  isActive: boolean;
  isArchived?: boolean;
  archivedAt?: string;
  subtopics: string[];
}

// 5. REVISION STAGES (Shared 5-Stage Pipeline)
export interface PipelineStageConfig {
  id: string;
  stageNumber: number;
  name: string;
  shortName: string;
  description: string;
  requirements: string[];
  requiresApproval: boolean;
  minIntervalDays: number;
}

// 6. TOPIC STAGE PROGRESS (Personal)
export interface UserTopicProgress {
  id: string;
  userId: string;
  topicId: string;
  currentStage: number; // 1 = Learning, 2 = 1st Revision, 3 = Final Revision, 4 = Super Final, 5 = Interview Prep, 6 = Mastered
  isMastered: boolean;
  confidenceLevel: number; // 1 to 5
  notes: string;
  stageHistory: {
    stageNumber: number;
    stageName: string;
    completedAt: string;
    notes?: string;
    score?: number;
    verifiedBy?: string;
  }[];
  nextRevisionDate?: string;
  lastStudiedAt: string;
  completedAt?: string;
}

export type MaterialType = "pdf" | "note" | "video_url" | "doc_url" | "image" | "code_snippet";

// 7. STUDY MATERIALS (Shared & Personal Flags)
export interface StudyMaterial {
  id: string;
  topicId: string;
  subjectId?: string;
  userId?: string; // If undefined, shared system material
  title: string;
  type: MaterialType;
  contentUrl: string; // Base64 data, URL, or markdown text
  fileSize?: string;
  description: string;
  isPrivate: boolean;
  uploadedBy: string;
  isArchived?: boolean;
  archivedAt?: string;
  createdAt: string;
}

export type CodingLanguage = "C" | "C++" | "Python" | "Java";
export type ProblemStatus = "SOLVED" | "ATTEMPTED" | "NEEDS_REVISION";

// 8. LEETCODE PROBLEMS (Shared Problem Library) & SUBMISSIONS (Personal)
export interface CodingProblem {
  id: string;
  userId: string; // Author/Solver ID or shared reference
  problemName: string;
  problemUrl: string;
  difficulty: Difficulty;
  subjectId?: string;
  topicTag: string;
  language: CodingLanguage;
  dateSolved: string;
  solutionApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
  personalNotes: string;
  status: ProblemStatus;
  codeSnippet?: string;
  needsRevision: boolean;
  lastRevisionDate?: string;
  isSharedProblem?: boolean;
  isArchived?: boolean;
}

export interface SharedLeetCodeProblem {
  id: string;
  problemName: string;
  problemUrl: string;
  difficulty: Difficulty;
  topicTag: string;
  subjectId?: string;
  suggestedApproach?: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface LeetCodeSubmission {
  id: string;
  problemId: string;
  userId: string;
  language: CodingLanguage;
  dateSolved: string;
  solutionApproach: string;
  timeComplexity: string;
  spaceComplexity: string;
  personalNotes: string;
  codeSnippet?: string;
  status: ProblemStatus;
  needsRevision: boolean;
  lastRevisionDate?: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "RESCHEDULED";

// 9. MISSION TASKS (Shared) & USER TASK PROGRESS (Personal)
export interface DailyTask {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  targetDate: string; // YYYY-MM-DD
  targetTime?: string; // HH:mm
  estimatedMinutes: number;
  actualMinutes?: number;
  status: TaskStatus;
  isSharedTask?: boolean;
  completedAt?: string;
  notes?: string;
}

export interface SharedMissionTask {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: string;
  targetDate: string;
  targetTime?: string;
  estimatedMinutes: number;
  createdBy: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface UserTaskProgress {
  id: string;
  taskId: string;
  userId: string;
  status: TaskStatus;
  actualMinutes?: number;
  completedAt?: string;
  notes?: string;
}

// 10. DAILY ACTIVITY & STUDY JOURNAL (Personal)
export interface DailyJournal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  keyLearnings: string;
  challengesFaced: string;
  solutionsFound: string;
  productivityScore: number; // 1-10
  hoursStudied: number;
  tomorrowPriorities: string;
  submittedAt: string;
}

export interface DailyActivityRecord {
  id: string;
  userId: string;
  date: string;
  hoursStudied: number;
  problemsSolvedCount: number;
  topicsReviewedCount: number;
  notesLogged: string;
}

// 11. MOCK INTERVIEWS (Personal)
export interface MockInterview {
  id: string;
  userId: string;
  candidateName: string;
  interviewerName: string;
  roundType: "Technical" | "System Design" | "Coding DSA" | "SAP & Core CS" | "HR & Behavioral";
  date: string;
  durationMinutes: number;
  overallRating: number; // 1-5
  technicalRating: number; // 1-5
  communicationRating: number; // 1-5
  problemSolvingRating: number; // 1-5
  questionsAsked: string[];
  strengths: string;
  areasToImprove: string;
  recordingUrl?: string;
}

export interface InterviewQuestion {
  id: string;
  subjectId: string;
  topicTag: string;
  question: string;
  expectedAnswer: string;
  keyConcepts: string[];
  frequencyAtSAP: "VERY_HIGH" | "HIGH" | "MEDIUM";
  difficulty: Difficulty;
}

// 12. READINESS HISTORY (Personal)
export interface ReadinessHistoryEntry {
  id: string;
  userId: string;
  recordedDate: string;
  overallIndex: number;
  programmingScore: number;
  dsaScore: number;
  dbmsScore: number;
  coreCsScore: number;
  sapScore: number;
  cloudScore: number;
  placementScore: number;
  createdAt: string;
}

// 13. PUSH SUBSCRIPTIONS (Personal Multiple Devices)
export interface PushSubscriptionRecord {
  id: string;
  userId: string;
  deviceName: string;
  endpoint: string;
  p256dhKey: string;
  authKey: string;
  userAgent?: string;
  isActive: boolean;
  registeredAt: string;
}

// 14. NOTIFICATIONS (Personal & Shared Schedules)
export interface NotificationLog {
  id: string;
  userId: string;
  title: string;
  body: string;
  category: "schedule" | "revision" | "task" | "interview" | "announcement" | "system";
  sentAt: string;
  status: "DELIVERED" | "QUEUED" | "FAILED";
  read: boolean;
}

export interface NotificationScheduleConfig {
  id: string;
  time: string; // "08:00", "13:00", etc.
  title: string;
  defaultMessage: string;
  category: string;
  enabled: boolean;
}

// 15. ANNOUNCEMENTS (Shared)
export interface MissionAnnouncement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  isActive: boolean;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

// 16. AUDIT LOGS (Admin)
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  details: string;
  previousState?: string;
  newState?: string;
}

export interface ProjectPortfolio {
  id: string;
  userId: string;
  title: string;
  tagline: string;
  description: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  architectureNotes: string;
  sapRelevance: string;
  status: "COMPLETED" | "IN_PROGRESS" | "PLANNED";
  completionDate?: string;
}

export interface ResumeChecklistItem {
  id: string;
  userId: string;
  category: "Formatting & ATS" | "Technical Skills" | "Project Descriptions" | "Core CS Highlights" | "SAP Alignment";
  itemText: string;
  isCompleted: boolean;
  notes?: string;
}

export interface MissionConfig {
  title: string;
  subtitle: string;
  startDate: string; // "2026-10-04"
  targetDeadline: string; // "2027-07-01T00:00:00.000Z"
  isFinalReviewMode: boolean;
  announcement: {
    active: boolean;
    text: string;
    updatedAt: string;
  };
  dailyQuotes: string[];
  readinessWeights: {
    programming: number; // e.g. 15
    dsa: number; // e.g. 25
    dbms: number; // e.g. 15
    coreCs: number; // e.g. 10
    sap: number; // e.g. 15
    cloud: number; // e.g. 10
    placement: number; // e.g. 10
  };
}

export interface ReadinessScoreBreakdown {
  overallIndex: number;
  programming: number;
  dsa: number;
  dbms: number;
  coreCs: number;
  sap: number;
  cloud: number;
  placement: number;
  strongestSkills: string[];
  weakestSkills: string[];
  recommendations: string[];
  historicalTrend: {
    date: string;
    score: number;
  }[];
}

// 12. VIRTUAL MONEY & GAME REWARDS (Gamified Consistency & Awards)
export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type:
    | "PROBLEM_SOLVED"
    | "STREAK_BONUS"
    | "TOPIC_MASTERED"
    | "TASK_COMPLETED"
    | "ACHIEVEMENT_UNLOCKED"
    | "ADMIN_GRANT";
  description: string;
  timestamp: string;
}

export interface VirtualWallet {
  userId: string;
  balance: number; // e.g. ₹ Prep Cash / Coins
  totalEarned: number;
  transactions: WalletTransaction[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // e.g. "Flame", "Trophy", "Award", "Zap", "Coins", "Crown", "CheckCircle"
  category: "STREAK" | "SOLVES" | "TOPICS" | "SPECIAL";
  rewardAmount: number; // in ₹
  targetCount: number; // required count
  unlockedUsers: {
    userId: string;
    unlockedAt: string;
  }[];
}

export interface EconomySettings {
  coinsPerProblem: number; // default 100
  coinsPerStreakDay: number; // default 250
  coinsPerTopicMastered: number; // default 500
  coinsPerTaskCompleted: number; // default 50
  currencySymbol: string; // default "₹"
  currencyName: string; // default "Prep Cash"
}

// COMPLETE IN-MEMORY & PERSISTED DATABASE INTERFACE
export interface AppDatabase {
  version: string;
  currentUserId: string;
  theme: "dark" | "light";
  missionConfig: MissionConfig;
  users: User[];
  userRoles?: UserRoleRecord[];
  adminConfirmations?: AdminConfirmationRequest[];
  subjects: Subject[];
  categories: Category[];
  topics: Topic[];
  pipelineStages: PipelineStageConfig[];
  userProgress: UserTopicProgress[];
  studyMaterials: StudyMaterial[];
  codingProblems: CodingProblem[];
  sharedProblems?: SharedLeetCodeProblem[];
  dailyTasks: DailyTask[];
  sharedTasks?: SharedMissionTask[];
  userTaskProgress?: UserTaskProgress[];
  dailyJournals: DailyJournal[];
  mockInterviews: MockInterview[];
  interviewQuestions: InterviewQuestion[];
  projectPortfolios: ProjectPortfolio[];
  resumeChecklist: ResumeChecklistItem[];
  readinessHistory?: ReadinessHistoryEntry[];
  pushSubscriptions?: PushSubscriptionRecord[];
  notificationSchedules: NotificationScheduleConfig[];
  notificationLogs: NotificationLog[];
  announcements?: MissionAnnouncement[];
  auditLogs: AuditLog[];
  // Gamification & Virtual Money
  virtualWallets?: VirtualWallet[];
  achievements?: Achievement[];
  economySettings?: EconomySettings;
  leetcodeTopics?: string[];
}
