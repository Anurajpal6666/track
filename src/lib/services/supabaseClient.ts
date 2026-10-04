import { createClient } from "@supabase/supabase-js";

// Supabase Configuration (can be configured via environment variables)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- SAP LABS — MISSION 2027: COMPLETE PRODUCTION POSTGRESQL & ROW LEVEL SECURITY SCHEMA
-- TARGET RECRUITMENT: 1 JULY 2027 | CANDIDATES: ANURAJ & SOUMYAJIT (CO-ADMINISTRATORS)
-- TIMEZONE: Asia/Kolkata (+05:30)
-- ==============================================================================

-- 0. EXTENSIONS & TIMEZONE CONFIG
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
SET TIME ZONE 'Asia/Kolkata';

-- 1. PROFILES TABLE (Anuraj & Soumyajit's Accounts)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  github_username TEXT,
  leetcode_username TEXT,
  bio TEXT,
  target_role TEXT DEFAULT 'SAP Labs Associate Developer',
  theme_preference TEXT DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light')),
  timezone TEXT DEFAULT 'Asia/Kolkata',
  notification_preferences JSONB DEFAULT '{"morningReminder": true, "middayCheck": true, "eveningReminder": true, "nightSubmission": true, "lateReview": true, "revisionReminders": true, "mockInterviews": true, "adminAnnouncements": true}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER ROLES TABLE (Both Anuraj & Soumyajit have full admin permissions)
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE RESTRICT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'student')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES public.profiles(id)
);

-- 3. ADMIN DUAL-CONFIRMATION SAFEGUARD TABLE
-- Require confirmation from the other administrator before changing admin roles or removing admin access.
CREATE TABLE IF NOT EXISTS public.admin_confirmations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('ROLE_CHANGE', 'REVOKE_ADMIN', 'ARCHIVE_ADMIN')),
  new_role TEXT CHECK (new_role IN ('admin', 'student')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reason TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id)
);

-- 4. MISSION CONFIGURATION (Shared)
CREATE TABLE IF NOT EXISTS public.mission_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL DEFAULT 'SAP LABS — MISSION 2027',
  subtitle TEXT NOT NULL DEFAULT 'ANURAJ × SOUMYAJIT | TWO CANDIDATES. ONE TARGET.',
  start_date TIMESTAMPTZ NOT NULL DEFAULT '2026-10-04T00:00:00+05:30',
  target_deadline TIMESTAMPTZ NOT NULL DEFAULT '2027-07-01T00:00:00+05:30',
  is_final_review_mode BOOLEAN DEFAULT FALSE,
  announcement JSONB DEFAULT '{"active": true, "text": "Mission started targeting 1 July 2027."}'::jsonb,
  daily_quotes JSONB DEFAULT '["Every day is an opportunity to improve.", "Consistency creates opportunities.", "Learn it. Revise it. Explain it. Master it."]'::jsonb,
  readiness_weights JSONB DEFAULT '{"programming": 15, "dsa": 25, "dbms": 15, "coreCs": 10, "sap": 15, "cloud": 10, "placement": 10}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUBJECTS & CATEGORIES (Shared, Soft-Deletable)
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  order_index INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  order_index INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TOPICS (Shared, Soft-Deletable with Subtopics)
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  estimated_hours NUMERIC DEFAULT 12,
  assigned_to TEXT DEFAULT 'all' CHECK (assigned_to IN ('all', 'anuraj', 'soumyajit')),
  order_index INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  subtopics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FIVE-STAGE REVISION PIPELINE (Shared Configuration)
CREATE TABLE IF NOT EXISTS public.revision_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_number INT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  requires_approval BOOLEAN DEFAULT FALSE,
  min_interval_days INT DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TOPIC STAGE PROGRESS (Personal: Separate Record Per User)
CREATE TABLE IF NOT EXISTS public.topic_stage_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  current_stage INT DEFAULT 1,
  is_mastered BOOLEAN DEFAULT FALSE,
  confidence_level INT DEFAULT 3 CHECK (confidence_level BETWEEN 1 AND 5),
  notes TEXT,
  stage_history JSONB DEFAULT '[]'::jsonb,
  next_revision_date DATE,
  last_studied_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, topic_id)
);

-- 9. STUDY MATERIALS (Shared & Personal Flags)
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'note', 'video_url', 'doc_url', 'image', 'code_snippet')),
  content_url TEXT NOT NULL,
  file_size TEXT,
  description TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  uploaded_by TEXT NOT NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. MISSION TASKS (Shared Common Tasks) & USER TASK PROGRESS (Personal)
CREATE TABLE IF NOT EXISTS public.mission_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  category TEXT DEFAULT 'Mission Target',
  target_date DATE NOT NULL,
  target_time TIME,
  estimated_minutes INT DEFAULT 45,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_task_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES public.mission_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'RESCHEDULED')),
  actual_minutes INT,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  UNIQUE(task_id, user_id)
);

-- 11. LEETCODE PROBLEMS (Shared Library) & SUBMISSIONS (Personal)
CREATE TABLE IF NOT EXISTS public.leetcode_problems (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_name TEXT NOT NULL,
  problem_url TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  topic_tag TEXT NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  suggested_approach TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leetcode_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.leetcode_problems(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL CHECK (language IN ('C', 'C++', 'Python', 'Java')),
  date_solved DATE NOT NULL,
  solution_approach TEXT,
  time_complexity TEXT,
  space_complexity TEXT,
  personal_notes TEXT,
  status TEXT DEFAULT 'SOLVED' CHECK (status IN ('SOLVED', 'ATTEMPTED', 'NEEDS_REVISION')),
  code_snippet TEXT,
  needs_revision BOOLEAN DEFAULT FALSE,
  last_revision_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. DAILY ACTIVITY & STUDY JOURNAL (Personal)
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours_studied NUMERIC DEFAULT 0,
  problems_solved_count INT DEFAULT 0,
  topics_reviewed_count INT DEFAULT 0,
  key_learnings TEXT,
  challenges_faced TEXT,
  solutions_found TEXT,
  productivity_score INT CHECK (productivity_score BETWEEN 1 AND 10),
  tomorrow_priorities TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 13. MOCK INTERVIEWS (Personal)
CREATE TABLE IF NOT EXISTS public.mock_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL,
  interviewer_name TEXT NOT NULL,
  round_type TEXT NOT NULL,
  date DATE NOT NULL,
  duration_minutes INT DEFAULT 45,
  overall_rating INT CHECK (overall_rating BETWEEN 1 AND 5),
  technical_rating INT CHECK (technical_rating BETWEEN 1 AND 5),
  communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
  problem_solving_rating INT CHECK (problem_solving_rating BETWEEN 1 AND 5),
  questions_asked JSONB DEFAULT '[]'::jsonb,
  strengths TEXT,
  areas_to_improve TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. READINESS HISTORY (Personal)
CREATE TABLE IF NOT EXISTS public.readiness_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  overall_index NUMERIC NOT NULL,
  programming_score NUMERIC DEFAULT 0,
  dsa_score NUMERIC DEFAULT 0,
  dbms_score NUMERIC DEFAULT 0,
  core_cs_score NUMERIC DEFAULT 0,
  sap_score NUMERIC DEFAULT 0,
  cloud_score NUMERIC DEFAULT 0,
  placement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recorded_date)
);

-- 15. PUSH NOTIFICATION MULTI-DEVICE SUBSCRIPTIONS (Personal)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. NOTIFICATIONS LOG & DELIVERY HISTORY (Personal & System)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'DELIVERED' CHECK (status IN ('DELIVERED', 'QUEUED', 'FAILED')),
  is_read BOOLEAN DEFAULT FALSE
);

-- 17. ANNOUNCEMENTS (Shared)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  priority TEXT DEFAULT 'HIGH',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. AUDIT LOGS (Admin Record of Changes)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details TEXT NOT NULL,
  previous_state JSONB,
  new_state JSONB
);

-- ==============================================================================
-- DUAL-ADMINISTRATOR SAFEGUARD FUNCTION & TRIGGER
-- Ensures the system can NEVER accidentally lose all administrators, and requires
-- reciprocal approval from the other administrator before altering admin access.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_admin_role_change()
RETURNS TRIGGER AS $$
DECLARE
  admin_count INT;
  confirmation_count INT;
BEGIN
  -- Count total active administrators
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';

  -- Rule 1: Never drop below 2 administrators
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.role != 'admin' AND OLD.role = 'admin') THEN
    IF admin_count <= 2 THEN
      -- Check if there is an approved reciprocal confirmation request
      SELECT COUNT(*) INTO confirmation_count 
      FROM public.admin_confirmations 
      WHERE target_user_id = OLD.user_id 
        AND status = 'APPROVED'
        AND confirmed_by != OLD.user_id;

      IF confirmation_count = 0 THEN
        RAISE EXCEPTION 'Dual-Administrator Safeguard: Cannot revoke administrator access without approved confirmation from the other administrator. The mission must retain two verified administrators.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_admin_loss ON public.user_roles;
CREATE TRIGGER trg_prevent_admin_loss
  BEFORE UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_admin_role_change();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Helper Functions to check roles
CREATE OR REPLACE FUNCTION public.is_admin(uid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = uid AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_stage_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_task_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leetcode_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: All authenticated can view; only owner can update
CREATE POLICY "Profiles viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. Shared Content (Subjects, Categories, Topics, Pipeline Stages, Shared Tasks, LeetCode Problem Library):
-- Readable by all non-archived; Writable only by Admins (Anuraj & Soumyajit)
CREATE POLICY "Shared subjects viewable" ON public.subjects
  FOR SELECT USING (is_archived = FALSE OR public.is_admin(auth.uid()));
CREATE POLICY "Shared subjects admin write" ON public.subjects
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Shared topics viewable" ON public.topics
  FOR SELECT USING (is_archived = FALSE OR public.is_admin(auth.uid()));
CREATE POLICY "Shared topics admin write" ON public.topics
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Pipeline stages viewable" ON public.revision_stages
  FOR SELECT USING (TRUE);
CREATE POLICY "Pipeline stages admin write" ON public.revision_stages
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Mission tasks viewable" ON public.mission_tasks
  FOR SELECT USING (is_archived = FALSE OR public.is_admin(auth.uid()));
CREATE POLICY "Mission tasks admin write" ON public.mission_tasks
  FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "LeetCode problems viewable" ON public.leetcode_problems
  FOR SELECT USING (is_archived = FALSE OR public.is_admin(auth.uid()));
CREATE POLICY "LeetCode problems admin write" ON public.leetcode_problems
  FOR ALL USING (public.is_admin(auth.uid()));

-- 3. Personal Tables (Strict Row Level Security):
-- Topic Stage Progress, User Task Progress, LeetCode Submissions, Daily Activity, Mock Interviews, Readiness History
-- A user can only write their own records. Admins CANNOT overwrite peer's personal candidate records.
CREATE POLICY "Topic progress viewable by peers" ON public.topic_stage_progress
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Topic progress writable only by owner" ON public.topic_stage_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Task progress viewable by peers" ON public.user_task_progress
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Task progress writable only by owner" ON public.user_task_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "LeetCode submissions viewable by peers" ON public.leetcode_submissions
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "LeetCode submissions writable only by owner" ON public.leetcode_submissions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Daily activity viewable by peers" ON public.daily_activity
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Daily activity writable only by owner" ON public.daily_activity
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Mock interviews viewable by peers" ON public.mock_interviews
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Mock interviews writable only by owner" ON public.mock_interviews
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Readiness history viewable by peers" ON public.readiness_history
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Readiness history writable only by owner" ON public.readiness_history
  FOR ALL USING (auth.uid() = user_id);

-- 4. Push Subscriptions & Notifications (Strictly Private to the User)
CREATE POLICY "Push subscriptions strictly owner only" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Notifications strictly owner only" ON public.notifications
  FOR ALL USING (auth.uid() = user_id);

-- 5. Study Materials (Shared or Private)
CREATE POLICY "Study materials select" ON public.study_materials
  FOR SELECT USING (is_private = FALSE OR auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Study materials insert" ON public.study_materials
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Study materials modify" ON public.study_materials
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "Study materials delete" ON public.study_materials
  FOR DELETE USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

-- 6. Audit Logs & Admin Confirmations (Admin Only)
CREATE POLICY "Audit logs select admin" ON public.audit_logs
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Audit logs insert" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admin confirmations viewable by admins" ON public.admin_confirmations
  FOR ALL USING (public.is_admin(auth.uid()));

-- Enable Supabase Realtime for instant dual-dashboard synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE 
  public.topics,
  public.topic_stage_progress,
  public.mission_tasks,
  public.user_task_progress,
  public.leetcode_problems,
  public.leetcode_submissions,
  public.study_materials,
  public.announcements,
  public.admin_confirmations;
`;
