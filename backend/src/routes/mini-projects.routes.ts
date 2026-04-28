import { randomUUID } from 'crypto';
import { Router } from 'express';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { z } from 'zod';
import { getMySqlPool } from '../db/mysqlPool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const miniProjectsRouter = Router();

const createProjectSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(3),
  subject: z.string().min(2),
  teamName: z.string().min(2),
  nextMilestone: z.string().min(3),
  summary: z.string().min(5),
  branch: z.string().min(2),
  repoName: z.string().min(2),
  goals: z.array(z.string()).default([]),
  availableFiles: z.array(z.string()).default([]),
  members: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    role: z.string().min(1),
    currentFocus: z.string().min(1)
  })).default([]),
  tasks: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    ownerId: z.string().min(1),
    status: z.enum(['todo', 'in-progress', 'done'])
  })).default([])
});

const addActivitySchema = z.object({
  type: z.enum(['commit', 'push', 'pull']),
  studentName: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  files: z.array(z.string()).default([]),
  branch: z.string().min(1),
  linesAdded: z.number().int().min(0).optional(),
  linesRemoved: z.number().int().min(0).optional()
});

const autoGroupSchema = z.object({
  groupSize: z.number().int().min(2).max(10).default(3)
});

type ProjectRow = RowDataPacket & {
  id: string;
  name: string;
  subject: string;
  team_name: string;
  progress: number;
  next_milestone: string;
  status: string;
  summary: string;
  branch: string;
  repo_name: string;
  repo_status: string;
  goals: string | string[];
  available_files: string | string[];
};

type MemberRow = RowDataPacket & {
  id: string;
  name: string;
  role: string;
  current_focus: string;
};

type TaskRow = RowDataPacket & {
  id: string;
  title: string;
  owner_id: string;
  status: string;
  updated_at: string;
};

type ActivityRow = RowDataPacket & {
  id: string;
  type: string;
  student_id: string;
  student_name: string;
  branch: string;
  title: string;
  description: string;
  files: string | string[];
  timestamp: string;
  lines_added: number;
  lines_removed: number;
};

type GroupRow = RowDataPacket & {
  id: string;
  name: string;
  member_ids: string | null;
};

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item));
      }
    } catch {
      return [];
    }
  }

  return [];
}

function createStudentId(studentName: string): string {
  return studentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function getMiniProject(projectId: string) {
  const pool = getMySqlPool();
  const [projectRows] = await pool.query<ProjectRow[]>(
    'SELECT * FROM mini_projects WHERE id = ? LIMIT 1',
    [projectId]
  );

  if (!projectRows.length) return null;

  const [members, tasks, activity, groups] = await Promise.all([
    pool.query<MemberRow[]>(
      'SELECT id, name, role, current_focus FROM mini_project_members WHERE project_id = ? ORDER BY name',
      [projectId]
    ),
    pool.query<TaskRow[]>(
      'SELECT id, title, owner_id, status, updated_at FROM mini_project_tasks WHERE project_id = ? ORDER BY updated_at DESC',
      [projectId]
    ),
    pool.query<ActivityRow[]>(
      'SELECT id, type, student_id, student_name, branch, title, description, files, timestamp, lines_added, lines_removed FROM mini_project_activity WHERE project_id = ? ORDER BY timestamp DESC',
      [projectId]
    ),
    pool.query<GroupRow[]>(
      `SELECT g.id, g.name,
              GROUP_CONCAT(gm.member_id ORDER BY gm.member_id SEPARATOR ',') AS member_ids
       FROM mini_project_groups g
       LEFT JOIN mini_project_group_members gm ON gm.group_id = g.id AND gm.project_id = g.project_id
       WHERE g.project_id = ?
       GROUP BY g.id, g.name
       ORDER BY g.created_at`,
      [projectId]
    )
  ]);

  const p = projectRows[0];

  return {
    id: p.id,
    name: p.name,
    subject: p.subject,
    teamName: p.team_name,
    progress: Number(p.progress ?? 0),
    nextMilestone: p.next_milestone,
    status: p.status,
    summary: p.summary,
    branch: p.branch,
    repoName: p.repo_name,
    repoStatus: p.repo_status,
    goals: parseJsonArray(p.goals),
    availableFiles: parseJsonArray(p.available_files),
    members: members[0].map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      currentFocus: row.current_focus
    })),
    tasks: tasks[0].map((row) => ({
      id: row.id,
      title: row.title,
      ownerId: row.owner_id,
      status: row.status,
      updatedAt: row.updated_at
    })),
    activity: activity[0].map((row) => ({
      id: row.id,
      type: row.type,
      studentId: row.student_id,
      studentName: row.student_name,
      branch: row.branch,
      title: row.title,
      description: row.description,
      files: parseJsonArray(row.files),
      timestamp: row.timestamp,
      linesAdded: row.lines_added,
      linesRemoved: row.lines_removed
    })),
    groups: groups[0].map((row) => ({
      id: row.id,
      name: row.name,
      memberIds: row.member_ids ? row.member_ids.split(',').filter(Boolean) : []
    }))
  };
}

miniProjectsRouter.use(requireAuth);

miniProjectsRouter.get('/', async (_req, res) => {
  const pool = getMySqlPool();
  const [result] = await pool.query<RowDataPacket[]>('SELECT id FROM mini_projects ORDER BY updated_at DESC');

  const projects = await Promise.all(result.map((row) => getMiniProject(String(row.id))));
  return res.json(projects.filter(Boolean));
});

miniProjectsRouter.get('/:projectId', async (req, res) => {
  const data = await getMiniProject(req.params.projectId);
  if (!data) {
    return res.status(404).json({ message: 'Mini project not found' });
  }

  return res.json(data);
});

miniProjectsRouter.post('/', requireRole('admin', 'teacher', 'student'), async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const payload = parsed.data;
  const pool = getMySqlPool();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.execute(
      `INSERT INTO mini_projects
      (id, name, subject, team_name, progress, next_milestone, status, summary, branch, repo_name, repo_status, goals, available_files, created_by)
      VALUES (?, ?, ?, ?, 0, ?, 'on-track', ?, ?, ?, 'synced', ?, ?, ?)`,
      [
        payload.id,
        payload.name,
        payload.subject,
        payload.teamName,
        payload.nextMilestone,
        payload.summary,
        payload.branch,
        payload.repoName,
        JSON.stringify(payload.goals),
        JSON.stringify(payload.availableFiles),
        req.auth!.sub
      ]
    );

    for (const member of payload.members) {
      await conn.execute(
        `INSERT INTO mini_project_members (project_id, id, name, role, current_focus)
         VALUES (?, ?, ?, ?, ?)`,
        [payload.id, member.id, member.name, member.role, member.currentFocus]
      );
    }

    for (const task of payload.tasks) {
      await conn.execute(
        `INSERT INTO mini_project_tasks (project_id, id, title, owner_id, status)
         VALUES (?, ?, ?, ?, ?)`,
        [payload.id, task.id, task.title, task.ownerId, task.status]
      );
    }

    await conn.commit();

    const project = await getMiniProject(payload.id);
    return res.status(201).json(project);
  } catch (error: any) {
    await conn.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mini project id already exists' });
    }
    return res.status(500).json({ message: 'Failed to create mini project' });
  } finally {
    conn.release();
  }
});

async function getProjectProgress(conn: PoolConnection, projectId: string): Promise<number | null> {
  const [rows] = await conn.query<RowDataPacket[]>('SELECT progress FROM mini_projects WHERE id = ? LIMIT 1', [projectId]);
  if (!rows.length) return null;
  return Number(rows[0].progress ?? 0);
}

miniProjectsRouter.post('/:projectId/activity', async (req, res) => {
  const parsed = addActivitySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const { projectId } = req.params;
  const payload = parsed.data;
  const studentId = createStudentId(payload.studentName);
  const pool = getMySqlPool();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const currentProgress = await getProjectProgress(conn, projectId);
    if (currentProgress === null) {
      await conn.rollback();
      return res.status(404).json({ message: 'Mini project not found' });
    }

    await conn.execute(
      `INSERT INTO mini_project_members (project_id, id, name, role, current_focus)
       VALUES (?, ?, ?, 'Contributor', ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name), current_focus = VALUES(current_focus)`,
      [projectId, studentId, payload.studentName, payload.title]
    );

    const activityId = `${projectId}-${Date.now()}`;
    await conn.execute(
      `INSERT INTO mini_project_activity
      (project_id, id, type, student_id, student_name, branch, title, description, files, timestamp, lines_added, lines_removed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        projectId,
        activityId,
        payload.type,
        studentId,
        payload.studentName,
        payload.branch,
        payload.title,
        payload.description,
        JSON.stringify(payload.files),
        payload.linesAdded ?? payload.files.length * 12,
        payload.linesRemoved ?? payload.files.length * 3
      ]
    );

    let nextProgress = currentProgress;
    let nextRepoStatus: 'synced' | 'review' | 'behind' = 'synced';

    if (payload.type === 'commit') {
      nextProgress = Math.min(100, currentProgress + 2);
      nextRepoStatus = 'review';
      await conn.execute(
        `UPDATE mini_project_tasks
         SET status = CASE WHEN status = 'todo' THEN 'in-progress' ELSE status END,
             updated_at = NOW()
         WHERE project_id = ? AND owner_id = ? AND status <> 'done'`,
        [projectId, studentId]
      );
    }

    if (payload.type === 'push') {
      nextProgress = Math.min(100, currentProgress + 3);
      nextRepoStatus = 'synced';

      const [tasks] = await conn.query<RowDataPacket[]>(
        `SELECT id
         FROM mini_project_tasks
         WHERE project_id = ? AND owner_id = ? AND status <> 'done'
         ORDER BY updated_at ASC
         LIMIT 1`,
        [projectId, studentId]
      );

      if (tasks.length) {
        await conn.execute(
          `UPDATE mini_project_tasks
           SET status = 'done', updated_at = NOW()
           WHERE project_id = ? AND id = ?`,
          [projectId, String(tasks[0].id)]
        );
      }
    }

    if (payload.type === 'pull') {
      nextRepoStatus = 'synced';
    }

    const nextStatus = nextProgress >= 100 ? 'completed' : null;

    await conn.execute(
      `UPDATE mini_projects
       SET progress = ?,
           repo_status = ?,
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id = ?`,
      [nextProgress, nextRepoStatus, nextStatus, projectId]
    );

    await conn.commit();

    const project = await getMiniProject(projectId);
    return res.json(project);
  } catch {
    await conn.rollback();
    return res.status(500).json({ message: 'Failed to record activity' });
  } finally {
    conn.release();
  }
});

miniProjectsRouter.post('/:projectId/groups/auto', requireRole('admin', 'teacher'), async (req, res) => {
  const parsed = autoGroupSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const { groupSize } = parsed.data;
  const { projectId } = req.params;
  const pool = getMySqlPool();

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [membersResult] = await conn.query<RowDataPacket[]>(
      `SELECT id, name FROM mini_project_members WHERE project_id = ? ORDER BY name`,
      [projectId]
    );

    if (membersResult.length === 0) {
      await conn.rollback();
      return res.status(400).json({ message: 'No members available to form groups' });
    }

    await conn.execute('DELETE FROM mini_project_group_members WHERE project_id = ?', [projectId]);
    await conn.execute('DELETE FROM mini_project_groups WHERE project_id = ?', [projectId]);

    let groupCounter = 1;

    for (let i = 0; i < membersResult.length; i += groupSize) {
      const chunk = membersResult.slice(i, i + groupSize);
      const groupName = `Group ${groupCounter}`;
      const groupId = randomUUID();

      await conn.execute(
        `INSERT INTO mini_project_groups (id, project_id, name)
         VALUES (?, ?, ?)`,
        [groupId, projectId, groupName]
      );

      for (const member of chunk) {
        await conn.execute(
          `INSERT INTO mini_project_group_members (project_id, group_id, member_id)
           VALUES (?, ?, ?)`,
          [projectId, groupId, String(member.id)]
        );
      }

      groupCounter += 1;
    }

    await conn.commit();

    const project = await getMiniProject(projectId);
    return res.json(project);
  } catch {
    await conn.rollback();
    return res.status(500).json({ message: 'Failed to auto-create groups' });
  } finally {
    conn.release();
  }
});
