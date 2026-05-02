-- Sir Ajit Pillai Classes - Supabase Schema
-- Run this in your Supabase SQL Editor

-- Drop existing tables (use with caution)
-- drop table if exists announcements, marks, broadcasts, submissions, homework, attendance, parents, students, classrooms cascade;

-- Classrooms
 create table classrooms (
  id bigint primary key,
  name text not null,
  board text not null,
  grade text not null,
  schedule text,
  location text
);

-- Students
 create table students (
  id bigint primary key,
  name text not null,
  classroom_id bigint references classrooms(id) on delete set null,
  roll_no text,
  pin text,
  phone text,
  parent_id bigint,
  pin_set boolean default false
);

-- Parents
 create table parents (
  id bigint primary key,
  name text not null,
  phone text,
  student_id bigint references students(id) on delete set null,
  pin text,
  pin_set boolean default false
);

-- Attendance (records stored as JSONB)
 create table attendance (
  id bigint primary key,
  date date not null,
  classroom_id bigint references classrooms(id) on delete cascade,
  records jsonb default '[]'
);

-- Homework
 create table homework (
  id bigint primary key,
  classroom_id bigint references classrooms(id) on delete cascade,
  title text not null,
  "desc" text,
  due date,
  type text,
  created date,
  attachment jsonb
);

-- Submissions
 create table submissions (
  id bigint primary key,
  hw_id bigint references homework(id) on delete cascade,
  student_id bigint references students(id) on delete cascade,
  at text,
  file text,
  file_data text,
  grade text,
  fb text
);

-- Broadcasts / Messages
 create table broadcasts (
  id bigint primary key,
  text text not null,
  ts text,
  classroom_id bigint references classrooms(id) on delete set null
);

-- Marks / Test Results
 create table marks (
  id bigint primary key,
  classroom_id bigint references classrooms(id) on delete cascade,
  student_id bigint references students(id) on delete cascade,
  test text not null,
  date date,
  max integer,
  score integer
);

-- Announcements
 create table announcements (
  id bigint primary key,
  title text not null,
  body text,
  date date,
  pinned boolean default false
);

-- Enable Row Level Security (open for demo / small trusted deployments)
alter table classrooms enable row level security;
alter table students enable row level security;
alter table parents enable row level security;
alter table attendance enable row level security;
alter table homework enable row level security;
alter table submissions enable row level security;
alter table broadcasts enable row level security;
alter table marks enable row level security;
alter table announcements enable row level security;

-- Allow all operations for anon users (suitable for demo / internal tuition app)
-- For production, switch to authenticated users with proper policies
 create policy "Allow all" on classrooms for all using (true) with check (true);
 create policy "Allow all" on students for all using (true) with check (true);
 create policy "Allow all" on parents for all using (true) with check (true);
 create policy "Allow all" on attendance for all using (true) with check (true);
 create policy "Allow all" on homework for all using (true) with check (true);
 create policy "Allow all" on submissions for all using (true) with check (true);
 create policy "Allow all" on broadcasts for all using (true) with check (true);
 create policy "Allow all" on marks for all using (true) with check (true);
 create policy "Allow all" on announcements for all using (true) with check (true);

-- Enable Realtime for all tables
alter publication supabase_realtime add table classrooms;
alter publication supabase_realtime add table students;
alter publication supabase_realtime add table parents;
alter publication supabase_realtime add table attendance;
alter publication supabase_realtime add table homework;
alter publication supabase_realtime add table submissions;
alter publication supabase_realtime add table broadcasts;
alter publication supabase_realtime add table marks;
alter publication supabase_realtime add table announcements;
