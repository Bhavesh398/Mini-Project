import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { getMySqlPool } from '../db/mysqlPool.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const pool = getMySqlPool();
  const [db] = await pool.query<RowDataPacket[]>('SELECT NOW() as now');
  res.json({
    status: 'ok',
    dbTime: db[0]?.now ?? null
  });
});
