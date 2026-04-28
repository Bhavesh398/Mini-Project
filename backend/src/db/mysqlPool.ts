import mysql, { Pool } from 'mysql2/promise';
import { env } from '../config/env.js';

let mySqlPool: Pool | null = null;

export function getMySqlPool(): Pool {
  if (mySqlPool) {
    return mySqlPool;
  }

  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const sslConfig = isProd ? { rejectUnauthorized: false } : undefined; // Some providers need rejectUnauthorized: false if certificates are not provided

  if (env.DATABASE_URL && env.DATABASE_URL.startsWith('mysql')) {
    mySqlPool = mysql.createPool({
      uri: env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      ssl: sslConfig
    });
  } else {
    if (!env.MYSQL_HOST || !env.MYSQL_USER || !env.MYSQL_DATABASE) {
      throw new Error('Missing MySQL configuration. Set DATABASE_URL or MYSQL_HOST, MYSQL_USER, and MYSQL_DATABASE.');
    }

    mySqlPool = mysql.createPool({
      host: env.MYSQL_HOST,
      port: env.MYSQL_PORT,
      user: env.MYSQL_USER,
      password: env.MYSQL_PASSWORD,
      database: env.MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
      ssl: sslConfig
    });
  }

  return mySqlPool;
}
