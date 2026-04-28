import { getMySqlPool } from './mysqlPool.js';

export async function ensureMiniProjectSchema() {
  const pool = getMySqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS mini_projects (
      id VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      team_name VARCHAR(255) NOT NULL,
      progress INT NOT NULL DEFAULT 0,
      next_milestone TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'on-track',
      summary TEXT NOT NULL,
      branch VARCHAR(255) NOT NULL,
      repo_name VARCHAR(255) NOT NULL,
      repo_status VARCHAR(20) NOT NULL DEFAULT 'synced',
      goals JSON NOT NULL,
      available_files JSON NOT NULL,
      created_by VARCHAR(36) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_mini_projects_status (status),
      KEY idx_mini_projects_updated_at (updated_at),
      CONSTRAINT fk_mini_projects_creator
        FOREIGN KEY (created_by) REFERENCES app_users(id)
        ON DELETE SET NULL,
      CONSTRAINT chk_mini_projects_progress
        CHECK (progress BETWEEN 0 AND 100)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS mini_project_members (
      project_id VARCHAR(100) NOT NULL,
      id VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100) NOT NULL,
      current_focus TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (project_id, id),
      CONSTRAINT fk_mini_project_members_project
        FOREIGN KEY (project_id) REFERENCES mini_projects(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS mini_project_tasks (
      project_id VARCHAR(100) NOT NULL,
      id VARCHAR(100) NOT NULL,
      title TEXT NOT NULL,
      owner_id VARCHAR(100) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'todo',
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (project_id, id),
      KEY idx_mini_project_tasks_owner (project_id, owner_id),
      CONSTRAINT fk_mini_project_tasks_project
        FOREIGN KEY (project_id) REFERENCES mini_projects(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS mini_project_activity (
      project_id VARCHAR(100) NOT NULL,
      id VARCHAR(150) NOT NULL,
      type VARCHAR(20) NOT NULL,
      student_id VARCHAR(100) NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      branch VARCHAR(255) NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      files JSON NOT NULL,
      timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      lines_added INT NOT NULL DEFAULT 0,
      lines_removed INT NOT NULL DEFAULT 0,
      PRIMARY KEY (project_id, id),
      KEY idx_mini_activity_project_time (project_id, timestamp),
      CONSTRAINT fk_mini_project_activity_project
        FOREIGN KEY (project_id) REFERENCES mini_projects(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS mini_project_groups (
      id VARCHAR(36) NOT NULL,
      project_id VARCHAR(100) NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_mini_project_groups_project (project_id),
      CONSTRAINT fk_mini_project_groups_project
        FOREIGN KEY (project_id) REFERENCES mini_projects(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS mini_project_group_members (
      project_id VARCHAR(100) NOT NULL,
      group_id VARCHAR(36) NOT NULL,
      member_id VARCHAR(100) NOT NULL,
      PRIMARY KEY (project_id, group_id, member_id),
      CONSTRAINT fk_mini_project_group_members_group
        FOREIGN KEY (group_id) REFERENCES mini_project_groups(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_mini_project_group_members_member
        FOREIGN KEY (project_id, member_id) REFERENCES mini_project_members(project_id, id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}
