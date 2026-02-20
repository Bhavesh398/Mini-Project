# AMPLIFY Supabase Database Setup Guide

## Prerequisites
- A Supabase account (https://supabase.com)
- Node.js and npm installed

## Step 1: Create a Supabase Project

1. Go to https://supabase.com and sign in
2. Click "New Project"
3. Fill in:
   - Project name: `AMPLIFY` (or your preferred name)
   - Database password: (create a strong password)
   - Region: (choose closest to you)
4. Click "Create new project"

## Step 2: Run Database Schema

1. In your Supabase project dashboard, go to the **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database/schema.sql`
4. Paste into the SQL editor
5. Click "Run" or press Ctrl+Enter
6. Wait for success message

## Step 3: Set Up Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable "Email" provider
3. Configure email templates if desired

### Create Test Users

1. Go to **Authentication** → **Users**
2. Click "Add user" and create:
   - **Admin**: admin@institution.edu (password: admin123)
   - **Teacher**: teacher@institution.edu (password: teacher123)
   - **Student**: student@institution.edu (password: student123)

3. Note down the UUID for each user (you'll need these)

## Step 4: Insert User Profile Data

1. Go back to **SQL Editor**
2. Run this query for each user you created (replace UUIDs):

```sql
-- Admin user
INSERT INTO public.users (id, email, full_name, role)
VALUES ('PASTE_ADMIN_UUID_HERE', 'admin@institution.edu', 'Admin User', 'admin');

-- Teacher user
INSERT INTO public.users (id, email, full_name, role)
VALUES ('PASTE_TEACHER_UUID_HERE', 'teacher@institution.edu', 'John Smith', 'teacher');

-- Student users
INSERT INTO public.users (id, email, full_name, role)
VALUES 
  ('PASTE_STUDENT1_UUID_HERE', 'student1@institution.edu', 'Emma Davis', 'student'),
  ('PASTE_STUDENT2_UUID_HERE', 'student2@institution.edu', 'James Wilson', 'student'),
  ('PASTE_STUDENT3_UUID_HERE', 'student3@institution.edu', 'Sophia Martinez', 'student');
```

## Step 5: Insert Sample Data

1. Open `database/sample-data.sql`
2. Replace `TEACHER_UUID_HERE` with your teacher's UUID
3. Replace `CLASS_UUID` placeholders with actual class IDs (after classes are created)
4. Run the modified SQL in the SQL Editor

## Step 6: Configure Your Application

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key**

3. Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 7: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## Step 8: Test the Connection

1. Start your development server:
```bash
npm run dev
```

2. Go to the login page
3. Try logging in with:
   - **Admin**: admin@institution.edu / admin123
   - **Teacher**: teacher@institution.edu / teacher123
   - **Student**: student@institution.edu / student123

## Database Tables Overview

### Core Tables
- **users** - User profiles (linked to auth.users)
- **classes** - Classes/courses
- **enrollments** - Student-class relationships
- **engagement_records** - Student engagement tracking
- **mastery_records** - Concept mastery tracking
- **projects** - Project-based learning projects
- **project_teams** - Team groupings
- **project_team_members** - Team membership
- **assessments** - Quizzes, tests, assignments
- **assessment_results** - Student results
- **alerts** - Teacher notifications
- **ai_suggestions** - AI-generated suggestions requiring teacher approval
- **teacher_settings** - Teacher preferences
- **class_schedule** - Class schedules

### Security Features
- Row Level Security (RLS) enabled on all tables
- Teachers can only access their own classes
- Students can only see classes they're enrolled in
- Admins have full access

## API Usage Examples

### Get Teacher's Classes
```typescript
import { getTeacherClasses } from './services/database';

const classes = await getTeacherClasses(teacherId);
```

### Get Dashboard Stats
```typescript
import { getDashboardStats } from './services/database';

const stats = await getDashboardStats(teacherId);
```

### Record Student Engagement
```typescript
import { recordEngagement } from './services/database';

await recordEngagement({
  student_id: studentId,
  class_id: classId,
  session_date: '2026-01-07',
  engagement_level: 'active',
  engagement_score: 85,
  duration_minutes: 50
});
```

## Troubleshooting

### Connection Issues
- Verify your Supabase URL and anon key are correct
- Check that `.env` file is in the project root
- Ensure environment variables start with `VITE_`

### Authentication Issues
- Make sure users are created in Supabase Auth first
- Verify user profiles exist in the `users` table
- Check that RLS policies are enabled

### Data Not Showing
- Verify sample data was inserted correctly
- Check that class IDs and user IDs match
- Look at browser console for errors

## Next Steps

1. Customize the sample data for your needs
2. Add more students and classes
3. Populate engagement and mastery records
4. Test all dashboard features
5. Configure notification preferences

For issues, check the Supabase logs in your project dashboard under **Database** → **Logs**.
