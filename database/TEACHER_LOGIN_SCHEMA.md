# Teacher Login & Dashboard Schema

## 5 Teacher Accounts (One Per Subject)

Each teacher has their own class and will see ONLY that class in their dashboard with all 4 students enrolled.

### 1. CT (Computational Thinking)
- **Name:** Mritunjay
- **Email:** `mritunjay@gmail.com`
- **Password:** `Admin@123`
- **Class Name:** CT - A
- **Subject:** CT
- **Students Enrolled:** Amruta, Rimzim, Bhavesh, Princess (all 4)

### 2. OS (Operating System)
- **Name:** Babita
- **Email:** `babita@gmail.com`
- **Password:** `Admin@123`
- **Class Name:** OS - A
- **Subject:** OS
- **Students Enrolled:** Amruta, Rimzim, Bhavesh, Princess (all 4)

### 3. MDM (Multidisciplinary Minor)
- **Name:** Mamta
- **Email:** `mamta@gmail.com`
- **Password:** `Admin@123`
- **Class Name:** MDM - A
- **Subject:** MDM
- **Students Enrolled:** Amruta, Rimzim, Bhavesh, Princess (all 4)

### 4. DBMS (Database Management System)
- **Name:** Vandana
- **Email:** `vandana@gmail.com`
- **Password:** `Admin@123`
- **Class Name:** DBMS - A
- **Subject:** DBMS
- **Students Enrolled:** Amruta, Rimzim, Bhavesh, Princess (all 4)

### 5. OE (Open Elective)
- **Name:** OE Teacher
- **Email:** `teacher_oe@gmail.com`
- **Password:** `Admin@123`
- **Class Name:** OE - A
- **Subject:** OE
- **Students Enrolled:** Amruta, Rimzim, Bhavesh, Princess (all 4)

---

## Student Accounts

All students have access to all 5 subject classes:

| Name | Email | Password |
|------|-------|----------|
| Amruta | `amruta@gmail.com` | `Admin@123` |
| Rimzim | `rimzim@gmail.com` | `Admin@123` |
| Bhavesh | `bhavesh@gmail.com` | `Admin@123` |
| Princess | `princess@gmail.com` | `Admin@123` |

---

## How It Works

### Teacher Dashboard
- When a teacher logs in, they see **only their subject class** in the class section
- That class shows all 4 students enrolled
- No other subject classes appear in their view (backend filters by teacher_id)

### Student Dashboard
- Students see **all 5 subject classes** they're enrolled in
- They can access and work on projects in any of these classes

### Database Structure
- 1 class per subject (5 total)
- Each class owned by its respective teacher
- All 4 students enrolled in all 5 classes (20 total enrollment records)

---

## How to Apply This Schema

1. **Copy and run** [database/schema_backend.sql](database/schema_backend.sql) in Supabase SQL Editor first
2. **Copy and run** [database/subjects_dashboard_seed.sql](database/subjects_dashboard_seed.sql) in Supabase SQL Editor

Both scripts use `ON CONFLICT ... DO UPDATE` so they're safe to re-run.

---

## Verification Queries (Optional)

Run these in Supabase SQL Editor to verify setup:

```sql
-- Check all teachers
SELECT email, full_name, role FROM app_users WHERE role = 'teacher' ORDER BY full_name;

-- Check all classes and their teachers
SELECT c.name, c.subject, u.full_name AS teacher_name 
FROM classes c 
JOIN app_users u ON c.teacher_id = u.id 
ORDER BY c.subject;

-- Check all students
SELECT email, full_name FROM app_users WHERE role = 'student' ORDER BY full_name;

-- Count total enrollments
SELECT COUNT(*) AS total_student_class_enrollments FROM enrollments;

-- Check enrollments for a specific class
SELECT c.name, u.full_name AS student_name 
FROM enrollments e 
JOIN classes c ON e.class_id = c.id 
JOIN app_users u ON e.student_id = u.id 
WHERE c.subject = 'DBMS' 
ORDER BY u.full_name;
```
