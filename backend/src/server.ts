import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import { ensureCoreSchema } from './db/ensureCoreSchema.js';
import { ensureMiniProjectSchema } from './db/ensureMiniProjectSchema.js';
import { authRouter } from './routes/auth.routes.js';
import { classesRouter } from './routes/classes.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { miniProjectsRouter } from './routes/mini-projects.routes.js';
import { submissionsRouter } from './routes/submissions.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import { utMarksRouter } from './routes/ut-marks.routes.js';
import { usersRouter } from './routes/users.routes.js';

const app = express();
const isVercel = !!process.env.VERCEL;
const uploadsDir = isVercel ? path.join('/tmp', 'uploads') : path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

app.use(helmet());
const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
if (!allowedOrigins.includes('https://mini-project-ten-sand.vercel.app')) {
  allowedOrigins.push('https://mini-project-ten-sand.vercel.app');
}
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/', (_req, res) => {
  res.json({ message: 'AMPLIFY backend running' });
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/classes', classesRouter);
app.use('/api/mini-projects', miniProjectsRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/ut-marks', utMarksRouter);
app.use('/api/users', usersRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

async function start() {
  await ensureCoreSchema();
  await ensureMiniProjectSchema();

  app.listen(env.PORT, () => {
    console.log(`AMPLIFY backend listening on port ${env.PORT}`);
  });
}

if (!isVercel) {
  start().catch((error) => {
    console.error('Failed to start backend', error);
    process.exit(1);
  });
} else {
  ensureCoreSchema().then(() => ensureMiniProjectSchema()).catch(console.error);
}

export default app;
