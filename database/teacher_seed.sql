-- DEVELOPMENT ONLY: Teacher Account Seed Data
-- This file contains test credentials for local development
-- DO NOT use these in production

-- Teacher Account Details:
-- Email: teacher@amplify.local
-- Password (plaintext): teacher123
-- Password Hash (bcrypt - cost 10): $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DYjTogU

INSERT INTO app_users (
  id,
  email,
  password_hash,
  full_name,
  role,
  avatar_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  uuid_generate_v4(),
  'teacher@amplify.local',
  -- password_hash for "teacher123" (bcrypt)
  '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36DYjTogU',
  'Test Teacher',
  'teacher'::user_role,
  NULL,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- To generate your own bcrypt hash for a different password, use:
-- Node.js: const bcrypt = require('bcrypt'); bcrypt.hash('your_password', 10).then(console.log)
-- Python: import bcrypt; print(bcrypt.hashpw(b'your_password', bcrypt.gensalt(10)).decode())
-- CLI: htpasswd -cB /dev/stdout username | grep ':' | cut -d: -f2
