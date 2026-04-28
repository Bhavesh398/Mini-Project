# AMPLIFY Schema Documentation

This document summarizes the database schema used in the AMPLIFY workspace. There are two closely related schema variants:

- [schema.sql](schema.sql) for a Supabase Auth-based deployment
- [schema_backend.sql](schema_backend.sql) for a backend-first deployment with local authentication and refresh tokens

The two schemas share the same core app model: users, classes, enrollments, engagement tracking, projects, assessments, alerts, and teacher settings. The backend-first schema adds local auth support and a mini-project subsystem.

## Schema Variants

### 1. Supabase Auth-based schema
File: [schema.sql](schema.sql)

Use this when user identity comes from `auth.users` in Supabase.

Main traits:
- `public.users` stores profile data and references `auth.users(id)`
- Access control is implemented with Row Level Security policies
- Includes core education tables and project/assessment tables

### 2. Backend-first schema
File: [schema_backend.sql](schema_backend.sql)

Use this when the application manages its own authentication.

Main traits:
- `app_users` stores login identity and password hashes
- Includes refresh token storage
- Uses PostgreSQL enums for constrained values
- Adds mini-project collaboration tables

## Core Entity Map

### People and access
- User profile / account table: `public.users` or `app_users`
- Roles: `admin`, `teacher`, `student`
- A teacher owns many classes
- A student can enroll in many classes

### Academics
- `classes` defines a class or course
- `enrollments` links students to classes
- `engagement_records` tracks participation over time
- `mastery_records` tracks concept-level mastery
- `class_schedule` stores recurring schedule entries

### Projects and assessment
- `projects` stores project-based learning work
- `project_teams` groups students within a project
- `project_team_members` links students to teams
- `assessments` stores quizzes, tests, assignments, and projects
- `assessment_results` stores per-student grading results

### Teacher support
- `alerts` stores notifications and action items
- `ai_suggestions` stores teacher-reviewable recommendations
- `teacher_settings` stores notification and threshold preferences

### Mini-project subsystem
- `mini_projects` stores project dashboards and metadata
- `mini_project_members` stores project participants
- `mini_project_tasks` stores task status per project
- `mini_project_activity` stores activity feed entries
- `mini_project_groups` and `mini_project_group_members` support sub-grouping inside a mini project

## Table Reference

## Supabase Auth-based schema

### `public.users`
Profile table for authenticated users.

Key columns:
- `id` UUID primary key, references `auth.users(id)`
- `email` unique, not null
- `full_name` not null
- `role` constrained to `admin`, `teacher`, or `student`
- `avatar_url`
- `created_at`, `updated_at`

Notes:
- This table extends Supabase Auth rather than replacing it.
- RLS allows a user to read and update only their own profile.

### `public.classes`
Defines a class, course, or section.

Key columns:
- `id` UUID primary key
- `name` not null
- `subject` not null
- `grade_level` not null
- `section`
- `teacher_id` references `public.users(id)`
- `color` default `blue`
- `created_at`, `updated_at`

Relationships:
- One teacher to many classes
- One class to many enrollments, engagement records, mastery records, projects, assessments, alerts, and schedule rows

### `public.enrollments`
Join table that links students to classes.

Key columns:
- `id` UUID primary key
- `student_id` references `public.users(id)`
- `class_id` references `public.classes(id)`
- `enrolled_at`
- `status` constrained to `active`, `inactive`, `completed`

Constraints:
- Unique pair on `(student_id, class_id)`

### `public.engagement_records`
Stores engagement snapshots for a student in a class.

Key columns:
- `id` UUID primary key
- `student_id` references `public.users(id)`
- `class_id` references `public.classes(id)`
- `session_date` not null
- `engagement_level` constrained to `active`, `passive`, `disengaged`
- `engagement_score` between 0 and 100
- `duration_minutes`
- `notes`
- `created_at`

### `public.mastery_records`
Stores mastery measurements for a concept in a class.

Key columns:
- `id` UUID primary key
- `student_id` references `public.users(id)`
- `class_id` references `public.classes(id)`
- `concept` not null
- `mastery_level` between 0 and 100
- `assessment_date` not null
- `notes`
- `created_at`, `updated_at`

### `public.projects`
Project-based learning projects.

Key columns:
- `id` UUID primary key
- `class_id` references `public.classes(id)`
- `name` not null
- `description`
- `due_date`
- `status` constrained to `active`, `completed`, `cancelled`
- `progress` between 0 and 100
- `created_at`, `updated_at`

### `public.project_teams`
Project teams inside a class project.

Key columns:
- `id` UUID primary key
- `project_id` references `public.projects(id)`
- `name` not null
- `progress` between 0 and 100
- `created_at`

### `public.project_team_members`
Links students to teams.

Key columns:
- `id` UUID primary key
- `team_id` references `public.project_teams(id)`
- `student_id` references `public.users(id)`
- `contribution_score` between 0 and 100
- `is_active` default `true`
- `joined_at`

Constraints:
- Unique pair on `(team_id, student_id)`

### `public.assessments`
Assessment definitions.

Key columns:
- `id` UUID primary key
- `class_id` references `public.classes(id)`
- `title` not null
- `description`
- `assessment_type` constrained to `quiz`, `test`, `assignment`, `project`
- `total_points`
- `due_date`
- `created_by` references `public.users(id)`
- `created_at`

### `public.assessment_results`
Per-student assessment results.

Key columns:
- `id` UUID primary key
- `assessment_id` references `public.assessments(id)`
- `student_id` references `public.users(id)`
- `score`
- `max_score`
- `percentage`
- `submitted_at`
- `graded_at`
- `feedback`

Constraints:
- Unique pair on `(assessment_id, student_id)`

### `public.alerts`
Teacher-facing notifications.

Key columns:
- `id` UUID primary key
- `teacher_id` references `public.users(id)`
- `class_id` references `public.classes(id)`
- `alert_type` constrained to `mastery_threshold`, `engagement_drop`, `project_milestone`, `general`
- `priority` constrained to `low`, `medium`, `high`
- `title` not null
- `message` not null
- `action_url`
- `is_read` default `false`
- `created_at`

### `public.ai_suggestions`
AI-generated recommendations that require teacher review.

Key columns:
- `id` UUID primary key
- `teacher_id` references `public.users(id)`
- `student_id` references `public.users(id)`
- `class_id` references `public.classes(id)`
- `suggestion_type` constrained to `intervention`, `practice`, `feedback`, `grouping`
- `content` not null
- `reasoning`
- `status` constrained to `pending`, `approved`, `rejected`, `modified`
- `teacher_feedback`
- `created_at`, `reviewed_at`

### `public.teacher_settings`
Per-teacher notification and threshold settings.

Key columns:
- `id` UUID primary key
- `teacher_id` unique, references `public.users(id)`
- `notification_mastery_threshold` default `true`
- `notification_engagement_drop` default `true`
- `notification_project_milestone` default `true`
- `notification_weekly_summary` default `false`
- `mastery_threshold` between 0 and 100, default `70`
- `engagement_threshold` between 0 and 100, default `70`
- `created_at`, `updated_at`

### `public.class_schedule`
Recurring class schedule entries.

Key columns:
- `id` UUID primary key
- `class_id` references `public.classes(id)`
- `day_of_week` between 0 and 6
- `start_time` not null
- `end_time` not null
- `topic`
- `created_at`

## Seed-backed support tables

These tables are created by the seed scripts rather than the core schema files, but they are part of the effective database shape used by the app.

### `subject_catalog`
Lookup table used by the dashboard seed.

Key columns:
- `code` text primary key
- `name` not null
- `short_label` not null
- `is_active` default `true`
- `created_at`, `updated_at`

Notes:
- Created in [subjects_dashboard_seed.sql](subjects_dashboard_seed.sql)
- Populated with DBMS, OS, MDM, OE, and CT
- Uses the shared `set_updated_at()` trigger function from the backend-first schema

## Backend-first schema

### `app_users`
Authentication and profile table for the backend-first deployment.

Key columns:
- `id` UUID primary key
- `email` unique, not null
- `password_hash` not null
- `full_name` not null
- `role` enum `user_role`
- `avatar_url`
- `is_active` default `true`
- `created_at`, `updated_at`

Notes:
- This table replaces Supabase Auth for the backend-first setup.
- A trigger updates `updated_at` on row changes.

### `classes`
Same concept as the Supabase schema, but references `app_users`.

Key columns:
- `id` UUID primary key
- `name`, `subject`, `grade_level` not null
- `section`
- `color` default `blue`
- `teacher_id` references `app_users(id)`
- `created_at`, `updated_at`

### `enrollments`
Links students and classes.

Key columns:
- `id` UUID primary key
- `class_id` references `classes(id)`
- `student_id` references `app_users(id)`
- `status` enum `enrollment_status`, default `active`
- `enrolled_at`

Constraints:
- Unique pair on `(class_id, student_id)`

### `engagement_records`
Stores engagement events for class sessions.

Key columns:
- `id` UUID primary key
- `class_id` references `classes(id)`
- `student_id` references `app_users(id)`
- `session_date` not null
- `engagement_level` enum `engagement_level`
- `engagement_score` between 0 and 100
- `duration_minutes`
- `notes`
- `created_at`

### `refresh_tokens`
Session persistence for backend login.

Key columns:
- `id` UUID primary key
- `user_id` references `app_users(id)`
- `token` unique, not null
- `expires_at` not null
- `revoked_at`
- `created_at`

### `mini_projects`
Project dashboard records.

Key columns:
- `id` text primary key
- `name`, `subject`, `team_name` not null
- `progress` between 0 and 100, default `0`
- `next_milestone` not null
- `status` enum `mini_project_status`, default `on-track`
- `summary` not null
- `branch`, `repo_name` not null
- `repo_status` enum `mini_project_repo_status`, default `synced`
- `goals` text array default empty
- `available_files` text array default empty
- `created_by` references `app_users(id)`
- `created_at`, `updated_at`

### `mini_project_members`
People assigned to a mini project.

Key columns:
- `project_id` references `mini_projects(id)`
- `id` text
- `name` not null
- `role` not null
- `current_focus` not null
- `created_at`

Constraints:
- Primary key on `(project_id, id)`

### `mini_project_tasks`
Task list for a mini project.

Key columns:
- `project_id` references `mini_projects(id)`
- `id` text
- `title` not null
- `owner_id` text not null
- `status` enum `mini_project_task_status`, default `todo`
- `updated_at`

Constraints:
- Primary key on `(project_id, id)`

### `mini_project_activity`
Activity feed for a mini project.

Key columns:
- `project_id` references `mini_projects(id)`
- `id` text
- `type` enum `mini_project_activity_type`
- `student_id` text
- `student_name` not null
- `branch` not null
- `title` not null
- `description` not null
- `files` text array default empty
- `timestamp` default now
- `lines_added` default 0
- `lines_removed` default 0

Constraints:
- Primary key on `(project_id, id)`

### `mini_project_groups`
Logical sub-groups within a mini project.

Key columns:
- `id` UUID primary key
- `project_id` references `mini_projects(id)`
- `name` not null
- `created_at`

### `mini_project_group_members`
Joins group members to mini project members.

Key columns:
- `project_id` text not null
- `group_id` references `mini_project_groups(id)`
- `member_id` text not null

Constraints:
- Primary key on `(project_id, group_id, member_id)`
- Composite foreign key from `(project_id, member_id)` to `mini_project_members(project_id, id)`

## Enums in the Backend-first schema

- `user_role`: `admin`, `teacher`, `student`
- `enrollment_status`: `active`, `inactive`, `completed`
- `engagement_level`: `active`, `passive`, `disengaged`
- `mini_project_status`: `on-track`, `at-risk`, `completed`
- `mini_project_repo_status`: `synced`, `review`, `behind`
- `mini_project_activity_type`: `commit`, `push`, `pull`
- `mini_project_task_status`: `todo`, `in-progress`, `done`

## Triggers and indexes

### Triggers
Backend-first schema:
- `set_updated_at()` updates `updated_at` before row updates
- Trigger on `app_users`
- Trigger on `classes`

### Indexes
Backend-first schema adds indexes for:
- `classes.teacher_id`
- `enrollments.class_id`
- `enrollments.student_id`
- `engagement_records(class_id, session_date DESC)`
- `engagement_records(student_id, session_date DESC)`
- `refresh_tokens.user_id`
- `mini_projects.status`
- `mini_projects.updated_at DESC`
- `mini_project_activity(project_id, timestamp DESC)`

## Security model

### Supabase schema
- RLS is enabled on all major tables
- Users can read and update only their own profile
- Teachers can manage classes they own
- Students can read classes they are enrolled in
- Admin access is granted through policy checks

### Backend-first schema
- Uses application-managed authentication
- Passwords are stored as hashes
- Refresh tokens support session lifecycle management
- Access control is expected to be enforced in the backend routes and middleware

## Seed and setup notes

- [README.md](README.md) explains the Supabase setup flow for the auth-based schema
- [TEACHER_LOGIN_SCHEMA.md](TEACHER_LOGIN_SCHEMA.md) documents the teacher/student dataset used for the dashboard demo
- `schema_backend.sql` seeds one admin user by default

## Quick Reference

If you want the shortest answer to "what are the main tables?", they are:

- People: `users` or `app_users`
- Classes: `classes`
- Student links: `enrollments`
- Learning data: `engagement_records`, `mastery_records`
- Projects: `projects`, `project_teams`, `project_team_members`
- Assessments: `assessments`, `assessment_results`
- Messaging: `alerts`, `ai_suggestions`
- Preferences: `teacher_settings`
- Scheduling: `class_schedule`
- Backend auth: `refresh_tokens`
- Mini-projects: `mini_projects`, `mini_project_members`, `mini_project_tasks`, `mini_project_activity`, `mini_project_groups`, `mini_project_group_members`
