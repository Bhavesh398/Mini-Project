import { getMySqlPool } from './mysqlPool.js';

export async function ensureCoreSchema() {
  const pool = getMySqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS app_users (
      id VARCHAR(36) NOT NULL,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      avatar_url TEXT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_app_users_email (email),
      KEY idx_app_users_role_active (role, is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS student_submissions (
      id VARCHAR(36) NOT NULL,
      class_id VARCHAR(36) NOT NULL,
      student_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      submission_link TEXT NULL,
      attachment_name VARCHAR(255) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      marks DECIMAL(5,2) NULL,
      feedback TEXT NULL,
      reviewed_by VARCHAR(36) NULL,
      reviewed_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_student_submissions_class_id (class_id),
      KEY idx_student_submissions_student_id (student_id),
      KEY idx_student_submissions_status (status),
      KEY idx_student_submissions_created_at (created_at),
      CONSTRAINT fk_student_submissions_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_student_submissions_student
        FOREIGN KEY (student_id) REFERENCES app_users(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_student_submissions_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES app_users(id)
        ON DELETE SET NULL,
      CONSTRAINT chk_student_submissions_status
        CHECK (status IN ('pending', 'approved', 'rejected'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const [attachmentUrlColumn] = await pool.query<any[]>(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'student_submissions'
       AND COLUMN_NAME = 'attachment_url'
     LIMIT 1`
  );

  if (!attachmentUrlColumn.length) {
    await pool.execute(`
      ALTER TABLE student_submissions
      ADD COLUMN attachment_url TEXT NULL AFTER attachment_name
    `);
  }

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id VARCHAR(36) NOT NULL,
      user_id VARCHAR(36) NOT NULL,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_refresh_tokens_token (token(191)),
      KEY idx_refresh_tokens_user_id (user_id),
      CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id) REFERENCES app_users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS classes (
      id VARCHAR(36) NOT NULL,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      grade_level VARCHAR(255) NOT NULL,
      section VARCHAR(50) NULL,
      color VARCHAR(50) NOT NULL DEFAULT 'blue',
      teacher_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_classes_teacher_id (teacher_id),
      CONSTRAINT fk_classes_teacher
        FOREIGN KEY (teacher_id) REFERENCES app_users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id VARCHAR(36) NOT NULL,
      class_id VARCHAR(36) NOT NULL,
      student_id VARCHAR(36) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_enrollments_class_student (class_id, student_id),
      KEY idx_enrollments_student_id (student_id),
      CONSTRAINT fk_enrollments_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id) REFERENCES app_users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS engagement_records (
      id VARCHAR(36) NOT NULL,
      class_id VARCHAR(36) NOT NULL,
      student_id VARCHAR(36) NOT NULL,
      session_date DATE NOT NULL,
      engagement_level VARCHAR(20) NOT NULL,
      engagement_score INT NOT NULL,
      duration_minutes INT NULL,
      notes TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_engagement_class_date (class_id, session_date),
      KEY idx_engagement_student_date (student_id, session_date),
      CONSTRAINT fk_engagement_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_engagement_student
        FOREIGN KEY (student_id) REFERENCES app_users(id)
        ON DELETE CASCADE,
      CONSTRAINT chk_engagement_score
        CHECK (engagement_score BETWEEN 0 AND 100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS ut_marks (
      id VARCHAR(36) NOT NULL,
      student_id VARCHAR(36) NOT NULL,
      subject_code VARCHAR(20) NOT NULL,
      mark DECIMAL(5,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_ut_marks_student_subject (student_id, subject_code),
      KEY idx_ut_marks_student_id (student_id),
      KEY idx_ut_marks_subject_code (subject_code),
      CONSTRAINT fk_ut_marks_student
        FOREIGN KEY (student_id) REFERENCES app_users(id)
        ON DELETE CASCADE,
      CONSTRAINT chk_ut_marks_mark
        CHECK (mark BETWEEN 0 AND 20)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) NOT NULL,
      class_id VARCHAR(36) NOT NULL,
      teacher_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NULL,
      due_date TIMESTAMP NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_tasks_class_id (class_id),
      KEY idx_tasks_teacher_id (teacher_id),
      KEY idx_tasks_status (status),
      KEY idx_tasks_created_at (created_at),
      CONSTRAINT fk_tasks_class
        FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_tasks_teacher
        FOREIGN KEY (teacher_id) REFERENCES app_users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS task_submissions (
      id VARCHAR(36) NOT NULL,
      task_id VARCHAR(36) NOT NULL,
      student_id VARCHAR(36) NOT NULL,
      submission_text TEXT NULL,
      submission_link VARCHAR(500) NULL,
      attachment_name VARCHAR(255) NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      marks DECIMAL(5,2) NULL,
      feedback TEXT NULL,
      reviewed_by VARCHAR(36) NULL,
      reviewed_at TIMESTAMP NULL,
      submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_task_submissions (task_id, student_id),
      KEY idx_task_submissions_student_id (student_id),
      KEY idx_task_submissions_status (status),
      KEY idx_task_submissions_submitted_at (submitted_at),
      CONSTRAINT fk_task_submissions_task
        FOREIGN KEY (task_id) REFERENCES tasks(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_task_submissions_student
        FOREIGN KEY (student_id) REFERENCES app_users(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_task_submissions_reviewer
        FOREIGN KEY (reviewed_by) REFERENCES app_users(id)
        ON DELETE SET NULL,
      CONSTRAINT chk_task_submissions_status
        CHECK (status IN ('pending', 'submitted', 'approved', 'rejected'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}
