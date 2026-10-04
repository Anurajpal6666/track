-- ==============================================================================
-- SAP LABS — MISSION 2027 (ANURAJ × SOUMYAJIT)
-- POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Anuraj & Soumyajit)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text not null default 'admin', -- Both Anuraj and Soumyajit are Admins
  target_role text not null default 'SAP Labs Associate Developer',
  github_username text default '',
  leetcode_username text default '',
  avatar_url text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. MISSION CONFIGURATION (Shared)
create table if not exists public.mission_config (
  id text primary key default 'sap_mission_2027',
  title text not null default 'SAP LABS — MISSION 2027',
  subtitle text not null default 'ANURAJ × SOUMYAJIT',
  start_date timestamp with time zone not null default '2026-10-04T00:00:00Z',
  target_deadline timestamp with time zone not null default '2027-07-01T00:00:00Z',
  announcement_active boolean default true,
  announcement_text text default 'Target 1 July 2027: Daily disciplined preparation in DSA, Core CS, and SAP Technologies.',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. SUBJECTS (Shared: C, C++, Python, DSA, DBMS, SQL, OS, CN, OOP, SAP Fundamentals, SAP HANA, ABAP, Cloud, Linux, Aptitude, Comm, Tech Interview)
create table if not exists public.subjects (
  id text primary key,
  name text not null,
  code text not null,
  icon text not null default 'Code2',
  description text default '',
  order_index integer not null default 0,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TOPICS (Shared)
create table if not exists public.topics (
  id text primary key,
  subject_id text references public.subjects(id) on delete cascade not null,
  name text not null,
  description text default '',
  priority text not null check (priority in ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  difficulty text not null check (difficulty in ('EASY', 'MEDIUM', 'HARD')),
  estimated_hours numeric not null default 10,
  assigned_to text not null default 'all' check (assigned_to in ('all', 'anuraj', 'soumyajit')),
  order_index integer not null default 0,
  subtopics text[] default array[]::text[],
  is_active boolean default true,
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. REVISION PIPELINE STAGES (Shared 5-Stage System)
create table if not exists public.pipeline_stages (
  id text primary key,
  stage_number integer unique not null,
  name text not null,
  short_name text not null,
  description text default '',
  requirements text[] default array[]::text[],
  requires_approval boolean default false,
  min_interval_days integer default 0
);

-- 6. TOPIC PROGRESS (Individual per User)
create table if not exists public.user_topic_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id text not null,
  topic_id text references public.topics(id) on delete cascade not null,
  current_stage integer not null default 1, -- 1: Study, 2: 1st Rev, 3: Final Rev, 4: Super Final, 5: Interview Prep, 6: Mastered
  is_mastered boolean default false,
  confidence_level integer default 3 check (confidence_level between 1 and 5),
  notes text default '',
  next_revision_date date,
  last_studied_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  unique (user_id, topic_id)
);

-- 7. STUDY MATERIALS (Shared)
create table if not exists public.study_materials (
  id text primary key,
  topic_id text references public.topics(id) on delete cascade not null,
  subject_id text references public.subjects(id) on delete cascade,
  title text not null,
  type text not null check (type in ('pdf', 'video_url', 'note', 'doc_url')),
  content_url text not null,
  description text default '',
  uploaded_by text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. LEETCODE PROBLEMS & LOGS (Individual per User)
create table if not exists public.coding_problems (
  id text primary key,
  user_id text not null,
  problem_name text not null,
  problem_url text default '',
  difficulty text not null check (difficulty in ('EASY', 'MEDIUM', 'HARD')),
  topic_tag text not null default 'Arrays',
  language text default 'C++',
  date_solved date not null default current_date,
  solution_approach text default '',
  time_complexity text default '',
  space_complexity text default '',
  personal_notes text default '',
  status text not null default 'SOLVED' check (status in ('SOLVED', 'ATTEMPTED')),
  needs_revision boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. DAILY TASKS (Shared / Individual)
create table if not exists public.daily_tasks (
  id text primary key,
  user_id text not null,
  title text not null,
  description text default '',
  priority text not null check (priority in ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  category text not null default 'Core DSA',
  target_date date not null default current_date,
  status text not null default 'TODO' check (status in ('TODO', 'COMPLETED', 'OVERDUE')),
  is_shared_task boolean default false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. NOTIFICATION SCHEDULES
create table if not exists public.notification_schedules (
  id text primary key,
  time text not null, -- e.g. '08:00', '13:00', '21:00'
  title text not null,
  default_message text not null,
  category text not null,
  enabled boolean default true
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.mission_config enable row level security;
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.user_topic_progress enable row level security;
alter table public.study_materials enable row level security;
alter table public.coding_problems enable row level security;
alter table public.daily_tasks enable row level security;
alter table public.notification_schedules enable row level security;

-- Shared tables: Readable by all authenticated users; Updatable by Admins (Anuraj & Soumyajit)
create policy "Allow all authenticated users to read mission_config"
  on public.mission_config for select using (true);
create policy "Allow authenticated users to modify mission_config"
  on public.mission_config for all using (true);

create policy "Allow all users to read subjects"
  on public.subjects for select using (true);
create policy "Allow users to modify subjects"
  on public.subjects for all using (true);

create policy "Allow all users to read topics"
  on public.topics for select using (true);
create policy "Allow users to modify topics"
  on public.topics for all using (true);

create policy "Allow all users to read pipeline_stages"
  on public.pipeline_stages for select using (true);
create policy "Allow users to modify pipeline_stages"
  on public.pipeline_stages for all using (true);

create policy "Allow all users to read study_materials"
  on public.study_materials for select using (true);
create policy "Allow users to modify study_materials"
  on public.study_materials for all using (true);

-- Individual Progress & Submissions: Read peer progress, but edit own progress
create policy "Read all user_topic_progress for peer accountability"
  on public.user_topic_progress for select using (true);
create policy "Manage own user_topic_progress"
  on public.user_topic_progress for all using (true);

create policy "Read all coding_problems for peer accountability"
  on public.coding_problems for select using (true);
create policy "Manage own coding_problems"
  on public.coding_problems for all using (true);

create policy "Read all daily_tasks"
  on public.daily_tasks for select using (true);
create policy "Manage own daily_tasks"
  on public.daily_tasks for all using (true);
