import { randomUUID } from 'crypto';
import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { getMySqlPool } from '../db/mysqlPool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const tasksRouter = Router();

type TaskRow = RowDataPacket & {
  id: string;
  class_id: string;
  class_name: string;
  subject: string;
  teacher_id: string;
  teacher_name: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
};

type TaskSubmissionRow = RowDataPacket & {
  id: string;
  task_id: string;
  student_id: string;
  student_name: string;
  submission_text: string | null;
  submission_link: string | null;
  attachment_name: string | null;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  marks: number | null;
  feedback: string | null;
  reviewed_by: string | null;
  submitted_at: string;
  updated_at: string;
};

const createTaskSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().max(5000).optional(),
  dueDate: z.string().min(1).optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(5000).nullable().optional(),
  dueDate: z.string().min(1).nullable().optional()
});

const submitTaskSchema = z.object({
  submissionText: z.string().max(10000).optional(),
  submissionLink: z.string().url().optional(),
  attachmentName: z.string().max(255).optional()
});

const gradeTaskSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  marks: z.number().min(0).max(100).optional(),
  feedback: z.string().max(5000).optional()
});

function toMySqlDateTime(input?: string): string | null {
  if (!input) return null;

  const value = input.trim();
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return `${value.replace('T', ' ')}:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value} 00:00:00`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.replace('T', ' ');
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 19).replace('T', ' ');
}

tasksRouter.use(requireAuth);

tasksRouter.get('/student', requireRole('student'), async (req, res) => {
  const pool = getMySqlPool();
  const studentId = req.auth!.sub;

  const [enrolledClasses] = await pool.query<RowDataPacket[]>(
    `SELECT c.id FROM classes c
     INNER JOIN enrollments e ON e.class_id = c.id
     WHERE e.student_id = ? AND e.status = 'active'`,
    [studentId]
  );

  if (!enrolledClasses.length) {
    return res.json({ tasks: [], submissions: [] });
  }

  const classIds = enrolledClasses.map((row) => String(row.id));

  const [tasks] = await pool.query<TaskRow[]>(
    `SELECT t.id, t.class_id, c.name AS class_name, c.subject,
            t.teacher_id, u.full_name AS teacher_name,
            t.title, t.description, t.due_date, t.status,
            t.created_at, t.updated_at
     FROM tasks t
     INNER JOIN classes c ON c.id = t.class_id
     INNER JOIN app_users u ON u.id = t.teacher_id
     WHERE t.class_id IN (${classIds.map(() => '?').join(',')}) AND t.status = 'active'
     ORDER BY t.due_date ASC, t.created_at DESC`,
    classIds
  );

  const [submissions] = await pool.query<TaskSubmissionRow[]>(
    `SELECT ts.id, ts.task_id, ts.student_id, u.full_name AS student_name,
            ts.submission_text, ts.submission_link, ts.attachment_name,
            ts.status, ts.marks, ts.feedback, ts.reviewed_by,
            ts.submitted_at, ts.updated_at
     FROM task_submissions ts
     INNER JOIN app_users u ON u.id = ts.student_id
     WHERE ts.student_id = ?
     ORDER BY ts.submitted_at DESC`,
    [studentId]
  );

  return res.json({ tasks, submissions });
});

tasksRouter.post('/teacher', requireRole('teacher'), async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const pool = getMySqlPool();
  const teacherId = req.auth!.sub;
  const payload = parsed.data;

  const [classRows] = await pool.query<RowDataPacket[]>(
    `SELECT id FROM classes WHERE id = ? AND teacher_id = ? LIMIT 1`,
    [payload.classId, teacherId]
  );

  if (!classRows.length) {
    return res.status(403).json({ message: 'You can only create tasks for your classes' });
  }

  const normalizedDueDate = toMySqlDateTime(payload.dueDate);
  if (payload.dueDate && !normalizedDueDate) {
    return res.status(400).json({ message: 'Invalid due date format' });
  }

  const taskId = randomUUID();

  await pool.execute(
    `INSERT INTO tasks (id, class_id, teacher_id, title, description, due_date, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [
      taskId,
      payload.classId,
      teacherId,
      payload.title,
      payload.description || null,
      normalizedDueDate
    ]
  );

  const [rows] = await pool.query<TaskRow[]>(
    `SELECT t.id, t.class_id, c.name AS class_name, c.subject,
            t.teacher_id, u.full_name AS teacher_name,
            t.title, t.description, t.due_date, t.status,
            t.created_at, t.updated_at
     FROM tasks t
     INNER JOIN classes c ON c.id = t.class_id
     INNER JOIN app_users u ON u.id = t.teacher_id
     WHERE t.id = ? LIMIT 1`,
    [taskId]
  );

  return res.status(201).json(rows[0]);
});

tasksRouter.get('/teacher', requireRole('teacher'), async (req, res) => {
  const pool = getMySqlPool();
  const teacherId = req.auth!.sub;

  const [tasks] = await pool.query<TaskRow[]>(
    `SELECT t.id, t.class_id, c.name AS class_name, c.subject,
            t.teacher_id, u.full_name AS teacher_name,
            t.title, t.description, t.due_date, t.status,
            t.created_at, t.updated_at
     FROM tasks t
     INNER JOIN classes c ON c.id = t.class_id
     INNER JOIN app_users u ON u.id = t.teacher_id
     WHERE t.teacher_id = ?
     ORDER BY t.created_at DESC`,
    [teacherId]
  );

  const taskIds = tasks.map((task) => task.id);

  let submissions: TaskSubmissionRow[] = [];
  if (taskIds.length) {
    const [submissionRows] = await pool.query<TaskSubmissionRow[]>(
      `SELECT ts.id, ts.task_id, ts.student_id, u.full_name AS student_name,
              ts.submission_text, ts.submission_link, ts.attachment_name,
              ts.status, ts.marks, ts.feedback, ts.reviewed_by,
              ts.submitted_at, ts.updated_at
       FROM task_submissions ts
       INNER JOIN app_users u ON u.id = ts.student_id
       WHERE ts.task_id IN (${taskIds.map(() => '?').join(',')})
       ORDER BY ts.submitted_at DESC`,
      taskIds
    );
    submissions = submissionRows;
  }

  return res.json({ tasks, submissions });
});

tasksRouter.patch('/teacher/:taskId', requireRole('teacher'), async (req, res) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const payload = parsed.data;
  if (
    payload.title === undefined &&
    payload.description === undefined &&
    payload.dueDate === undefined
  ) {
    return res.status(400).json({ message: 'Provide at least one field to update' });
  }

  const pool = getMySqlPool();
  const teacherId = req.auth!.sub;
  const { taskId } = req.params;

  const [taskRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, teacher_id
     FROM tasks
     WHERE id = ?
     LIMIT 1`,
    [taskId]
  );

  if (!taskRows.length) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (String(taskRows[0].teacher_id) !== teacherId) {
    return res.status(403).json({ message: 'You can only edit your own tasks' });
  }

  const fields: string[] = [];
  const values: Array<string | null> = [];

  if (payload.title !== undefined) {
    fields.push('title = ?');
    values.push(payload.title.trim());
  }

  if (payload.description !== undefined) {
    fields.push('description = ?');
    values.push(payload.description ? payload.description.trim() : null);
  }

  if (payload.dueDate !== undefined) {
    const normalizedDueDate = payload.dueDate ? toMySqlDateTime(payload.dueDate) : null;
    if (payload.dueDate && !normalizedDueDate) {
      return res.status(400).json({ message: 'Invalid due date format' });
    }
    fields.push('due_date = ?');
    values.push(normalizedDueDate);
  }

  await pool.execute(
    `UPDATE tasks
     SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [...values, taskId]
  );

  const [rows] = await pool.query<TaskRow[]>(
    `SELECT t.id, t.class_id, c.name AS class_name, c.subject,
            t.teacher_id, u.full_name AS teacher_name,
            t.title, t.description, t.due_date, t.status,
            t.created_at, t.updated_at
     FROM tasks t
     INNER JOIN classes c ON c.id = t.class_id
     INNER JOIN app_users u ON u.id = t.teacher_id
     WHERE t.id = ?
     LIMIT 1`,
    [taskId]
  );

  return res.json(rows[0]);
});

tasksRouter.delete('/teacher/:taskId', requireRole('teacher'), async (req, res) => {
  const pool = getMySqlPool();
  const teacherId = req.auth!.sub;
  const { taskId } = req.params;

  const [taskRows] = await pool.query<RowDataPacket[]>(
    `SELECT id, teacher_id
     FROM tasks
     WHERE id = ?
     LIMIT 1`,
    [taskId]
  );

  if (!taskRows.length) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (String(taskRows[0].teacher_id) !== teacherId) {
    return res.status(403).json({ message: 'You can only delete your own tasks' });
  }

  await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
  return res.status(204).send();
});

tasksRouter.post('/:taskId/submit', requireRole('student'), async (req, res) => {
  const parsed = submitTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const pool = getMySqlPool();
  const { taskId } = req.params;
  const studentId = req.auth!.sub;
  const payload = parsed.data;

  const [enrollmentRow] = await pool.query<RowDataPacket[]>(
    `SELECT e.id
     FROM enrollments e
     INNER JOIN classes c ON c.id = e.class_id
     INNER JOIN tasks t ON t.class_id = c.id
     WHERE t.id = ? AND e.student_id = ? AND e.status = 'active'
     LIMIT 1`,
    [taskId, studentId]
  );

  if (!enrollmentRow || !enrollmentRow.length) {
    return res.status(403).json({ message: 'You are not enrolled in the class for this task' });
  }

  const submissionId = randomUUID();

  await pool.execute(
    `INSERT INTO task_submissions (id, task_id, student_id, submission_text, submission_link, attachment_name, status)
     VALUES (?, ?, ?, ?, ?, ?, 'submitted')
     ON DUPLICATE KEY UPDATE
       submission_text = VALUES(submission_text),
       submission_link = VALUES(submission_link),
       attachment_name = VALUES(attachment_name),
       status = 'submitted',
       submitted_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP`,
    [
      submissionId,
      taskId,
      studentId,
      payload.submissionText || null,
      payload.submissionLink || null,
      payload.attachmentName || null
    ]
  );

  const [rows] = await pool.query<TaskSubmissionRow[]>(
    `SELECT ts.id, ts.task_id, ts.student_id, u.full_name AS student_name,
            ts.submission_text, ts.submission_link, ts.attachment_name,
            ts.status, ts.marks, ts.feedback, ts.reviewed_by,
            ts.submitted_at, ts.updated_at
     FROM task_submissions ts
     INNER JOIN app_users u ON u.id = ts.student_id
     WHERE ts.task_id = ? AND ts.student_id = ? LIMIT 1`,
    [taskId, studentId]
  );

  return res.status(201).json(rows[0]);
});

tasksRouter.patch('/:taskId/submissions/:submissionId', requireRole('teacher'), async (req, res) => {
  const parsed = gradeTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const pool = getMySqlPool();
  const { taskId, submissionId } = req.params;
  const teacherId = req.auth!.sub;
  const payload = parsed.data;

  const [taskRow] = await pool.query<RowDataPacket[]>(
    `SELECT teacher_id FROM tasks WHERE id = ? LIMIT 1`,
    [taskId]
  );

  if (!taskRow || !taskRow.length) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (String(taskRow[0].teacher_id) !== teacherId) {
    return res.status(403).json({ message: 'You can only grade submissions for your tasks' });
  }

  await pool.execute(
    `UPDATE task_submissions
     SET status = ?, marks = ?, feedback = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = ? AND task_id = ?`,
    [payload.status, payload.marks || null, payload.feedback || null, teacherId, submissionId, taskId]
  );

  const [rows] = await pool.query<TaskSubmissionRow[]>(
    `SELECT ts.id, ts.task_id, ts.student_id, u.full_name AS student_name,
            ts.submission_text, ts.submission_link, ts.attachment_name,
            ts.status, ts.marks, ts.feedback, ts.reviewed_by,
            ts.submitted_at, ts.updated_at
     FROM task_submissions ts
     INNER JOIN app_users u ON u.id = ts.student_id
     WHERE ts.id = ? LIMIT 1`,
    [submissionId]
  );

  return res.json(rows[0]);
});
