INSERT INTO public.classes (name, subject, grade_level, section, teacher_id, color)
VALUES
  ('DBMS - Section A', 'DBMS (Database Management System)', 'Semester 4', 'A', 'TEACHER_UUID_HERE', 'blue'),
  ('OS - Section B', 'OS (Operating System)', 'Semester 4', 'B', 'TEACHER_UUID_HERE', 'purple'),
  ('MDM - Section A', 'MDM (Multidisciplinary Minor)', 'Semester 4', 'A', 'TEACHER_UUID_HERE', 'green'),
  ('DT - Section A', 'DT (Design Thinking)', 'Semester 4', 'A', 'TEACHER_UUID_HERE', 'orange'),
  ('CT - Section A', 'CT (Computational Theory)', 'Semester 4', 'A', 'TEACHER_UUID_HERE', 'indigo');

-- Sample projects
INSERT INTO public.projects (class_id, name, description, due_date, progress, status)
SELECT 
  c.id,
  'Campus Inventory Database Design',
  'Students will design relational tables, keys, and queries for a campus inventory system',
  CURRENT_DATE + INTERVAL '3 days',
  75,
  'active'
FROM public.classes c WHERE c.name = 'DBMS - Section A'
LIMIT 1;

INSERT INTO public.projects (class_id, name, description, due_date, progress, status)
SELECT 
  c.id,
  'Process Scheduling Analyzer',
  'Analyze FCFS, SJF, and Round Robin scheduling with sample workloads',
  CURRENT_DATE + INTERVAL '7 days',
  45,
  'active'
FROM public.classes c WHERE c.name = 'OS - Section B'
LIMIT 1;

INSERT INTO public.projects (class_id, name, description, due_date, progress, status)
SELECT 
  c.id,
  'Design Sprint Portfolio',
  'Document problem framing, ideation, prototyping, and feedback loops',
  CURRENT_DATE + INTERVAL '2 days',
  90,
  'active'
FROM public.classes c WHERE c.name = 'DT - Section A'
LIMIT 1;

-- Sample class schedule
INSERT INTO public.class_schedule (class_id, day_of_week, start_time, end_time, topic)
SELECT 
  c.id,
  1, -- Monday
  '09:00:00',
  '10:00:00',
  'Normalization and ER Modeling'
FROM public.classes c WHERE c.name = 'DBMS - Section A'
LIMIT 1;

INSERT INTO public.class_schedule (class_id, day_of_week, start_time, end_time, topic)
SELECT 
  c.id,
  1, -- Monday
  '10:30:00',
  '11:30:00',
  'Process Scheduling'
FROM public.classes c WHERE c.name = 'OS - Section B'
LIMIT 1;

INSERT INTO public.class_schedule (class_id, day_of_week, start_time, end_time, topic)
SELECT 
  c.id,
  1, -- Monday
  '14:00:00',
  '15:00:00',
  'Empathy Mapping'
FROM public.classes c WHERE c.name = 'DT - Section A'
LIMIT 1;

-- Sample alerts (replace teacher_id with actual UUID)
-- INSERT INTO public.alerts (teacher_id, class_id, alert_type, priority, title, message, action_url)
-- VALUES
--   ('TEACHER_UUID', 'CLASS_UUID', 'mastery_threshold', 'high', '5 students below mastery threshold in Algebra', 'Students need additional support in quadratic equations', '/teacher/dashboard?tab=mastery'),
--   ('TEACHER_UUID', 'CLASS_UUID', 'engagement_drop', 'medium', 'Engagement dropped in last session', '20% decrease compared to previous week average', '/teacher/dashboard?tab=engagement'),
--   ('TEACHER_UUID', 'CLASS_UUID', 'project_milestone', 'medium', 'PBL milestone due tomorrow (3 teams)', 'Review project submissions and provide feedback', '/teacher/dashboard?tab=projects');

-- Note: Run this after setting up authentication and getting real user IDs
