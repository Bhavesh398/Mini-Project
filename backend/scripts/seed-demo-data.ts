import { randomUUID } from 'crypto';
import { getMySqlPool } from '../src/db/mysqlPool.js';

type SubjectCode = 'CT' | 'OS' | 'MDM' | 'DBMS' | 'OE';

type TeacherSubjectConfig = {
  code: SubjectCode;
  teacherEmail: string;
  teacherName: string;
  classColor: string;
};

type StudentSeed = {
  email: string;
  fullName: string;
};

type MiniProjectSeed = {
  id: string;
  subject: Exclude<SubjectCode, 'OE'>;
  name: string;
  teamName: string;
  progress: number;
  nextMilestone: string;
  summary: string;
  branch: string;
  repoName: string;
  repoStatus: 'synced' | 'review' | 'behind';
  goals: string[];
  availableFiles: string[];
};

type TaskTemplate = {
  title: string;
  description: string;
};

type DirectSubmissionTemplate = {
  title: string;
  description: string;
  submissionLink: string;
  attachmentName: string;
};

type MiniProjectStudent = StudentSeed & {
  id: string;
};

const DEMO_PASSWORD_HASH = '$2a$10$9DWE6DS7wVnWsGJinzn1L.LtvZ9/z/.pJzhq4Oq6eFY8MusuhpDfG';

const SUBJECTS: TeacherSubjectConfig[] = [
  { code: 'CT', teacherEmail: 'mritunjay@gmail.com', teacherName: 'Mritunjay', classColor: 'blue' },
  { code: 'OS', teacherEmail: 'babita@gmail.com', teacherName: 'Babita', classColor: 'green' },
  { code: 'MDM', teacherEmail: 'mamta@gmail.com', teacherName: 'Mamta', classColor: 'orange' },
  { code: 'DBMS', teacherEmail: 'vandana@gmail.com', teacherName: 'Vandana', classColor: 'red' },
  { code: 'OE', teacherEmail: 'teacher_oe@gmail.com', teacherName: 'OE Teacher', classColor: 'purple' }
];

const CORE_USERS: StudentSeed[] = [
  { email: 'admin@gmail.com', fullName: 'Platform Admin' },
  { email: 'mritunjay@gmail.com', fullName: 'Mritunjay' },
  { email: 'babita@gmail.com', fullName: 'Babita' },
  { email: 'mamta@gmail.com', fullName: 'Mamta' },
  { email: 'vandana@gmail.com', fullName: 'Vandana' },
  { email: 'teacher_oe@gmail.com', fullName: 'OE Teacher' },
  { email: 'amruta@gmail.com', fullName: 'Amruta' },
  { email: 'rimzim@gmail.com', fullName: 'Rimzim' },
  { email: 'bhavesh@gmail.com', fullName: 'Bhavesh' },
  { email: 'princess@gmail.com', fullName: 'Princess' }
];

const MINI_PROJECT_STUDENTS: MiniProjectStudent[] = [
  { id: 'agare-manohar', email: 'agaremanohar@gmail.com', fullName: 'AGARE SAMBHAN MANOHAR' },
  { id: 'ahir-ashish', email: 'ahirashish@gmail.com', fullName: 'AHIR ASHISH MOHAN' },
  { id: 'annadate-manish', email: 'annadatemanish@gmail.com', fullName: 'ANNADATE VANSH MANISH' },
  { id: 'bansode-ashish', email: 'bansodeashish@gmail.com', fullName: 'BANSODE ASHISH SHIVAJIRAO' },
  { id: 'bhandari-rasik', email: 'bhandarirasik@gmail.com', fullName: 'BHANDARI RASIK DINESH' },
  { id: 'bidgar-anurag', email: 'bidgaranurag@gmail.com', fullName: 'BIDGAR ANURAG MAHADEO' },
  { id: 'dongilwar-pooja', email: 'dongilwarpooja@gmail.com', fullName: 'DONGILWAR POOJA MAKARAND' },
  { id: 'borkar-jatin', email: 'borkarjatin@gmail.com', fullName: 'BORKAR JATIN JITENDRA' },
  { id: 'chaubal-surbhi', email: 'chaubalsurbhi@gmail.com', fullName: 'CHAUBAL SURBHI PANKAJ' },
  { id: 'chavan-vedant', email: 'chavanvedant@gmail.com', fullName: 'CHAVAN VEDANT VIKAS' },
  { id: 'desai-alpesh', email: 'desaialpesh@gmail.com', fullName: 'DESAI ALPESH' },
  { id: 'deshmukh-ayush', email: 'deshmukhayush@gmail.com', fullName: 'DESHMUKH AYUSH CHANDRAKANT' },
  { id: 'deshpande-tanishq', email: 'deshpandetanishq@gmail.com', fullName: 'DESHPANDE TANISHQ SACHIN' },
  { id: 'digsakar-tejas', email: 'digsakartejas@gmail.com', fullName: 'DIGSAKAR TEJAS SANTOSH' },
  { id: 'dorde-harsh', email: 'dordeharsh@gmail.com', fullName: 'DORDE HARSH SANTOSH' },
  { id: 'doshi-meeti', email: 'doshimeeti@gmail.com', fullName: 'DOSHI MEETI MAYUR' },
  { id: 'dusharekar-aditya', email: 'dusharekaditya@gmail.com', fullName: 'DUSHAREKAR ADITYA RAJENDRA' },
  { id: 'gaikwad-hrishikesh', email: 'gaikwadhrishikesh@gmail.com', fullName: 'GAIKWAD HRISHIKESH MAHENDRA' },
  { id: 'galaiya-rushabh', email: 'galaiyarushabh@gmail.com', fullName: 'GALAIYA RUSHABH PRAKASH' },
  { id: 'gandhi-piyush', email: 'gandhipiyush@gmail.com', fullName: 'GANDHI PIYUSH KIRAN' }
];

const ALL_STUDENTS: StudentSeed[] = [
  ...CORE_USERS.slice(6),
  ...MINI_PROJECT_STUDENTS.map((student) => ({ email: student.email, fullName: student.fullName }))
];

const MINI_PROJECT_BLUEPRINTS: MiniProjectSeed[] = [
  {
    id: 'mp-ct-algorithm-studio',
    subject: 'CT',
    name: 'Algorithm Thinking Studio',
    teamName: 'Team Vector',
    progress: 72,
    nextMilestone: 'Finalize algorithm trace sheet',
    summary: 'A structured mini project for tracing logic, decomposition, and pattern recognition with teacher review notes.',
    branch: 'feature/ct-algorithm-studio',
    repoName: 'ct/algorithm-thinking-studio',
    repoStatus: 'synced',
    goals: ['Trace each algorithm step clearly', 'Record commit and push history', 'Capture teacher remarks in every checkpoint'],
    availableFiles: ['logic-notes.md', 'trace-table.md', 'reflection.md', 'README.md']
  },
  {
    id: 'mp-os-process-lab',
    subject: 'OS',
    name: 'Process Scheduler Lab',
    teamName: 'Team Quantum',
    progress: 58,
    nextMilestone: 'Validate scheduler timings',
    summary: 'A scheduling and process lifecycle lab with explicit pull, commit, and push checkpoints.',
    branch: 'feature/os-process-lab',
    repoName: 'os/process-scheduler-lab',
    repoStatus: 'review',
    goals: ['Compare scheduling outputs', 'Log teacher review remarks', 'Keep task ownership visible'],
    availableFiles: ['scheduler.ts', 'gantt-notes.md', 'test-cases.md', 'README.md']
  },
  {
    id: 'mp-mdm-impact-board',
    subject: 'MDM',
    name: 'Impact Research Board',
    teamName: 'Team Prism',
    progress: 84,
    nextMilestone: 'Complete final reflection board',
    summary: 'An interdisciplinary research and reflection board designed for review-friendly progress updates.',
    branch: 'feature/mdm-impact-board',
    repoName: 'mdm/impact-research-board',
    repoStatus: 'synced',
    goals: ['Link work to real-world context', 'Keep the update trail readable', 'Blend research, reflection, and delivery'],
    availableFiles: ['research-notes.md', 'reflection.md', 'presentation-outline.md', 'README.md']
  },
  {
    id: 'mp-dbms-data-studio',
    subject: 'DBMS',
    name: 'Library Data Studio',
    teamName: 'Team Schema',
    progress: 46,
    nextMilestone: 'Complete schema review and query pack',
    summary: 'A database mini project for schema design, SQL queries, and structured teacher comments.',
    branch: 'feature/dbms-data-studio',
    repoName: 'dbms/library-data-studio',
    repoStatus: 'behind',
    goals: ['Document schema decisions', 'Show commit, push, and pull history', 'Use teacher remarks to guide improvements'],
    availableFiles: ['schema.sql', 'queries.sql', 'seed-data.sql', 'README.md']
  }
];

const SUBJECT_TASK_TEMPLATES: Record<SubjectCode, TaskTemplate[]> = {
  CT: [
    { title: 'Boolean Logic Mapping', description: 'Convert real-world decision paths into a clear boolean logic map.' },
    { title: 'Decomposition Worksheet', description: 'Break a problem into small steps and annotate each part.' },
    { title: 'Algorithm Trace Log', description: 'Trace an algorithm by hand and record every stage.' },
    { title: 'Pattern Recognition Board', description: 'Identify repeated patterns and explain the reasoning behind them.' },
    { title: 'Abstraction Poster', description: 'Summarize the important data and omit unnecessary details.' }
  ],
  OS: [
    { title: 'Process State Diagram', description: 'Draw and label the lifecycle of a process from ready to terminated.' },
    { title: 'CPU Scheduling Lab', description: 'Compare FCFS, SJF, and Round Robin on the same workload.' },
    { title: 'Memory Allocation Notes', description: 'Explain paging, segmentation, and memory allocation tradeoffs.' },
    { title: 'Deadlock Scenario Analysis', description: 'Show a deadlock case and describe how to prevent it.' },
    { title: 'File System Walkthrough', description: 'Document the path from file request to file access and storage.' }
  ],
  MDM: [
    { title: 'Problem Framing Canvas', description: 'Frame the problem, context, and expected outcome for the minor project.' },
    { title: 'Research Summary Grid', description: 'Collect source material and summarize the most important ideas.' },
    { title: 'Reflection Draft', description: 'Write a short reflection on what changed and why it matters.' },
    { title: 'Survey Findings Report', description: 'Capture survey responses and convert them into meaningful observations.' },
    { title: 'Presentation Outline', description: 'Prepare a concise outline for the final presentation.' }
  ],
  DBMS: [
    { title: 'ER Diagram Review', description: 'Identify the entities, relationships, and keys in the library model.' },
    { title: 'Normalization Walkthrough', description: 'Normalize the schema and document each dependency decision.' },
    { title: 'Join Query Lab', description: 'Write joins that return useful project data from the sample dataset.' },
    { title: 'Transaction Safety Notes', description: 'Explain ACID behavior and where transactions are needed.' },
    { title: 'Index Design Brief', description: 'Recommend useful indexes and explain the query benefit.' }
  ],
  OE: [
    { title: 'Portfolio Direction Notes', description: 'Describe the elective topic and the final outcome you want to show.' },
    { title: 'Communication Practice Log', description: 'Document how the group communicated and what improved over time.' },
    { title: 'Research Snapshot', description: 'Capture a short research summary with source references.' },
    { title: 'Peer Feedback Draft', description: 'Write a short peer-feedback note that helps the team improve.' },
    { title: 'Final Reflection Journal', description: 'Summarize what you learned and how you will present it.' }
  ]
};

const DIRECT_SUBMISSION_TEMPLATES: Record<SubjectCode, DirectSubmissionTemplate[]> = {
  CT: [
    {
      title: 'CT Concept Note',
      description: 'A short concept note covering decomposition and logic mapping for the class challenge.',
      submissionLink: 'https://example.com/ct/concept-note',
      attachmentName: 'ct-concept-note.pdf'
    },
    {
      title: 'CT Reflection Draft',
      description: 'A reflective write-up on how logical reasoning improved the solution path.',
      submissionLink: 'https://example.com/ct/reflection-draft',
      attachmentName: 'ct-reflection-draft.docx'
    }
  ],
  OS: [
    {
      title: 'OS Scheduler Notes',
      description: 'Notes comparing process scheduling choices and queue behavior.',
      submissionLink: 'https://example.com/os/scheduler-notes',
      attachmentName: 'os-scheduler-notes.pdf'
    },
    {
      title: 'OS Deadlock Summary',
      description: 'A compact summary of deadlock conditions and practical prevention ideas.',
      submissionLink: 'https://example.com/os/deadlock-summary',
      attachmentName: 'os-deadlock-summary.pdf'
    }
  ],
  MDM: [
    {
      title: 'MDM Research Brief',
      description: 'Interdisciplinary research brief with a short problem statement and references.',
      submissionLink: 'https://example.com/mdm/research-brief',
      attachmentName: 'mdm-research-brief.pdf'
    },
    {
      title: 'MDM Reflection Page',
      description: 'Reflection page showing how the topic connects to the broader semester theme.',
      submissionLink: 'https://example.com/mdm/reflection-page',
      attachmentName: 'mdm-reflection-page.docx'
    }
  ],
  DBMS: [
    {
      title: 'DBMS Schema Review',
      description: 'A polished schema review with table keys and relationship notes.',
      submissionLink: 'https://example.com/dbms/schema-review',
      attachmentName: 'dbms-schema-review.pdf'
    },
    {
      title: 'DBMS Query Pack',
      description: 'A curated SQL query pack for retrieving useful reports from the sample database.',
      submissionLink: 'https://example.com/dbms/query-pack',
      attachmentName: 'dbms-query-pack.sql'
    }
  ],
  OE: [
    {
      title: 'OE Portfolio Entry',
      description: 'A concise elective portfolio entry with the key takeaways from the module.',
      submissionLink: 'https://example.com/oe/portfolio-entry',
      attachmentName: 'oe-portfolio-entry.pdf'
    },
    {
      title: 'OE Summary Sheet',
      description: 'A summary sheet with personal notes and next steps for the elective topic.',
      submissionLink: 'https://example.com/oe/summary-sheet',
      attachmentName: 'oe-summary-sheet.docx'
    }
  ]
};

const SUBJECT_SUBMITTER_GROUPS: Record<SubjectCode, MiniProjectStudent[]> = {
  CT: MINI_PROJECT_STUDENTS.slice(0, 5),
  OS: MINI_PROJECT_STUDENTS.slice(5, 10),
  MDM: MINI_PROJECT_STUDENTS.slice(10, 15),
  DBMS: MINI_PROJECT_STUDENTS.slice(15, 20),
  OE: MINI_PROJECT_STUDENTS.slice(0, 5)
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

function seededShuffle<T>(items: T[], seed: string): T[] {
  const output = [...items];
  let state = hashString(seed);

  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }

  return output;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function makeTimestamp(day: number, hour: number, minute: number): string {
  return `2026-04-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

function submissionReviewText(subject: SubjectCode, status: 'submitted' | 'approved' | 'rejected'): string | null {
  if (status === 'submitted') return null;

  const feedbackBySubject: Record<SubjectCode, { approved: string; rejected: string }> = {
    CT: {
      approved: 'Teacher remark: strong logic flow and a clean explanation.',
      rejected: 'Teacher remark: tighten the examples and make the decision path clearer.'
    },
    OS: {
      approved: 'Teacher remark: good scheduling comparison and clear timing notes.',
      rejected: 'Teacher remark: revisit the process chart and add one more test case.'
    },
    MDM: {
      approved: 'Teacher remark: excellent reflection and a balanced research summary.',
      rejected: 'Teacher remark: connect the research more clearly to the final outcome.'
    },
    DBMS: {
      approved: 'Teacher remark: accurate schema reasoning and strong SQL examples.',
      rejected: 'Teacher remark: normalize the report layout and fix the query labeling.'
    },
    OE: {
      approved: 'Teacher remark: concise and well structured elective submission.',
      rejected: 'Teacher remark: add more context and reference the source material.'
    }
  };

  return feedbackBySubject[subject][status === 'approved' ? 'approved' : 'rejected'];
}

async function ensureSubjectCatalog() {
  const pool = getMySqlPool();

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS subject_catalog (
      code VARCHAR(20) NOT NULL,
      name VARCHAR(255) NOT NULL,
      short_label VARCHAR(50) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const subjectRows = [
    ['DBMS', 'Database Management System', 'DBMS'],
    ['OS', 'Operating System', 'OS'],
    ['MDM', 'Multidisciplinary Minor', 'MDM'],
    ['OE', 'Open Elective', 'OE'],
    ['CT', 'Computational Thinking', 'CT']
  ];

  for (const [code, name, shortLabel] of subjectRows) {
    await pool.execute(
      `INSERT INTO subject_catalog (code, name, short_label, is_active)
       VALUES (?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         short_label = VALUES(short_label),
         is_active = TRUE`,
      [code, name, shortLabel]
    );
  }
}

async function upsertUser(email: string, passwordHash: string, fullName: string, role: 'admin' | 'teacher' | 'student') {
  const pool = getMySqlPool();

  await pool.execute(
    `INSERT INTO app_users (id, email, password_hash, full_name, role, is_active)
     VALUES (UUID(), ?, ?, ?, ?, TRUE)
     ON DUPLICATE KEY UPDATE
       password_hash = VALUES(password_hash),
       full_name = VALUES(full_name),
       role = VALUES(role),
       is_active = TRUE`,
    [email, passwordHash, fullName, role]
  );
}

async function ensureCoreUsers() {
  for (const user of CORE_USERS) {
    const role = user.email === 'admin@gmail.com' ? 'admin' : CORE_USERS.slice(1, 6).some((teacher) => teacher.email === user.email) ? 'teacher' : 'student';
    await upsertUser(user.email, DEMO_PASSWORD_HASH, user.fullName, role);
  }
}

async function ensureExtraStudents() {
  for (const student of MINI_PROJECT_STUDENTS) {
    await upsertUser(student.email, DEMO_PASSWORD_HASH, student.fullName, 'student');
  }
}

async function ensureTeacherClasses() {
  const pool = getMySqlPool();

  const subjectToTeacherEmail: Record<SubjectCode, string> = {
    CT: 'mritunjay@gmail.com',
    OS: 'babita@gmail.com',
    MDM: 'mamta@gmail.com',
    DBMS: 'vandana@gmail.com',
    OE: 'teacher_oe@gmail.com'
  };

  const subjectToColor: Record<SubjectCode, string> = {
    CT: 'blue',
    OS: 'green',
    MDM: 'orange',
    DBMS: 'red',
    OE: 'purple'
  };

  for (const [subject, teacherEmail] of Object.entries(subjectToTeacherEmail) as Array<[SubjectCode, string]>) {
    const [teacherRows] = await pool.query<any[]>(
      `SELECT id FROM app_users WHERE email = ? LIMIT 1`,
      [teacherEmail]
    );

    if (!teacherRows.length) {
      throw new Error(`Teacher not found for ${subject}: ${teacherEmail}`);
    }

    const teacherId = teacherRows[0].id as string;
    const className = `${subject} - A`;

    await pool.execute(
      `INSERT INTO classes (id, name, subject, grade_level, section, color, teacher_id)
       VALUES (UUID(), ?, ?, 'Third Year', 'A', ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         subject = VALUES(subject),
         grade_level = VALUES(grade_level),
         section = VALUES(section),
         color = VALUES(color),
         teacher_id = VALUES(teacher_id)`,
      [className, subject, subjectToColor[subject], teacherId]
    );
  }
}

async function ensureStudentEnrollments() {
  const pool = getMySqlPool();

  const studentEmails = [
    'amruta@gmail.com',
    'rimzim@gmail.com',
    'bhavesh@gmail.com',
    'princess@gmail.com',
    ...MINI_PROJECT_STUDENTS.map((student) => student.email)
  ];

  const placeholders = studentEmails.map(() => '?').join(', ');

  const [students] = await pool.query<any[]>(
    `SELECT id FROM app_users WHERE email IN (${placeholders})`,
    studentEmails
  );

  const [classes] = await pool.query<any[]>(
    `SELECT id FROM classes WHERE subject IN ('DBMS', 'OS', 'MDM', 'OE', 'CT')`
  );

  for (const c of classes) {
    for (const s of students) {
      await pool.execute(
        `INSERT INTO enrollments (id, class_id, student_id, status)
         VALUES (?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE status = 'active'`,
        [randomUUID(), c.id, s.id]
      );
    }
  }
}

async function getClassMap() {
  const pool = getMySqlPool();
  const [rows] = await pool.query<any[]>(
    `SELECT c.id, c.subject, c.teacher_id, u.email AS teacher_email
     FROM classes c
     JOIN app_users u ON u.id = c.teacher_id`
  );

  return new Map<string, { id: string; subject: SubjectCode; teacherId: string; teacherEmail: string }>(
    rows.map((row) => [
      row.subject as string,
      {
        id: row.id as string,
        subject: row.subject as SubjectCode,
        teacherId: row.teacher_id as string,
        teacherEmail: row.teacher_email as string
      }
    ])
  );
}

async function getStudentIdMap() {
  const pool = getMySqlPool();
  const [rows] = await pool.query<any[]>(
    `SELECT id, email FROM app_users WHERE role = 'student'`
  );

  return new Map<string, string>(
    rows.map((row) => [row.email as string, row.id as string])
  );
}

async function seedTasksAndSubmissions() {
  const pool = getMySqlPool();
  const classMap = await getClassMap();
  const studentIdMap = await getStudentIdMap();

  for (const subject of SUBJECTS) {
    const subjectClass = classMap.get(subject.code);
    if (!subjectClass) {
      throw new Error(`Missing class for subject ${subject.code}`);
    }

    const taskTemplates = SUBJECT_TASK_TEMPLATES[subject.code];
    const submitters = SUBJECT_SUBMITTER_GROUPS[subject.code];
    const directTemplates = DIRECT_SUBMISSION_TEMPLATES[subject.code];

    for (let index = 0; index < taskTemplates.length; index += 1) {
      const taskTemplate = taskTemplates[index];
      const taskId = `task-${subject.code.toLowerCase()}-${index + 1}`;
      const dueDate = `2026-05-${String(index + 1).padStart(2, '0')} 17:00:00`;

      await pool.execute(
        `INSERT INTO tasks (id, class_id, teacher_id, title, description, due_date, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE
           class_id = VALUES(class_id),
           teacher_id = VALUES(teacher_id),
           title = VALUES(title),
           description = VALUES(description),
           due_date = VALUES(due_date),
           status = VALUES(status)`,
        [taskId, subjectClass.id, subjectClass.teacherId, taskTemplate.title, taskTemplate.description, dueDate]
      );

      const submitter = submitters[index % submitters.length];
      const submitterId = studentIdMap.get(submitter.email);
      if (!submitterId) {
        throw new Error(`Student not found: ${submitter.email}`);
      }

      const taskSubmissionStatus: 'submitted' | 'approved' | 'rejected' = index % 3 === 0 ? 'submitted' : index % 3 === 1 ? 'approved' : 'rejected';
      const reviewText = submissionReviewText(subject.code, taskSubmissionStatus);
      const taskSubmissionId = `ts-${subject.code.toLowerCase()}-${index + 1}`;
      const submittedAt = makeTimestamp(20 + index, 10 + index, 15);

      await pool.execute(
        `INSERT INTO task_submissions
          (id, task_id, student_id, submission_text, submission_link, attachment_name, status, marks, feedback, reviewed_by, reviewed_at, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           student_id = VALUES(student_id),
           submission_text = VALUES(submission_text),
           submission_link = VALUES(submission_link),
           attachment_name = VALUES(attachment_name),
           status = VALUES(status),
           marks = VALUES(marks),
           feedback = VALUES(feedback),
           reviewed_by = VALUES(reviewed_by),
           reviewed_at = VALUES(reviewed_at),
           submitted_at = VALUES(submitted_at)`,
        [
          taskSubmissionId,
          taskId,
          submitterId,
          `${taskTemplate.title} completed by ${submitter.fullName}`,
          `https://example.com/submissions/${subject.code.toLowerCase()}/task-${index + 1}/${submitter.id}`,
          `${slugify(taskTemplate.title)}.pdf`,
          taskSubmissionStatus,
          taskSubmissionStatus === 'submitted' ? null : taskSubmissionStatus === 'approved' ? 92 : 64,
          reviewText,
          taskSubmissionStatus === 'submitted' ? null : subjectClass.teacherId,
          taskSubmissionStatus === 'submitted' ? null : submittedAt,
          submittedAt
        ]
      );
    }

    for (let index = 0; index < directTemplates.length; index += 1) {
      const template = directTemplates[index];
      const submitter = submitters[index % submitters.length];
      const submitterId = studentIdMap.get(submitter.email);
      if (!submitterId) {
        throw new Error(`Student not found: ${submitter.email}`);
      }

      const submissionId = `sub-${subject.code.toLowerCase()}-${index + 1}`;
      const status: 'approved' | 'rejected' = index % 2 === 0 ? 'approved' : 'rejected';
      const feedback = submissionReviewText(subject.code, status);

      await pool.execute(
        `INSERT INTO student_submissions
          (id, class_id, student_id, title, description, submission_link, attachment_name, status, marks, feedback, reviewed_by, reviewed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           class_id = VALUES(class_id),
           student_id = VALUES(student_id),
           title = VALUES(title),
           description = VALUES(description),
           submission_link = VALUES(submission_link),
           attachment_name = VALUES(attachment_name),
           status = VALUES(status),
           marks = VALUES(marks),
           feedback = VALUES(feedback),
           reviewed_by = VALUES(reviewed_by),
           reviewed_at = VALUES(reviewed_at)`,
        [
          submissionId,
          subjectClass.id,
          submitterId,
          template.title,
          template.description,
          template.submissionLink,
          template.attachmentName,
          status,
          status === 'approved' ? 90 + index * 2 : 62 + index * 3,
          feedback,
          subjectClass.teacherId,
          makeTimestamp(12 + index, 14, 30)
        ]
      );
    }
  }
}

async function seedMiniProjects() {
  const pool = getMySqlPool();
  const classMap = await getClassMap();
  const shuffledStudents = seededShuffle(MINI_PROJECT_STUDENTS, 'mini-project-groups-2026');
  const groupedStudents = chunk(shuffledStudents, 5);

  const projectAssignments: Array<{ subject: Exclude<SubjectCode, 'OE'>; students: MiniProjectStudent[] }> = [
    { subject: 'CT', students: groupedStudents[0] },
    { subject: 'OS', students: groupedStudents[1] },
    { subject: 'MDM', students: groupedStudents[2] },
    { subject: 'DBMS', students: groupedStudents[3] }
  ];

  const teacherLookup = new Map<string, string>(
    SUBJECTS.map((subject) => [subject.code, subject.teacherEmail])
  );

  for (const assignment of projectAssignments) {
    const blueprint = MINI_PROJECT_BLUEPRINTS.find((project) => project.subject === assignment.subject);
    const subjectClass = classMap.get(assignment.subject);

    if (!blueprint || !subjectClass) {
      throw new Error(`Missing blueprint or class for subject ${assignment.subject}`);
    }

    const projectTeacherEmail = teacherLookup.get(assignment.subject);
    if (!projectTeacherEmail) {
      throw new Error(`Missing teacher for ${assignment.subject}`);
    }

    const [teacherRows] = await pool.query<any[]>(
      `SELECT id FROM app_users WHERE email = ? LIMIT 1`,
      [projectTeacherEmail]
    );

    if (!teacherRows.length) {
      throw new Error(`Teacher row missing for ${assignment.subject}`);
    }

    const createdBy = teacherRows[0].id as string;
    const members = assignment.students;
    const projectId = blueprint.id;

    await pool.execute(
      `INSERT INTO mini_projects
        (id, name, subject, team_name, progress, next_milestone, status, summary, branch, repo_name, repo_status, goals, available_files, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         subject = VALUES(subject),
         team_name = VALUES(team_name),
         progress = VALUES(progress),
         next_milestone = VALUES(next_milestone),
         status = VALUES(status),
         summary = VALUES(summary),
         branch = VALUES(branch),
         repo_name = VALUES(repo_name),
         repo_status = VALUES(repo_status),
         goals = VALUES(goals),
         available_files = VALUES(available_files),
         created_by = VALUES(created_by)`,
      [
        projectId,
        blueprint.name,
        blueprint.subject,
        blueprint.teamName,
        blueprint.progress,
        blueprint.nextMilestone,
        blueprint.repoStatus === 'behind' ? 'at-risk' : 'on-track',
        blueprint.summary,
        blueprint.branch,
        blueprint.repoName,
        blueprint.repoStatus,
        JSON.stringify(blueprint.goals),
        JSON.stringify(blueprint.availableFiles),
        createdBy
      ]
    );

    await pool.execute(`DELETE FROM mini_project_group_members WHERE project_id = ?`, [projectId]);
    await pool.execute(`DELETE FROM mini_project_groups WHERE project_id = ?`, [projectId]);
    await pool.execute(`DELETE FROM mini_project_tasks WHERE project_id = ?`, [projectId]);
    await pool.execute(`DELETE FROM mini_project_activity WHERE project_id = ?`, [projectId]);
    await pool.execute(`DELETE FROM mini_project_members WHERE project_id = ?`, [projectId]);

    for (let index = 0; index < members.length; index += 1) {
      const member = members[index];
      const roleByIndex = ['Project Lead', 'Developer', 'Researcher', 'Tester', 'Reporter'];
      await pool.execute(
        `INSERT INTO mini_project_members (project_id, id, name, role, current_focus)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           role = VALUES(role),
           current_focus = VALUES(current_focus)`,
        [
          projectId,
          member.id,
          member.fullName,
          roleByIndex[index] ?? 'Contributor',
          index % 2 === 0 ? 'Refining the latest commit' : 'Preparing the next push'
        ]
      );
    }

    const firstGroupId = `${projectId}-grp-a`;
    const secondGroupId = `${projectId}-grp-b`;
    const firstGroupMembers = members.slice(0, 3);
    const secondGroupMembers = members.slice(3);

    await pool.execute(
      `INSERT INTO mini_project_groups (id, project_id, name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [firstGroupId, projectId, 'Group A']
    );
    await pool.execute(
      `INSERT INTO mini_project_groups (id, project_id, name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [secondGroupId, projectId, 'Group B']
    );

    for (const member of firstGroupMembers) {
      await pool.execute(
        `INSERT INTO mini_project_group_members (project_id, group_id, member_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE member_id = VALUES(member_id)`,
        [projectId, firstGroupId, member.id]
      );
    }

    for (const member of secondGroupMembers) {
      await pool.execute(
        `INSERT INTO mini_project_group_members (project_id, group_id, member_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE member_id = VALUES(member_id)`,
        [projectId, secondGroupId, member.id]
      );
    }

    const projectTasks = [
      `Map the ${assignment.subject} workflow`,
      `Prepare the first review checkpoint`,
      `Summarize teacher remarks and next steps`
    ];

    for (let index = 0; index < projectTasks.length; index += 1) {
      const member = members[index % members.length];
      const taskId = `${projectId}-task-${index + 1}`;
      const taskStatus = index === 0 ? 'done' : index === 1 ? 'in-progress' : 'todo';

      await pool.execute(
        `INSERT INTO mini_project_tasks (project_id, id, title, owner_id, status)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           title = VALUES(title),
           owner_id = VALUES(owner_id),
           status = VALUES(status)`,
        [projectId, taskId, projectTasks[index], member.id, taskStatus]
      );
    }

    const activityPlan = [
      { type: 'commit', linesAdded: 82, linesRemoved: 6 },
      { type: 'push', linesAdded: 28, linesRemoved: 4 },
      { type: 'pull', linesAdded: 0, linesRemoved: 0 },
      { type: 'commit', linesAdded: 43, linesRemoved: 11 },
      { type: 'push', linesAdded: 35, linesRemoved: 9 },
      { type: 'pull', linesAdded: 0, linesRemoved: 0 }
    ] as const;

    for (let index = 0; index < activityPlan.length; index += 1) {
      const member = members[index % members.length];
      const plan = activityPlan[index];
      const activityId = `${projectId}-activity-${index + 1}`;
      const teacherRemark =
        index % 2 === 0
          ? 'Teacher remark: strong progress, keep the update trail clean.'
          : 'Teacher remark: good checkpoint, refine the final documentation.';
      const titleByType: Record<(typeof activityPlan)[number]['type'], string> = {
        commit: `Commit ${index + 1}: update ${assignment.subject} project`,
        push: `Push ${index + 1}: share ${assignment.subject} checkpoint`,
        pull: `Pull ${index + 1}: sync latest ${assignment.subject} changes`
      };

      await pool.execute(
        `INSERT INTO mini_project_activity
          (project_id, id, type, student_id, student_name, branch, title, description, files, timestamp, lines_added, lines_removed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           type = VALUES(type),
           student_id = VALUES(student_id),
           student_name = VALUES(student_name),
           branch = VALUES(branch),
           title = VALUES(title),
           description = VALUES(description),
           files = VALUES(files),
           timestamp = VALUES(timestamp),
           lines_added = VALUES(lines_added),
           lines_removed = VALUES(lines_removed)`,
        [
          projectId,
          activityId,
          plan.type,
          member.id,
          member.fullName,
          blueprint.branch,
          titleByType[plan.type],
          `${teacherRemark} Student note: ${member.fullName} handled this update for ${assignment.subject}.`,
          JSON.stringify(index % 2 === 0 ? blueprint.availableFiles.slice(0, 2) : blueprint.availableFiles.slice(1, 4)),
          makeTimestamp(14 + index, 11, 10 + index),
          plan.linesAdded,
          plan.linesRemoved
        ]
      );
    }
  }
}

async function seedDemoData() {
  await ensureSubjectCatalog();
  await ensureCoreUsers();
  await ensureExtraStudents();
  await ensureTeacherClasses();
  await ensureStudentEnrollments();
  await seedTasksAndSubmissions();
  await seedMiniProjects();
}

export { seedDemoData };
