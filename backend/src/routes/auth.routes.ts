import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getMySqlPool } from '../db/mysqlPool.js';
import { requireAuth } from '../middleware/auth.js';
import { JwtClaims } from '../types/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.enum(['admin', 'teacher', 'student']).default('student')
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10)
});

type UserRow = RowDataPacket & {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'teacher' | 'student';
};

function signAccessToken(claims: JwtClaims) {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions['expiresIn']
  };

  return jwt.sign(claims, env.JWT_ACCESS_SECRET, {
    ...options
  });
}

function signRefreshToken(claims: JwtClaims) {
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_TTL as SignOptions['expiresIn']
  };

  return jwt.sign(claims, env.JWT_REFRESH_SECRET, {
    ...options
  });
}

authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
  }

  const normalizedEmail = parsed.data.email.trim().toLowerCase();
  const { password, fullName, role } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);
  const pool = getMySqlPool();

  try {
    await pool.execute(
      `INSERT INTO app_users (id, email, password_hash, full_name, role)
       VALUES (UUID(), ?, ?, ?, ?)`,
      [normalizedEmail, passwordHash, fullName, role]
    );

    const [users] = await pool.query<UserRow[]>(
      `SELECT id, email, full_name, role
       FROM app_users
       WHERE email = ?
       LIMIT 1`,
      [normalizedEmail]
    );

    const user = users[0];
    const claims: JwtClaims = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = signAccessToken(claims);
    const refreshToken = signRefreshToken(claims);

    await pool.execute(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, refreshToken]
    );

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    return res.status(500).json({ message: 'Failed to register user' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload', errors: parsed.error.flatten() });
    }

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const { password } = parsed.data;
    const pool = getMySqlPool();

    const [result] = await pool.query<UserRow[]>(
      `SELECT id, email, password_hash, full_name, role
       FROM app_users
       WHERE email = ? AND is_active = true
       LIMIT 1`,
      [normalizedEmail]
    );

    const user = result[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const claims: JwtClaims = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = signAccessToken(claims);
    const refreshToken = signRefreshToken(claims);

    await pool.execute(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES (UUID(), ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, refreshToken]
    );

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch {
    return res.status(500).json({ message: 'Failed to login' });
  }
});

authRouter.post('/refresh', async (req, res) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid payload' });
  }

  const { refreshToken } = parsed.data;
  const pool = getMySqlPool();

  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtClaims;

    const [tokenResult] = await pool.query<RowDataPacket[]>(
      `SELECT id
       FROM refresh_tokens
       WHERE token = ?
         AND revoked_at IS NULL
         AND expires_at > NOW()
       LIMIT 1`,
      [refreshToken]
    );

    if (tokenResult.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = signAccessToken(payload);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  try {
    const userId = req.auth!.sub;
    const pool = getMySqlPool();

    const [result] = await pool.query<UserRow[]>(
      `SELECT id, email, full_name, role
       FROM app_users
       WHERE id = ?
       LIMIT 1`,
      [userId]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result[0];
    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role
    });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
});

authRouter.post('/logout', requireAuth, async (req, res) => {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const pool = getMySqlPool();

    await pool.execute(
      `UPDATE refresh_tokens
       SET revoked_at = NOW()
       WHERE token = ?`,
      [parsed.data.refreshToken]
    );

    return res.status(204).send();
  } catch {
    return res.status(500).json({ message: 'Failed to logout' });
  }
});
