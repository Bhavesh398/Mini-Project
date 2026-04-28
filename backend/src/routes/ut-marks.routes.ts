import { randomUUID } from 'crypto';
import { Router } from 'express';
import ExcelJS from 'exceljs';
import { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { getMySqlPool } from '../db/mysqlPool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const utMarksRouter = Router();

const subjectCodes = ['DBMS', 'OS', 'MDM', 'OE', 'CT'] as const;

const seedStudentSchema = z.object({
  name: z.string().min(2),
  attendanceProgress: z.number().int().min(0).max(100)
});

const bootstrapSchema = z.object({
  students: z.array(seedStudentSchema).min(1)
});

const updateMarkSchema = z.object({
  studentId: z.string().min(1).optional(),
  studentEmail: z.string().email().optional(),
  subjectCode: z.enum(subjectCodes),
  mark: z.number().min(0).max(20)
}).refine((value) => Boolean(value.studentId || value.studentEmail), {
  message: 'studentId or studentEmail is required'
});

type UtMarkRow = RowDataPacket & {
  student_id: string;
  subject_code: string;
  mark: number;
};

type StudentRow = RowDataPacket & {
  id: string;
  email: string;
  full_name: string;
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function clampMark(mark: number): number {
  return Math.max(0, Math.min(20, Math.round(mark)));
}

function attendanceMark(studentName: string, subjectCode: string, attendanceProgress: number): number {
  const baseline = Math.round(attendanceProgress / 5);
  const offset = (hashSeed(`${studentName}:${subjectCode}`) % 5) - 2;
  return clampMark(baseline + offset);
}

async function getSubjectMap(pool: ReturnType<typeof getMySqlPool>) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT code, short_label, name
       FROM subject_catalog
       WHERE is_active = true
       ORDER BY code`
    );

    if (rows.length > 0) {
      return rows.map((row) => row.code as string);
    }
  } catch {
    // Fallback to default subject codes when subject_catalog is not provisioned.
  }

  return [...subjectCodes];
}

async function getStudentSheets(pool: ReturnType<typeof getMySqlPool>, studentIds?: string[]) {
  const params: string[] = [];
  let whereClause = "WHERE u.role = 'student' AND u.is_active = true";

  if (studentIds && studentIds.length > 0) {
    whereClause += ` AND u.id IN (${studentIds.map(() => '?').join(', ')})`;
    params.push(...studentIds);
  }

  const [rows] = await pool.query<(RowDataPacket & { student_id: string; student_name: string; student_email: string; subject_code: string | null; mark: number | null })[]>(
    `SELECT
       u.id AS student_id,
       u.full_name AS student_name,
       u.email AS student_email,
       um.subject_code,
       um.mark
     FROM app_users u
     LEFT JOIN ut_marks um ON um.student_id = u.id
     ${whereClause}
     ORDER BY u.full_name, um.subject_code`,
    params
  );

  const subjects = [...subjectCodes];
  const sheets = new Map<string, { studentId: string; studentName: string; studentEmail: string; marksBySubject: Record<string, number> }>();

  for (const row of rows) {
    if (!sheets.has(row.student_id)) {
      sheets.set(row.student_id, {
        studentId: row.student_id,
        studentName: row.student_name,
        studentEmail: row.student_email,
        marksBySubject: Object.fromEntries(subjects.map((subject) => [subject, 0]))
      });
    }

    if (row.subject_code) {
      sheets.get(row.student_id)!.marksBySubject[row.subject_code] = Number(row.mark ?? 0);
    }
  }

  return Array.from(sheets.values());
}

async function ensureSeededMarks(pool: ReturnType<typeof getMySqlPool>, students: Array<{ name: string; attendanceProgress: number }>) {
  const [studentRows] = await pool.query<StudentRow[]>(
    `SELECT id, email, full_name
     FROM app_users
     WHERE role = 'student' AND is_active = true
     ORDER BY full_name`
  );

  const studentMap = new Map(studentRows.map((row) => [row.full_name.trim().toLowerCase(), row]));
  const subjects = await getSubjectMap(pool);

  for (const student of students) {
    const studentRow = studentMap.get(student.name.trim().toLowerCase());
    if (!studentRow) continue;

    for (const subjectCode of subjects) {
      const [existing] = await pool.query<RowDataPacket[]>(
        `SELECT id
         FROM ut_marks
         WHERE student_id = ? AND subject_code = ?
         LIMIT 1`,
        [studentRow.id, subjectCode]
      );

      if (existing.length > 0) continue;

      await pool.execute(
        `INSERT INTO ut_marks (id, student_id, subject_code, mark)
         VALUES (?, ?, ?, ?)` ,
        [randomUUID(), studentRow.id, subjectCode, attendanceMark(student.name, subjectCode, student.attendanceProgress)]
      );
    }
  }
}

utMarksRouter.use(requireAuth);

utMarksRouter.post('/bootstrap', requireRole('teacher', 'admin'), async (req, res) => {
  const pool = getMySqlPool();
  const parsed = bootstrapSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  await ensureSeededMarks(pool, parsed.data.students);
  const sheets = await getStudentSheets(pool);
  return res.json({ sheets });
});

utMarksRouter.get('/', requireRole('teacher', 'admin'), async (_req, res) => {
  const pool = getMySqlPool();
  const sheets = await getStudentSheets(pool);
  return res.json({ sheets });
});

utMarksRouter.get('/me', async (req, res) => {
  const pool = getMySqlPool();
  const [studentRows] = await pool.query<StudentRow[]>(
    `SELECT id, email, full_name
     FROM app_users
     WHERE id = ? AND role = 'student' AND is_active = true
     LIMIT 1`,
    [req.auth!.sub]
  );

  if (studentRows.length === 0) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const [rows] = await pool.query<(RowDataPacket & { subject_code: string; mark: number })[]>(
    `SELECT subject_code, mark
     FROM ut_marks
     WHERE student_id = ?
     ORDER BY subject_code`,
    [req.auth!.sub]
  );

  const marksBySubject: Record<string, number> = Object.fromEntries(subjectCodes.map((subject) => [subject, 0]));
  rows.forEach((row) => {
    marksBySubject[row.subject_code] = Number(row.mark ?? 0);
  });

  return res.json({
    studentId: studentRows[0].id,
    studentName: studentRows[0].full_name,
    studentEmail: studentRows[0].email,
    marksBySubject
  });
});

utMarksRouter.put('/', requireRole('teacher', 'admin'), async (req, res) => {
  const pool = getMySqlPool();
  const parsed = updateMarkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  let studentId = parsed.data.studentId;
  if (!studentId && parsed.data.studentEmail) {
    const [studentRows] = await pool.query<StudentRow[]>(
      `SELECT id, email, full_name
       FROM app_users
       WHERE email = ? AND role = 'student' AND is_active = true
       LIMIT 1`,
      [parsed.data.studentEmail.trim().toLowerCase()]
    );

    if (studentRows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    studentId = studentRows[0].id;
  }

  if (!studentId) {
    return res.status(400).json({ message: 'Unable to resolve student id' });
  }

  await pool.execute(
    `INSERT INTO ut_marks (id, student_id, subject_code, mark)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE mark = VALUES(mark), updated_at = CURRENT_TIMESTAMP`,
    [randomUUID(), studentId, parsed.data.subjectCode, parsed.data.mark]
  );

  const sheets = await getStudentSheets(pool, [studentId]);
  return res.json({ sheet: sheets[0] ?? null });
});

utMarksRouter.get('/export.xlsx', requireRole('teacher', 'admin'), async (_req, res) => {
  const pool = getMySqlPool();
  const sheets = await getStudentSheets(pool);

  const viewerRole = _req.auth!.role;
  const viewerId = _req.auth!.sub;

  const [submissionRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.student_id,
            s.status,
            s.submission_link,
            s.attachment_url,
            s.attachment_name,
            s.title,
            s.created_at
     FROM student_submissions s
     INNER JOIN classes c ON c.id = s.class_id
     WHERE (? = 'admin' OR c.teacher_id = ?)
     ORDER BY s.student_id, s.created_at DESC`,
    [viewerRole, viewerId]
  );

  const latestSubmissionByStudent = new Map<
    string,
    {
      status: string;
      link: string | null;
      title: string | null;
      attachmentName: string | null;
    }
  >();

  for (const row of submissionRows) {
    if (!latestSubmissionByStudent.has(row.student_id as string)) {
      latestSubmissionByStudent.set(row.student_id as string, {
        status: row.status as string,
        link: (row.attachment_url as string | null) ?? (row.submission_link as string | null),
        title: (row.title as string | null) ?? null,
        attachmentName: (row.attachment_name as string | null) ?? null
      });
    }
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('UT Marks');

  const columns = [
    { header: 'Student Name', key: 'studentName', width: 24 },
    { header: 'UT Marks', key: 'utMarks', width: 12 },
    { header: 'Submission Status', key: 'submissionStatus', width: 18 },
    { header: 'Document Link', key: 'documentLink', width: 42 }
  ];

  sheet.columns = columns;

  for (const row of sheets) {
    const utMarks = subjectCodes.reduce((total, subject) => total + Number(row.marksBySubject[subject] ?? 0), 0);
    const latestSubmission = latestSubmissionByStudent.get(row.studentId);

    const submissionStatus = latestSubmission
      ? latestSubmission.status === 'approved'
        ? 'Accepted'
        : latestSubmission.status === 'rejected'
          ? 'Rejected'
          : 'Submitted'
      : 'Not Submitted';

    const addedRow = sheet.addRow({
      studentName: row.studentName,
      utMarks,
      submissionStatus,
      documentLink: latestSubmission?.link
        ? {
            text: latestSubmission.attachmentName ?? latestSubmission.title ?? 'Open document',
            hyperlink: latestSubmission.link.startsWith('http')
              ? latestSubmission.link
              : `${_req.protocol}://${_req.get('host')}${latestSubmission.link}`
          }
        : '-'
    });

    if (latestSubmission?.link) {
      const documentCell = sheet.getCell(addedRow.number, 4);
      documentCell.font = {
        color: { argb: 'FF0563C1' },
        underline: true
      };
    }
  }

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `ut-marks-final-sheet-${new Date().toISOString().slice(0, 10)}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  return res.send(Buffer.from(buffer));
});
