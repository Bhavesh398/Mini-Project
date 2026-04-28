import { getMySqlPool } from './src/db/mysqlPool.js';

async function verify() {
  const pool = getMySqlPool();

  console.log('\n=== DATABASE VERIFICATION ===\n');

  // Check students
  const [students] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM app_users WHERE role = 'student'`
  );
  console.log(`✓ Total students: ${students[0].count}`);

  // Check new 20 students
  const [newStudents] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM app_users WHERE role = 'student' AND email LIKE '%@gmail.com' AND email NOT IN ('amruta@gmail.com', 'rimzim@gmail.com', 'bhavesh@gmail.com', 'princess@gmail.com')`
  );
  console.log(`✓ New 20 students: ${newStudents[0].count}`);

  // Check mini-projects
  const [projects] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM mini_projects`
  );
  console.log(`✓ Mini-projects created: ${projects[0].count}`);

  // Check mini-project groups
  const [groups] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM mini_project_groups`
  );
  console.log(`✓ Mini-project groups: ${groups[0].count}`);

  // Check mini-project activity
  const [activity] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM mini_project_activity`
  );
  console.log(`✓ Activity records: ${activity[0].count}`);

  // Check submissions
  const [submissions] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM student_submissions`
  );
  console.log(`✓ Student submissions: ${submissions[0].count}`);

  // Check task submissions
  const [taskSubs] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM task_submissions`
  );
  console.log(`✓ Task submissions: ${taskSubs[0].count}`);

  // Check UT marks
  const [utMarks] = await pool.query<any[]>(
    `SELECT COUNT(*) as count FROM ut_marks`
  );
  console.log(`✓ UT marks records: ${utMarks[0].count}`);

  // Sample of 5 new students
  const [sampleStudents] = await pool.query<any[]>(
    `SELECT email, full_name FROM app_users WHERE role = 'student' AND email LIKE 'agar%@gmail.com' OR email LIKE 'ahir%@gmail.com' OR email LIKE 'anna%@gmail.com' OR email LIKE 'bans%@gmail.com' OR email LIKE 'bhand%@gmail.com' LIMIT 5`
  );
  console.log(`\n✓ Sample new students:`);
  sampleStudents.forEach((s: any) => {
    console.log(`  - ${s.full_name} (${s.email})`);
  });

  console.log('\n=== DATABASE VERIFICATION COMPLETE ===\n');
  process.exit(0);
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
