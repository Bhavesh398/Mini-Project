import { Router } from 'express';
import { randomUUID } from 'crypto';
import { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { getMySqlPool } from '../db/mysqlPool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const classesRouter = Router();

const createClassSchema = z.object({
  name: z.string().min(2),
  subject: z.string().min(2),
  gradeLevel: z.string().min(1),
  section: z.string().optional(),
  color: z.string().default('blue')
});

const createEngagementSchema = z.object({
  studentId: z.string().uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  engagementLevel: z.enum(['active', 'passive', 'disengaged']),
  engagementScore: z.number().int().min(0).max(100),
  durationMinutes: z.number().int().positive().optional(),
  notes: z.string().optional()
});

const addStudentSchema = z.object({
  studentId: z.string().uuid().optional(),
  studentEmail: z.string().email().optional()
}).refine((value) => Boolean(value.studentId || value.studentEmail), {
  message: 'Either studentId or studentEmail is required'
});

classesRouter.use(requireAuth);

classesRouter.get('/', async (req, res) => {
  const pool = getMySqlPool();
  const { sub: userId, role } = req.auth!;

  if (role === 'teacher') {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM classes WHERE teacher_id = ? ORDER BY name`,
      [userId]
    );
    return res.json(result);
  }

  if (role === 'student') {
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT c.*
       FROM classes c
       JOIN enrollments e ON e.class_id = c.id
       WHERE e.student_id = ? AND e.status = 'active'
       ORDER BY c.name`,
      [userId]
    );
    return res.json(result);
  }

  const [all] = await pool.query<RowDataPacket[]>('SELECT * FROM classes ORDER BY name');
  return res.json(all);
});

classesRouter.post('/', requireRole('admin', 'teacher'), async (req, res) => {
  const pool = getMySqlPool();
  const parsed = createClassSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const teacherId = req.auth!.role === 'teacher' ? req.auth!.sub : req.body.teacherId;
  if (!teacherId) {
    return res.status(400).json({ message: 'teacherId is required for admin requests' });
  }

  const id = randomUUID();
  await pool.execute(
    `INSERT INTO classes (id, name, subject, grade_level, section, color, teacher_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      parsed.data.name,
      parsed.data.subject,
      parsed.data.gradeLevel,
      parsed.data.section ?? null,
      parsed.data.color,
      teacherId
    ]
  );

  const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM classes WHERE id = ? LIMIT 1', [id]);

  return res.status(201).json(result[0]);
});

classesRouter.get('/:classId/students', async (req, res) => {
  const pool = getMySqlPool();
  const classId = req.params.classId;

  const [result] = await pool.query<RowDataPacket[]>(
    `SELECT u.id, u.email, u.full_name, e.status, e.enrolled_at
     FROM enrollments e
     JOIN app_users u ON u.id = e.student_id
     WHERE e.class_id = ? AND e.status = 'active'
     ORDER BY u.full_name`,
    [classId]
  );

  return res.json(result);
});

classesRouter.post('/:classId/students', requireRole('admin', 'teacher'), async (req, res) => {
  const pool = getMySqlPool();
  const parsed = addStudentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const classId = req.params.classId;

  const [classResult] = await pool.query<RowDataPacket[]>(
    `SELECT id, teacher_id
     FROM classes
     WHERE id = ?`,
    [classId]
  );

  if (classResult.length === 0) {
    return res.status(404).json({ message: 'Class not found' });
  }

  const classRow = classResult[0];
  if (req.auth!.role === 'teacher' && classRow.teacher_id !== req.auth!.sub) {
    return res.status(403).json({ message: 'You can only manage your own classes' });
  }

  let studentId = parsed.data.studentId;
  if (!studentId && parsed.data.studentEmail) {
    const normalizedEmail = parsed.data.studentEmail.trim().toLowerCase();
    const [studentResult] = await pool.query<RowDataPacket[]>(
      `SELECT id
       FROM app_users
       WHERE email = ?
         AND role = 'student'
         AND is_active = true
       LIMIT 1`,
      [normalizedEmail]
    );

    if (studentResult.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    studentId = studentResult[0].id;
  }
  
    if (!studentId) {
      return res.status(400).json({ message: 'Unable to resolve student id' });
    }

  await pool.execute(
    `INSERT INTO enrollments (id, class_id, student_id, status)
     VALUES (?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE status = 'active'`,
    [randomUUID(), classId, studentId]
  );

  const [enrollmentResult] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM enrollments WHERE class_id = ? AND student_id = ? LIMIT 1`,
    [classId, studentId]
  );

  return res.status(201).json(enrollmentResult[0]);
});

classesRouter.get('/:classId/engagement', async (req, res) => {
  const pool = getMySqlPool();
  const classId = req.params.classId;

  const [result] = await pool.query<RowDataPacket[]>(
    `SELECT er.*, u.full_name AS student_name
     FROM engagement_records er
     JOIN app_users u ON u.id = er.student_id
     WHERE er.class_id = ?
     ORDER BY er.session_date DESC
     LIMIT 100`,
    [classId]
  );

  return res.json(result);
});

classesRouter.post('/:classId/engagement', requireRole('admin', 'teacher'), async (req, res) => {
  const pool = getMySqlPool();
  const parsed = createEngagementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const classId = req.params.classId;

  const id = randomUUID();
  await pool.execute(
    `INSERT INTO engagement_records
      (id, class_id, student_id, session_date, engagement_level, engagement_score, duration_minutes, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      classId,
      parsed.data.studentId,
      parsed.data.sessionDate,
      parsed.data.engagementLevel,
      parsed.data.engagementScore,
      parsed.data.durationMinutes ?? null,
      parsed.data.notes ?? null
    ]
  );

  const [result] = await pool.query<RowDataPacket[]>('SELECT * FROM engagement_records WHERE id = ? LIMIT 1', [id]);

  return res.status(201).json(result[0]);
});
