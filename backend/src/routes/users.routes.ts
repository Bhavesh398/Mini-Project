import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { getMySqlPool } from '../db/mysqlPool.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/students', async (_req, res) => {
  const pool = getMySqlPool();
  const [result] = await pool.query<RowDataPacket[]>(
    `SELECT id, full_name, email
     FROM app_users
     WHERE role = 'student' AND is_active = true
     ORDER BY full_name`
  );

  return res.json(result.map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email
  })));
});
