import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { getMySqlPool } from '../src/db/mysqlPool.js';
import { ensureCoreSchema } from '../src/db/ensureCoreSchema.js';
import { ensureMiniProjectSchema } from '../src/db/ensureMiniProjectSchema.js';
import { seedDemoData } from './seed-demo-data.js';

dotenv.config();

async function ensureSubjectCatalog() {
  const pool = getMySqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS subject_catalog (
      code VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      short_label VARCHAR(50) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const subjectRows = [
    ['DBMS', 'Database Management System', 'DBMS'],
    ['OS', 'Operating System', 'OS'],
    ['MDM', 'Multidisciplinary Minor', 'MDM'],
    ['OE', 'Open Elective', 'OE'],
    ['CT', 'Computational Thinking', 'CT']
  ];

  for (const [code, name, shortLabel] of subjectRows) {
    await pool.execute(
      `INSERT INTO subject_catalog (code, name, short_label, is_active)
       VALUES (?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         short_label = VALUES(short_label),
         is_active = TRUE`,
      [code, name, shortLabel]
    );
  }
}

async function upsertUser(email: string, passwordHash: string, fullName: string, role: 'admin' | 'teacher' | 'student') {
  const pool = getMySqlPool();

  await pool.execute(
    `INSERT INTO app_users (id, email, password_hash, full_name, role, is_active)
     VALUES (UUID(), ?, ?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       full_name = VALUES(full_name),
       role = VALUES(role),
       is_active = TRUE`,
    [email, passwordHash, fullName, role]
  );
}

async function ensureTeacherClasses() {
  const pool = getMySqlPool();

  const subjectToTeacherEmail: Record<string, string> = {
    CT: 'mritunjay@gmail.com',
    OS: 'babita@gmail.com',
    MDM: 'mamta@gmail.com',
    DBMS: 'vandana@gmail.com',
    OE: 'teacher_oe@gmail.com'
  };

  const subjectToColor: Record<string, string> = {
    CT: 'blue',
    OS: 'green',
    MDM: 'orange',
    DBMS: 'red',
    OE: 'purple'
  };

  for (const [subject, teacherEmail] of Object.entries(subjectToTeacherEmail)) {
    const [teacherRows] = await pool.query<any[]>(
      `SELECT id FROM app_users WHERE email = ? LIMIT 1`,
      [teacherEmail]
    );

    if (!teacherRows.length) {
      throw new Error(`Teacher not found for ${subject}: ${teacherEmail}`);
    }

    const teacherId = teacherRows[0].id as string;
    const className = `${subject} - A`;

    const [existingClassRows] = await pool.query<any[]>(
      `SELECT id FROM classes WHERE name = ? AND teacher_id = ? LIMIT 1`,
      [className, teacherId]
    );

    if (!existingClassRows.length) {
      await pool.execute(
        `INSERT INTO classes (id, name, subject, grade_level, section, color, teacher_id)
         VALUES (UUID(), ?, ?, 'Third Year', 'A', ?, ?)`,
        [className, subject, subjectToColor[subject], teacherId]
      );
    }
  }
}

async function ensureStudentEnrollments() {
  const pool = getMySqlPool();

  const studentEmails = [
    'amruta@gmail.com',
    'rimzim@gmail.com',
    'bhavesh@gmail.com',
    'princess@gmail.com'
  ];

  const [students] = await pool.query<any[]>(
    `SELECT id FROM app_users WHERE email IN (?, ?, ?, ?)`,
    studentEmails
  );

  const [classes] = await pool.query<any[]>(
    `SELECT id FROM classes WHERE subject IN ('DBMS', 'OS', 'MDM', 'OE', 'CT')`
  );

  for (const c of classes) {
    for (const s of students) {
      await pool.execute(
        `INSERT INTO enrollments (id, class_id, student_id, status)
         VALUES (?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE status = 'active'`,
        [randomUUID(), c.id, s.id]
      );
    }
  }
}

async function main() {
  if (!process.env.MYSQL_HOST || !process.env.MYSQL_USER || !process.env.MYSQL_DATABASE) {
    throw new Error('Missing MYSQL_HOST, MYSQL_USER, or MYSQL_DATABASE in environment.');
  }

  console.log('Bootstrapping MySQL from database folder schema/seed definitions...');

  await ensureCoreSchema();
  await ensureMiniProjectSchema();
  await seedDemoData();

  console.log('MySQL bootstrap completed successfully.');
}

main().catch((error) => {
  console.error('MySQL bootstrap failed:', error);
  process.exit(1);
});
