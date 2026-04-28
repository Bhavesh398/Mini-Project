import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { Router } from 'express';
import ExcelJS from 'exceljs';
import multer from 'multer';
import { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { getMySqlPool } from '../db/mysqlPool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const submissionsRouter = Router();

type StudentSubmissionRow = RowDataPacket & {
  id: string;
  class_id: string;
  class_name: string;
  subject: string;
  student_id: string;
  student_name: string;
  title: string;
  description: string | null;
  submission_link: string | null;
  attachment_name: string | null;
  attachment_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  marks: number | null;
  feedback: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

type StudentClassRow = RowDataPacket & {
  id: string;
  name: string;
  subject: string;
};

const createSubmissionSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().max(2000).optional(),
  submissionLink: z.string().url().optional(),
  attachmentName: z.string().max(255).optional()
});

const updateSubmissionStatusSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  feedback: z.string().max(3000).optional(),
  marks: z.number().min(0).max(100).optional()
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 15 * 1024 * 1024
  }
});

const isVercel = !!process.env.VERCEL;
const uploadsRoot = isVercel ? path.join('/tmp', 'uploads') : path.resolve(process.cwd(), 'uploads');
const submissionUploadsDir = path.join(uploadsRoot, 'submissions');

async function ensureUploadDirectory() {
  await fs.mkdir(submissionUploadsDir, { recursive: true });
}

function normalizeFormValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function buildAttachmentUrl(fileName: string): string {
  return `/uploads/submissions/${encodeURIComponent(fileName)}`;
}

function safeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function styleHeaderRow(worksheet: ExcelJS.Worksheet, rowNumber: number) {
  const row = worksheet.getRow(rowNumber);

  row.eachCell((cell) => {
    cell.font = {
      color: { argb: 'FFFFFFFF' },
      bold: true
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' }
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
    };
  });

  row.height = 24;
}

function formatStatus(status: 'pending' | 'approved' | 'rejected'): 'Pending' | 'Approved' | 'Rejected' {
  if (status === 'approved') return 'Approved';
  if (status === 'rejected') return 'Rejected';
  return 'Pending';
}

function applyStatusCellFill(cell: ExcelJS.Cell, status: 'pending' | 'approved' | 'rejected') {
  const colorByStatus = {
    approved: 'FFC6EFCE',
    pending: 'FFFFEB9C',
    rejected: 'FFFFC7CE'
  } as const;

  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: colorByStatus[status] }
  };
}

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/*?:\[\]]/g, ' ').trim();
  if (!cleaned) return 'Subject';
  return cleaned.slice(0, 31);
}

submissionsRouter.use(requireAuth);

submissionsRouter.get('/student', requireRole('student'), async (req, res) => {
  const pool = getMySqlPool();
  const studentId = req.auth!.sub;

  const [classes] = await pool.query<StudentClassRow[]>(
    `SELECT c.id, c.name, c.subject
     FROM classes c
     INNER JOIN enrollments e ON e.class_id = c.id
     WHERE e.student_id = ? AND e.status = 'active'
     ORDER BY c.subject, c.name`,
    [studentId]
  );

  const [submissions] = await pool.query<StudentSubmissionRow[]>(
    `SELECT s.id,
            s.class_id,
            c.name AS class_name,
            c.subject,
            s.student_id,
            u.full_name AS student_name,
            s.title,
            s.description,
            s.submission_link,
            s.attachment_name,
            s.attachment_url,
            s.status,
            s.marks,
            s.feedback,
            s.reviewed_by,
            s.reviewed_at,
            s.created_at,
            s.updated_at
     FROM student_submissions s
     INNER JOIN classes c ON c.id = s.class_id
     INNER JOIN app_users u ON u.id = s.student_id
     WHERE s.student_id = ?
     ORDER BY s.created_at DESC`,
    [studentId]
  );

  const total = submissions.length;
  const approved = submissions.filter((row) => row.status === 'approved').length;
  const rejected = submissions.filter((row) => row.status === 'rejected').length;
  const pending = submissions.filter((row) => row.status === 'pending').length;

  const bySubjectMap = new Map<string, { submitted: number; approved: number; rejected: number; pending: number }>();

  for (const submission of submissions) {
    const key = submission.subject;
    const current = bySubjectMap.get(key) ?? { submitted: 0, approved: 0, rejected: 0, pending: 0 };
    current.submitted += 1;
    current[submission.status] += 1;
    bySubjectMap.set(key, current);
  }

  const bySubject = Array.from(bySubjectMap.entries()).map(([subject, stats]) => ({
    subject,
    ...stats
  }));

  return res.json({
    classes,
    submissions,
    stats: {
      total,
      approved,
      rejected,
      pending,
      approvalRate: total ? Number(((approved / total) * 100).toFixed(1)) : 0,
      submissionRate: classes.length ? Number(((total / classes.length) * 100).toFixed(1)) : 0
    },
    bySubject,
    actionNeeded: rejected
  });
});

submissionsRouter.post('/student', requireRole('student'), upload.single('attachment'), async (req, res) => {
  const parsed = createSubmissionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const pool = getMySqlPool();
  const studentId = req.auth!.sub;
  const payload = parsed.data;

  const [enrollmentRows] = await pool.query<RowDataPacket[]>(
    `SELECT e.id
     FROM enrollments e
     WHERE e.class_id = ? AND e.student_id = ? AND e.status = 'active'
     LIMIT 1`,
    [payload.classId, studentId]
  );

  if (!enrollmentRows.length) {
    return res.status(403).json({ message: 'You are not enrolled in this class' });
  }

  const submissionId = randomUUID();
  await ensureUploadDirectory();

  let attachmentName = normalizeFormValue(payload.attachmentName);
  let attachmentUrl: string | null = null;

  if (req.file) {
    const originalName = req.file.originalname || 'attachment';
    attachmentName = originalName;
    const storedName = `${submissionId}-${safeFileName(originalName)}`;
    const storedPath = path.join(submissionUploadsDir, storedName);
    await fs.writeFile(storedPath, req.file.buffer);
    attachmentUrl = buildAttachmentUrl(storedName);
  }

  await pool.execute(
    `INSERT INTO student_submissions
      (id, class_id, student_id, title, description, submission_link, attachment_name, attachment_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      submissionId,
      payload.classId,
      studentId,
      payload.title,
      normalizeFormValue(payload.description) ?? null,
      normalizeFormValue(payload.submissionLink) ?? null,
      attachmentName ?? null,
      attachmentUrl
    ]
  );

  const [rows] = await pool.query<StudentSubmissionRow[]>(
    `SELECT s.id,
            s.class_id,
            c.name AS class_name,
            c.subject,
            s.student_id,
            u.full_name AS student_name,
            s.title,
            s.description,
            s.submission_link,
            s.attachment_name,
            s.attachment_url,
            s.status,
            s.marks,
            s.feedback,
            s.reviewed_by,
            s.reviewed_at,
            s.created_at,
            s.updated_at
     FROM student_submissions s
     INNER JOIN classes c ON c.id = s.class_id
     INNER JOIN app_users u ON u.id = s.student_id
     WHERE s.id = ?
     LIMIT 1`,
    [submissionId]
  );

  return res.status(201).json(rows[0]);
});

submissionsRouter.get('/teacher', requireRole('teacher', 'admin'), async (req, res) => {
  const pool = getMySqlPool();
  const viewerRole = req.auth!.role;
  const viewerId = req.auth!.sub;

  const [submissions] = await pool.query<StudentSubmissionRow[]>(
    `SELECT s.id,
            s.class_id,
            c.name AS class_name,
            c.subject,
            s.student_id,
            u.full_name AS student_name,
            s.title,
            s.description,
            s.submission_link,
            s.attachment_name,
            s.attachment_url,
            s.status,
            s.marks,
            s.feedback,
            s.reviewed_by,
            s.reviewed_at,
            s.created_at,
            s.updated_at
     FROM student_submissions s
     INNER JOIN classes c ON c.id = s.class_id
     INNER JOIN app_users u ON u.id = s.student_id
     WHERE (? = 'admin' OR c.teacher_id = ?)
     ORDER BY CASE s.status WHEN 'pending' THEN 0 WHEN 'rejected' THEN 1 ELSE 2 END, s.created_at DESC`,
    [viewerRole, viewerId]
  );

  const stats = {
    total: submissions.length,
    pending: submissions.filter((row) => row.status === 'pending').length,
    approved: submissions.filter((row) => row.status === 'approved').length,
    rejected: submissions.filter((row) => row.status === 'rejected').length
  };

  return res.json({ submissions, stats });
});

submissionsRouter.patch('/:submissionId/status', requireRole('teacher', 'admin'), async (req, res) => {
  const parsed = updateSubmissionStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const pool = getMySqlPool();
  const { submissionId } = req.params;
  const payload = parsed.data;

  const [existingRows] = await pool.query<RowDataPacket[]>(
    `SELECT s.id, c.teacher_id
     FROM student_submissions s
     INNER JOIN classes c ON c.id = s.class_id
     WHERE s.id = ?
     LIMIT 1`,
    [submissionId]
  );

  if (!existingRows.length) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  const ownerTeacherId = String(existingRows[0].teacher_id);
  if (req.auth!.role === 'teacher' && ownerTeacherId !== req.auth!.sub) {
    return res.status(403).json({ message: 'You can only review submissions for your classes' });
  }

  await pool.execute(
    `UPDATE student_submissions
     SET status = ?,
         feedback = ?,
         marks = ?,
         reviewed_by = ?,
         reviewed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [
      payload.status,
      payload.feedback ?? null,
      payload.marks ?? null,
      req.auth!.sub,
      submissionId
    ]
  );

  const [updatedRows] = await pool.query<StudentSubmissionRow[]>(
    `SELECT s.id,
            s.class_id,
            c.name AS class_name,
            c.subject,
            s.student_id,
            u.full_name AS student_name,
            s.title,
            s.description,
            s.submission_link,
            s.attachment_name,
            s.attachment_url,
            s.status,
            s.marks,
            s.feedback,
            s.reviewed_by,
            s.reviewed_at,
            s.created_at,
            s.updated_at
     FROM student_submissions s
     INNER JOIN classes c ON c.id = s.class_id
     INNER JOIN app_users u ON u.id = s.student_id
     WHERE s.id = ?
     LIMIT 1`,
    [submissionId]
  );

  return res.json(updatedRows[0]);
});

submissionsRouter.get('/export', requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const pool = getMySqlPool();

    const [rows] = await pool.query<StudentSubmissionRow[]>(
      `SELECT s.id,
              s.class_id,
              c.name AS class_name,
              c.subject,
              s.student_id,
              u.full_name AS student_name,
              s.title,
              s.description,
              s.submission_link,
              s.attachment_name,
              s.attachment_url,
              s.status,
              s.marks,
              s.feedback,
              s.reviewed_by,
              s.reviewed_at,
              s.created_at,
              s.updated_at
       FROM student_submissions s
       INNER JOIN classes c ON c.id = s.class_id
       INNER JOIN app_users u ON u.id = s.student_id
       WHERE (? = 'admin' OR c.teacher_id = ?)
       ORDER BY c.subject, s.created_at DESC`,
      [req.auth!.role, req.auth!.sub]
    );

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AMPLIFY';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Subject', key: 'subject', width: 28 },
      { header: 'Total Submissions', key: 'total', width: 18 },
      { header: 'Approved', key: 'approved', width: 14 },
      { header: 'Pending', key: 'pending', width: 14 },
      { header: 'Rejected', key: 'rejected', width: 14 },
      { header: 'Average Marks', key: 'average', width: 16 }
    ];

    styleHeaderRow(summarySheet, 1);
    summarySheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: summarySheet.columnCount }
    };

    const subjectsMap = new Map<string, StudentSubmissionRow[]>();
    for (const row of rows) {
      const current = subjectsMap.get(row.subject) ?? [];
      current.push(row);
      subjectsMap.set(row.subject, current);
    }

    for (const [subject, submissions] of subjectsMap.entries()) {
      const approved = submissions.filter((item) => item.status === 'approved').length;
      const pending = submissions.filter((item) => item.status === 'pending').length;
      const rejected = submissions.filter((item) => item.status === 'rejected').length;
      const marks = submissions.filter((item) => typeof item.marks === 'number').map((item) => Number(item.marks));
      const average = marks.length ? Number((marks.reduce((acc, n) => acc + n, 0) / marks.length).toFixed(2)) : 0;

      summarySheet.addRow({
        subject,
        total: submissions.length,
        approved,
        pending,
        rejected,
        average
      });

      const subjectSheet = workbook.addWorksheet(sanitizeSheetName(subject));
      subjectSheet.columns = [
        { header: 'Submission ID', key: 'submission_id', width: 38 },
        { header: 'Class', key: 'class_name', width: 20 },
        { header: 'Student', key: 'student_name', width: 24 },
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Submitted At', key: 'submitted_at', width: 22 },
        { header: 'Status', key: 'status', width: 14 },
        { header: 'Marks', key: 'marks', width: 12 },
        { header: 'Feedback', key: 'feedback', width: 36 },
        { header: 'Submission Link', key: 'submission_link', width: 40 },
        { header: 'Attachment File', key: 'attachment_file', width: 36 }
      ];

      styleHeaderRow(subjectSheet, 1);
      subjectSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: subjectSheet.columnCount }
      };

      for (const submission of submissions) {
        const addedRow = subjectSheet.addRow({
          submission_id: submission.id,
          class_name: submission.class_name,
          student_name: submission.student_name,
          title: submission.title,
          submitted_at: submission.created_at,
          status: formatStatus(submission.status),
          marks: submission.marks,
          feedback: submission.feedback,
          submission_link: submission.submission_link,
          attachment_file: submission.attachment_name
        });

        const statusCell = subjectSheet.getCell(addedRow.number, 6);
        applyStatusCellFill(statusCell, submission.status);

        if (submission.attachment_url && submission.attachment_name) {
          const attachmentCell = subjectSheet.getCell(addedRow.number, 10);
          attachmentCell.value = {
            text: submission.attachment_name,
            hyperlink: submission.attachment_url.startsWith('http')
              ? submission.attachment_url
              : `${req.protocol}://${req.get('host')}${submission.attachment_url}`
          };
          attachmentCell.font = {
            color: { argb: 'FF0563C1' },
            underline: true
          };
        }
      }
    }

    const fileBuffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="amplify-submissions-by-subject.xlsx"');
    return res.send(Buffer.from(fileBuffer));
  } catch (error) {
    console.error('Failed to export submissions by subject', error);
    return res.status(500).json({ message: 'Failed to export submissions by subject' });
  }
});

submissionsRouter.get('/export/submission-status', requireRole('admin', 'teacher'), async (req, res) => {
  try {
    const pool = getMySqlPool();
    const viewerRole = req.auth!.role;
    const viewerId = req.auth!.sub;

    const [classes] = await pool.query<any[]>(
      `SELECT c.id, c.name, c.subject, u.full_name AS teacher_name
       FROM classes c
       INNER JOIN app_users u ON u.id = c.teacher_id
       WHERE (? = 'admin' OR c.teacher_id = ?)
       ORDER BY c.subject, c.name`,
      [viewerRole, viewerId]
    );

    const [enrollments] = await pool.query<any[]>(
      `SELECT e.class_id, e.student_id, u.full_name, u.email, c.subject
       FROM enrollments e
       INNER JOIN app_users u ON u.id = e.student_id
       INNER JOIN classes c ON c.id = e.class_id
       WHERE e.status = 'active' AND (? = 'admin' OR c.teacher_id = ?)
       ORDER BY c.subject, c.name, u.full_name`,
      [viewerRole, viewerId]
    );

    const [submissions] = await pool.query<any[]>(
      `SELECT s.student_id, s.class_id, s.status, s.marks, s.feedback, s.title, s.created_at, s.attachment_name, s.attachment_url
       FROM student_submissions s
       INNER JOIN classes c ON c.id = s.class_id
       WHERE (? = 'admin' OR c.teacher_id = ?)`,
      [viewerRole, viewerId]
    );

    const submissionMap = new Map<string, any>();
    for (const sub of submissions) {
      submissionMap.set(`${sub.student_id}-${sub.class_id}`, sub);
    }

    const [utMarks] = await pool.query<any[]>(
      `SELECT ut.student_id, ut.subject, ut.marks
       FROM ut_marks ut
       WHERE (? = 'admin' OR ut.student_id IN (
         SELECT DISTINCT e.student_id FROM enrollments e
         INNER JOIN classes c ON c.id = e.class_id
         WHERE c.teacher_id = ?
       ))`,
      [viewerRole === 'admin' ? 1 : 0, viewerId]
    );

    const utMarksMap = new Map<string, any>();
    for (const mark of utMarks) {
      utMarksMap.set(`${mark.student_id}-${mark.subject}`, mark);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AMPLIFY';
    workbook.created = new Date();

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.columns = [
      { header: 'Subject', key: 'subject', width: 18 },
      { header: 'Class', key: 'class', width: 24 },
      { header: 'Total Students', key: 'total_students', width: 16 },
      { header: 'Submitted', key: 'submitted', width: 14 },
      { header: 'Not Submitted', key: 'not_submitted', width: 16 },
      { header: 'Approved', key: 'approved', width: 14 },
      { header: 'Rejected', key: 'rejected', width: 14 },
      { header: 'Submission Rate %', key: 'submission_rate', width: 18 },
      { header: 'Approval Rate %', key: 'approval_rate', width: 18 }
    ];
    styleHeaderRow(summarySheet, 1);

    const classStudentMap = new Map<string, any[]>();
    for (const enrollment of enrollments) {
      const current = classStudentMap.get(enrollment.class_id) ?? [];
      current.push(enrollment);
      classStudentMap.set(enrollment.class_id, current);
    }

    const subjectDataMap = new Map<string, any[]>();

    for (const classInfo of classes) {
      const classStudents = classStudentMap.get(classInfo.id) ?? [];
      const current = subjectDataMap.get(classInfo.subject) ?? [];
      current.push({ ...classInfo, students: classStudents });
      subjectDataMap.set(classInfo.subject, current);

      let submitted = 0;
      let notSubmitted = 0;
      let approved = 0;
      let rejected = 0;

      for (const student of classStudents) {
        const submission = submissionMap.get(`${student.student_id}-${classInfo.id}`);

        if (submission) {
          submitted += 1;
          if (submission.status === 'approved') approved += 1;
          if (submission.status === 'rejected') rejected += 1;
        } else {
          notSubmitted += 1;
        }
      }

      const total = classStudents.length;
      const submissionRate = total > 0 ? Number(((submitted / total) * 100).toFixed(1)) : 0;
      const approvalRate = submitted > 0 ? Number(((approved / submitted) * 100).toFixed(1)) : 0;

      summarySheet.addRow({
        subject: classInfo.subject,
        class: classInfo.name,
        total_students: total,
        submitted,
        not_submitted: notSubmitted,
        approved,
        rejected,
        submission_rate: submissionRate,
        approval_rate: approvalRate
      });
    }

    for (const [subject, classDataList] of subjectDataMap.entries()) {
      const subjectSheet = workbook.addWorksheet(sanitizeSheetName(subject));
      subjectSheet.columns = [
        { header: 'Class', key: 'class_name', width: 20 },
        { header: 'Student Name', key: 'student_name', width: 28 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Submission Status', key: 'submission_status', width: 18 },
        { header: 'Submission Title', key: 'submission_title', width: 30 },
        { header: 'Submitted Date', key: 'submitted_date', width: 18 },
        { header: 'Marks', key: 'marks', width: 12 },
        { header: 'Feedback', key: 'feedback', width: 40 },
        { header: 'UT Marks', key: 'ut_marks', width: 12 },
        { header: 'Attachment', key: 'attachment', width: 34 }
      ];
      styleHeaderRow(subjectSheet, 1);
      subjectSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: subjectSheet.columnCount }
      };

      for (const classData of classDataList) {
        for (const student of classData.students) {
          const submission = submissionMap.get(`${student.student_id}-${classData.id}`);
          const utMark = utMarksMap.get(`${student.student_id}-${subject}`);

          const statusDisplay = submission
            ? submission.status === 'approved'
              ? 'Approved'
              : submission.status === 'rejected'
                ? 'Rejected'
                : 'Submitted (Pending)'
            : 'Not Submitted';

          const addedRow = subjectSheet.addRow({
            class_name: classData.name,
            student_name: student.full_name,
            email: student.email,
            submission_status: statusDisplay,
            submission_title: submission?.title ?? '-',
            submitted_date: submission?.created_at ? new Date(submission.created_at).toLocaleDateString() : '-',
            marks: submission?.marks ?? '-',
            feedback: submission?.feedback ?? '-',
            ut_marks: utMark?.marks ?? '-',
            attachment: submission?.attachment_name ?? '-'
          });

          const statusCell = subjectSheet.getCell(addedRow.number, 4);
          if (submission) {
            applyStatusCellFill(statusCell, submission.status);
          } else {
            statusCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFCCCCCC' }
            };
          }

          if (submission?.attachment_url && submission.attachment_name) {
            const attachmentCell = subjectSheet.getCell(addedRow.number, 10);
            attachmentCell.value = {
              text: submission.attachment_name,
              hyperlink: submission.attachment_url.startsWith('http')
                ? submission.attachment_url
                : `${req.protocol}://${req.get('host')}${submission.attachment_url}`
            };
            attachmentCell.font = {
              color: { argb: 'FF0563C1' },
              underline: true
            };
          }
        }
      }
    }

    const fileBuffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="submission-status-report.xlsx"');
    return res.send(Buffer.from(fileBuffer));
  } catch (error) {
    console.error('Failed to export submission status report', error);
    return res.status(500).json({ message: 'Failed to export submission status report' });
  }
});
