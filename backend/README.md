# AMPLIFY Backend (Non-Supabase Runtime)

This backend is a standalone Node.js API service.
It uses Supabase only as the Postgres database host.

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure

Copy `.env.example` to `.env` and fill values.

For submissions export via MySQL, add:

- `MYSQL_HOST`
- `MYSQL_PORT` (default `3306`)
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

## 3. Create DB objects in Supabase

Run SQL in Supabase SQL Editor:

- `database/schema_backend.sql`

## 4. Run

```bash
npm run dev
```

Base URL: `http://localhost:4000`

## Supabase to MySQL Migration

Use this to migrate all `public` schema tables and rows from Supabase Postgres to MySQL.

Required environment:

- `SUPABASE_DATABASE_URL` (or reuse `DATABASE_URL` as source)
- `MYSQL_HOST`
- `MYSQL_PORT` (default `3306`)
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

Run:

```bash
npm run migrate:supabase:mysql
```

What it does:

- Discovers all tables in Postgres `public` schema
- Creates matching MySQL tables with mapped column types
- Truncates MySQL target tables
- Copies all rows table-by-table

## Fallback: Use Database Folder Schema/Seed

If Supabase connection is unavailable, bootstrap MySQL directly from the schema/seed logic in `database/schema_backend.sql` and `database/subjects_dashboard_seed.sql`.

Required environment:

- `MYSQL_HOST`
- `MYSQL_PORT` (default `3306`)
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`

Run:

```bash
npm run bootstrap:mysql:database-folder
```

## API summary

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `GET /api/classes`
- `POST /api/classes`
- `GET /api/classes/:classId/students`
- `GET /api/classes/:classId/engagement`
- `POST /api/classes/:classId/engagement`
- `GET /api/submissions/export`

Use `Authorization: Bearer <access_token>`.
