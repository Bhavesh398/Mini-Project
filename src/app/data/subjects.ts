export interface SubjectDefinition {
  id: string;
  code: string;
  name: string;
  displayName: string;
}

interface TeacherSubjectAssignment {
  email: string;
  subjectIds: string[];
}

export const SUBJECTS: SubjectDefinition[] = [
  {
    id: 'dbms',
    code: 'DBMS',
    name: 'Database Management System',
    displayName: 'DBMS (Database Management System)',
  },
  {
    id: 'os',
    code: 'OS',
    name: 'Operating System',
    displayName: 'OS (Operating System)',
  },
  {
    id: 'mdm',
    code: 'MDM',
    name: 'Multidisciplinary Minor',
    displayName: 'MDM (Multidisciplinary Minor)',
  },
  {
    id: 'oe',
    code: 'OE',
    name: 'Open Elective',
    displayName: 'OE (Open Elective)',
  },
  {
    id: 'ct',
    code: 'CT',
    name: 'Computational Theory',
    displayName: 'CT (Computational Theory)',
  },
];

const TEACHER_SUBJECT_ASSIGNMENTS: TeacherSubjectAssignment[] = [
  { email: 'mritunjay@gmail.com', subjectIds: ['ct'] },
  { email: 'babita@gmail.com', subjectIds: ['os'] },
  { email: 'mamta@gmail.com', subjectIds: ['mdm'] },
  { email: 'vandana@gmail.com', subjectIds: ['dbms'] },
  { email: 'teacher_oe@gmail.com', subjectIds: ['oe'] }
];

export const SUBJECT_DISPLAY_NAMES = SUBJECTS.map((subject) => subject.displayName);

export function getSubjectDisplayName(subjectId: string): string {
  return SUBJECTS.find((subject) => subject.id === subjectId)?.displayName ?? subjectId;
}

export function getTeacherSubjectIds(email?: string): string[] {
  if (!email) return SUBJECTS.map((subject) => subject.id);

  const normalizedEmail = email.trim().toLowerCase();
  const assignment = TEACHER_SUBJECT_ASSIGNMENTS.find((item) => item.email === normalizedEmail);
  if (!assignment) return SUBJECTS.map((subject) => subject.id);
  return assignment.subjectIds;
}

export function getTeacherSubjects(email?: string): SubjectDefinition[] {
  const allowedIds = new Set(getTeacherSubjectIds(email));
  return SUBJECTS.filter((subject) => allowedIds.has(subject.id));
}