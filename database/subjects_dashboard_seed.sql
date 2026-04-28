-- Run this AFTER database/schema_backend.sql in Supabase SQL Editor.
-- It seeds the dashboard subject set: DBMS, OS, MDM, OE, CT.

-- ============================================================================
-- DEMO LOGIN CREDENTIALS
-- ============================================================================
-- 
-- ADMIN ACCOUNT:
-- Email                    | Password   | Role
-- admin@gmail.com          | Admin@123  | Admin (sees all data)
--
-- TEACHER ACCOUNTS (One per subject - each sees only their class):
-- Email                    | Password   | Subject | Class Name
-- mritunjay@gmail.com      | Admin@123  | CT      | CT - A
-- babita@gmail.com         | Admin@123  | OS      | OS - A
-- mamta@gmail.com          | Admin@123  | MDM     | MDM - A
-- vandana@gmail.com        | Admin@123  | DBMS    | DBMS - A
-- teacher_oe@gmail.com     | Admin@123  | OE      | OE - A
--
-- STUDENT ACCOUNTS (All see all 5 classes):
-- Email                  | Password   | Enrolled in all 5 subjects
-- amruta@gmail.com       | Admin@123  | DBMS, OS, MDM, OE, CT
-- rimzim@gmail.com       | Admin@123  | DBMS, OS, MDM, OE, CT
-- bhavesh@gmail.com      | Admin@123  | DBMS, OS, MDM, OE, CT
-- princess@gmail.com     | Admin@123  | DBMS, OS, MDM, OE, CT
-- Additional student roster from your insert list also uses Admin@123.
--
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS subject_catalog (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_label TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_subject_catalog_updated_at ON subject_catalog;
CREATE TRIGGER trg_subject_catalog_updated_at
BEFORE UPDATE ON subject_catalog
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

INSERT INTO subject_catalog (code, name, short_label)
VALUES
  ('DBMS', 'Database Management System', 'DBMS'),
  ('OS', 'Operating System', 'OS'),
  ('MDM', 'Multidisciplinary Minor', 'MDM'),
  ('OE', 'Open Elective', 'OE'),
  ('CT', 'Computational Thinking', 'CT')
ON CONFLICT (code) DO UPDATE
SET
  name = EXCLUDED.name,
  short_label = EXCLUDED.short_label,
  is_active = true,
  updated_at = NOW();

-- Admin seed (safe upsert)
INSERT INTO app_users (email, password_hash, full_name, role, is_active)
VALUES
  ('admin@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Platform Admin', 'admin', true)
ON CONFLICT (email) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = 'admin',
  is_active = true,
  updated_at = NOW();

-- Teacher seed (safe upsert) - One teacher per subject
INSERT INTO app_users (email, password_hash, full_name, role, is_active)
VALUES
  ('mritunjay@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Mritunjay', 'teacher', true),
  ('babita@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Babita', 'teacher', true),
  ('mamta@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Mamta', 'teacher', true),
  ('vandana@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Vandana', 'teacher', true),
  ('teacher_oe@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'OE Teacher', 'teacher', true)
ON CONFLICT (email) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = 'teacher',
  is_active = true,
  updated_at = NOW();

-- Student seed (safe upsert)
INSERT INTO app_users (email, password_hash, full_name, role, is_active)
VALUES
  ('amruta@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Amruta', 'student', true),
  ('rimzim@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Rimzim', 'student', true),
  ('bhavesh@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Bhavesh', 'student', true),
  ('princess@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'Princess', 'student', true),
  ('agaremanohar@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'AGARE SAMBHAN MANOHAR', 'student', true),
  ('ahirashish@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'AHIR ASHISH MOHAN', 'student', true),
  ('annadatemanish@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'ANNADATE VANSH MANISH', 'student', true),
  ('bansodeashish@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'BANSODE ASHISH SHIVAJIRAO', 'student', true),
  ('bhandarirasik@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'BHANDARI RASIK DINESH', 'student', true),
  ('bidgaranurag@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'BIDGAR ANURAG MAHADEO', 'student', true),
  ('dongilwarpooja@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DONGILWAR POOJA MAKARAND', 'student', true),
  ('borkarjatin@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'BORKAR JATIN JITENDRA', 'student', true),
  ('chaubalsurbhi@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'CHAUBAL SURBHI PANKAJ', 'student', true),
  ('chavanvedant@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'CHAVAN VEDANT VIKAS', 'student', true),
  ('desaialpesh@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DESAI ALPESH', 'student', true),
  ('deshmukhayush@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DESHMUKH AYUSH CHANDRAKANT', 'student', true),
  ('deshpandetanishq@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DESHPANDE TANISHQ SACHIN', 'student', true),
  ('digsakartejas@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DIGSAKAR TEJAS SANTOSH', 'student', true),
  ('dordeharsh@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DORDE HARSH SANTOSH', 'student', true),
  ('doshimeeti@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DOSHI MEETI MAYUR', 'student', true),
  ('dusharekaditya@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'DUSHAREKAR ADITYA RAJENDRA', 'student', true),
  ('gaikwadhrishikesh@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'GAIKWAD HRISHIKESH MAHENDRA', 'student', true),
  ('galaiyarushabh@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'GALAIYA RUSHABH PRAKASH', 'student', true),
  ('gandhipiyush@gmail.com', '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG', 'GANDHI PIYUSH KIRAN', 'student', true)
ON CONFLICT (email) DO UPDATE
SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  role = 'student',
  is_active = true,
  updated_at = NOW();

WITH teacher_mapping AS (
  SELECT * FROM (
    VALUES
      ('CT', 'mritunjay@gmail.com'),
      ('OS', 'babita@gmail.com'),
      ('MDM', 'mamta@gmail.com'),
      ('DBMS', 'vandana@gmail.com'),
      ('OE', 'teacher_oe@gmail.com')
  ) AS t(subject, teacher_email)
), teacher_ids AS (
  SELECT 
    tm.subject,
    u.id AS teacher_id
  FROM teacher_mapping tm
  JOIN app_users u ON u.email = tm.teacher_email
), class_seed AS (
  SELECT 
    ti.subject || ' - A' AS name,
    ti.subject,
    'Third Year' AS grade_level,
    'A' AS section,
    CASE ti.subject
      WHEN 'CT' THEN 'blue'
      WHEN 'OS' THEN 'green'
      WHEN 'MDM' THEN 'orange'
      WHEN 'DBMS' THEN 'red'
      WHEN 'OE' THEN 'purple'
    END AS color,
    ti.teacher_id
  FROM teacher_ids ti
)
INSERT INTO classes (name, subject, grade_level, section, color, teacher_id)
SELECT cs.name, cs.subject, cs.grade_level, cs.section, cs.color, cs.teacher_id
FROM class_seed cs
WHERE NOT EXISTS (
  SELECT 1
  FROM classes c
  WHERE c.name = cs.name AND c.teacher_id = cs.teacher_id
);

WITH students AS (
  SELECT id AS student_id
  FROM app_users
  WHERE email IN (
    'amruta@gmail.com',
    'rimzim@gmail.com',
    'bhavesh@gmail.com',
    'princess@gmail.com',
    'agaremanohar@gmail.com',
    'ahirashish@gmail.com',
    'annadatemanish@gmail.com',
    'bansodeashish@gmail.com',
    'bhandarirasik@gmail.com',
    'bidgaranurag@gmail.com',
    'dongilwarpooja@gmail.com',
    'borkarjatin@gmail.com',
    'chaubalsurbhi@gmail.com',
    'chavanvedant@gmail.com',
    'desaialpesh@gmail.com',
    'deshmukhayush@gmail.com',
    'deshpandetanishq@gmail.com',
    'digsakartejas@gmail.com',
    'dordeharsh@gmail.com',
    'doshimeeti@gmail.com',
    'dusharekaditya@gmail.com',
    'gaikwadhrishikesh@gmail.com',
    'galaiyarushabh@gmail.com',
    'gandhipiyush@gmail.com'
  )
), seeded_classes AS (
  SELECT id AS class_id
  FROM classes
  WHERE subject IN ('DBMS', 'OS', 'MDM', 'OE', 'CT')
)
INSERT INTO enrollments (class_id, student_id, status)
SELECT c.class_id, s.student_id, 'active'::enrollment_status
FROM seeded_classes c
CROSS JOIN students s
ON CONFLICT (class_id, student_id) DO UPDATE
SET status = 'active';

-- Optional checks
-- SELECT code, name FROM subject_catalog ORDER BY code;
-- SELECT name, subject FROM classes WHERE subject IN ('DBMS', 'OS', 'MDM', 'OE', 'CT') ORDER BY subject;
-- SELECT COUNT(*) AS enrolled_rows FROM enrollments;

