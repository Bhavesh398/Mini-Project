export type MiniProjectStatus = 'on-track' | 'at-risk' | 'completed';
export type MiniProjectActivityType = 'commit' | 'push' | 'pull';
export type MiniProjectTaskStatus = 'todo' | 'in-progress' | 'done';

export interface MiniProjectMember {
  id: string;
  name: string;
  role: string;
  currentFocus: string;
}

export interface MiniProjectTask {
  id: string;
  title: string;
  ownerId: string;
  status: MiniProjectTaskStatus;
  updatedAt: string;
}

export interface MiniProjectActivity {
  id: string;
  type: MiniProjectActivityType;
  studentId: string;
  studentName: string;
  branch: string;
  title: string;
  description: string;
  files: string[];
  timestamp: string;
  linesAdded: number;
  linesRemoved: number;
}

export interface MiniProjectRecord {
  id: string;
  name: string;
  subject: string;
  teamName: string;
  progress: number;
  nextMilestone: string;
  status: MiniProjectStatus;
  summary: string;
  branch: string;
  repoName: string;
  repoStatus: 'synced' | 'review' | 'behind';
  goals: string[];
  availableFiles: string[];
  members: MiniProjectMember[];
  tasks: MiniProjectTask[];
  activity: MiniProjectActivity[];
}

const jan = '2026-01';

export const defaultMiniProjects: MiniProjectRecord[] = [
  {
    id: 'dbms-mini-project',
    name: 'Library Management Mini Project',
    subject: 'DBMS (Database Management System)',
    teamName: 'Team Alpha',
    progress: 74,
    nextMilestone: 'Schema review - Jan 20',
    status: 'on-track',
    summary: 'Design a shared library database with schema notes, query drafts, and audit-ready updates.',
    branch: 'feature/library-schema',
    repoName: 'dbms/library-management-mini-project',
    repoStatus: 'synced',
    goals: [
      'Model entities and relationships clearly',
      'Track every schema and query change',
      'Document pushes so the teacher can review work student by student',
    ],
    availableFiles: [
      'schema.sql',
      'queries.sql',
      'seed-data.sql',
      'README.md',
      'er-diagram.png',
    ],
    members: [
      { id: 'isha-nair', name: 'Isha Nair', role: 'Schema Lead', currentFocus: 'Refining foreign keys and constraints' },
      { id: 'rohan-verma', name: 'Rohan Verma', role: 'Query Designer', currentFocus: 'Improving joins and reports' },
      { id: 'diya-mehta', name: 'Diya Mehta', role: 'Documentation Owner', currentFocus: 'Updating ER notes and edge cases' },
    ],
    tasks: [
      { id: 'dbms-task-1', title: 'Complete normalized schema draft', ownerId: 'isha-nair', status: 'done', updatedAt: `${jan}-08T10:00:00.000Z` },
      { id: 'dbms-task-2', title: 'Prepare report queries for circulation data', ownerId: 'rohan-verma', status: 'in-progress', updatedAt: `${jan}-10T13:00:00.000Z` },
      { id: 'dbms-task-3', title: 'Document assumptions and constraints', ownerId: 'diya-mehta', status: 'todo', updatedAt: `${jan}-11T09:00:00.000Z` },
    ],
    activity: [
      {
        id: 'dbms-act-1',
        type: 'commit',
        studentId: 'isha-nair',
        studentName: 'Isha Nair',
        branch: 'feature/library-schema',
        title: 'Add book, member, and issue tables',
        description: 'Created the base schema and added primary/foreign key relationships.',
        files: ['schema.sql', 'README.md'],
        timestamp: `${jan}-08T10:15:00.000Z`,
        linesAdded: 82,
        linesRemoved: 6,
      },
      {
        id: 'dbms-act-2',
        type: 'push',
        studentId: 'isha-nair',
        studentName: 'Isha Nair',
        branch: 'feature/library-schema',
        title: 'Push schema baseline to teacher review branch',
        description: 'Shared the initial schema so the teacher can review table structure.',
        files: ['schema.sql', 'README.md'],
        timestamp: `${jan}-08T10:30:00.000Z`,
        linesAdded: 82,
        linesRemoved: 6,
      },
      {
        id: 'dbms-act-3',
        type: 'pull',
        studentId: 'rohan-verma',
        studentName: 'Rohan Verma',
        branch: 'feature/library-schema',
        title: 'Pull latest schema before query drafting',
        description: 'Synced the latest schema changes before writing analytical queries.',
        files: ['schema.sql'],
        timestamp: `${jan}-10T13:10:00.000Z`,
        linesAdded: 0,
        linesRemoved: 0,
      },
    ],
  },
  {
    id: 'os-mini-project',
    name: 'CPU Scheduling Mini Project',
    subject: 'OS (Operating System)',
    teamName: 'Team Beta',
    progress: 58,
    nextMilestone: 'Scheduler demo - Jan 18',
    status: 'at-risk',
    summary: 'Build a simple scheduling visualizer and keep a clean activity log for every algorithm update.',
    branch: 'feature/scheduler-visualizer',
    repoName: 'os/cpu-scheduling-mini-project',
    repoStatus: 'review',
    goals: [
      'Implement FCFS, SJF, and Round Robin',
      'Record who changed simulation logic',
      'Make team sync easy for students and teachers',
    ],
    availableFiles: ['scheduler.ts', 'round-robin.ts', 'ui-notes.md', 'test-cases.json', 'results.md'],
    members: [
      { id: 'isha-nair', name: 'Isha Nair', role: 'UI Integrator', currentFocus: 'Improving execution timeline view' },
      { id: 'ananya-iyer', name: 'Ananya Iyer', role: 'Algorithm Owner', currentFocus: 'Tuning Round Robin logic' },
      { id: 'karan-shah', name: 'Karan Shah', role: 'Testing Owner', currentFocus: 'Expanding process test cases' },
    ],
    tasks: [
      { id: 'os-task-1', title: 'Implement Round Robin queue updates', ownerId: 'ananya-iyer', status: 'in-progress', updatedAt: `${jan}-09T11:00:00.000Z` },
      { id: 'os-task-2', title: 'Add test cases for starvation scenarios', ownerId: 'karan-shah', status: 'todo', updatedAt: `${jan}-10T14:00:00.000Z` },
      { id: 'os-task-3', title: 'Refine Gantt chart labels', ownerId: 'isha-nair', status: 'in-progress', updatedAt: `${jan}-11T08:00:00.000Z` },
    ],
    activity: [
      {
        id: 'os-act-1',
        type: 'commit',
        studentId: 'ananya-iyer',
        studentName: 'Ananya Iyer',
        branch: 'feature/scheduler-visualizer',
        title: 'Refactor Round Robin quantum updates',
        description: 'Cleaned queue rotation logic and added comments for each scheduling step.',
        files: ['round-robin.ts', 'scheduler.ts'],
        timestamp: `${jan}-09T11:20:00.000Z`,
        linesAdded: 47,
        linesRemoved: 18,
      },
      {
        id: 'os-act-2',
        type: 'push',
        studentId: 'ananya-iyer',
        studentName: 'Ananya Iyer',
        branch: 'feature/scheduler-visualizer',
        title: 'Push scheduler refactor for review',
        description: 'Shared updated queue handling for team merge and teacher review.',
        files: ['round-robin.ts', 'scheduler.ts'],
        timestamp: `${jan}-09T11:35:00.000Z`,
        linesAdded: 47,
        linesRemoved: 18,
      },
    ],
  },
  {
    id: 'mdm-mini-project',
    name: 'Community Impact Mini Project',
    subject: 'MDM (Multidisciplinary Minor)',
    teamName: 'Solo Track',
    progress: 86,
    nextMilestone: 'Reflection portfolio - Jan 25',
    status: 'on-track',
    summary: 'Prepare a small interdisciplinary portfolio and keep each revision visible like a lightweight repo history.',
    branch: 'feature/community-portfolio',
    repoName: 'mdm/community-impact-mini-project',
    repoStatus: 'synced',
    goals: [
      'Connect the minor topic to a real problem',
      'Track every reflection update clearly',
      'Show teacher-ready evidence for each change',
    ],
    availableFiles: ['reflection.md', 'case-study.md', 'references.md', 'slides-outline.md'],
    members: [
      { id: 'isha-nair', name: 'Isha Nair', role: 'Author', currentFocus: 'Strengthening impact reflection' },
    ],
    tasks: [
      { id: 'mdm-task-1', title: 'Finish problem statement and context', ownerId: 'isha-nair', status: 'done', updatedAt: `${jan}-05T09:00:00.000Z` },
      { id: 'mdm-task-2', title: 'Add citations and references', ownerId: 'isha-nair', status: 'in-progress', updatedAt: `${jan}-11T15:00:00.000Z` },
    ],
    activity: [
      {
        id: 'mdm-act-1',
        type: 'commit',
        studentId: 'isha-nair',
        studentName: 'Isha Nair',
        branch: 'feature/community-portfolio',
        title: 'Revise community problem framing',
        description: 'Updated the reflection to connect survey results with the final proposal.',
        files: ['reflection.md', 'case-study.md'],
        timestamp: `${jan}-11T15:20:00.000Z`,
        linesAdded: 28,
        linesRemoved: 9,
      },
      {
        id: 'mdm-act-2',
        type: 'push',
        studentId: 'isha-nair',
        studentName: 'Isha Nair',
        branch: 'feature/community-portfolio',
        title: 'Push revised reflection draft',
        description: 'Uploaded the latest draft so the mentor can review the narrative flow.',
        files: ['reflection.md', 'case-study.md'],
        timestamp: `${jan}-11T15:30:00.000Z`,
        linesAdded: 28,
        linesRemoved: 9,
      },
    ],
  },
  {
    id: 'dt-mini-project',
    name: 'Accessibility Redesign Mini Project',
    subject: 'DT (Design Thinking)',
    teamName: 'Team Gamma',
    progress: 42,
    nextMilestone: 'Prototype review - Jan 16',
    status: 'at-risk',
    summary: 'Run a short design sprint and make every ideation, prototype, and feedback update visible in a teacher-friendly log.',
    branch: 'feature/accessibility-redesign',
    repoName: 'dt/accessibility-redesign-mini-project',
    repoStatus: 'behind',
    goals: [
      'Capture empathy findings quickly',
      'Push prototype updates after each iteration',
      'Help the teacher identify who changed what',
    ],
    availableFiles: ['personas.md', 'journey-map.md', 'prototype-notes.md', 'feedback-log.md', 'handoff.md'],
    members: [
      { id: 'isha-nair', name: 'Isha Nair', role: 'Prototype Writer', currentFocus: 'Summarizing prototype iteration 2' },
      { id: 'diya-mehta', name: 'Diya Mehta', role: 'Research Lead', currentFocus: 'Consolidating interview insights' },
      { id: 'rohan-verma', name: 'Rohan Verma', role: 'Presenter', currentFocus: 'Updating final walkthrough notes' },
    ],
    tasks: [
      { id: 'dt-task-1', title: 'Finalize personas from interviews', ownerId: 'diya-mehta', status: 'done', updatedAt: `${jan}-07T08:00:00.000Z` },
      { id: 'dt-task-2', title: 'Write prototype interaction notes', ownerId: 'isha-nair', status: 'in-progress', updatedAt: `${jan}-11T16:30:00.000Z` },
      { id: 'dt-task-3', title: 'Prepare final presentation walkthrough', ownerId: 'rohan-verma', status: 'todo', updatedAt: `${jan}-12T07:30:00.000Z` },
    ],
    activity: [
      {
        id: 'dt-act-1',
        type: 'pull',
        studentId: 'isha-nair',
        studentName: 'Isha Nair',
        branch: 'feature/accessibility-redesign',
        title: 'Pull research notes before prototype update',
        description: 'Synced the latest persona and journey-map insights before editing prototype notes.',
        files: ['personas.md', 'journey-map.md'],
        timestamp: `${jan}-11T16:10:00.000Z`,
        linesAdded: 0,
        linesRemoved: 0,
      },
    ],
  },
];