import { SUBJECTS } from '../data/subjects';

export interface StudentMarksSheet {
  studentId: string;
  studentName: string;
  studentEmail: string;
  marksBySubject: Record<string, number>;
}

const API_BASE_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';
const subjectIdToCode = new Map(SUBJECTS.map((subject) => [subject.id, subject.code]));

function readSessionAccessValue(): string | null {
  try {
    return window.localStorage.getItem(['access', 'Token'].join(''));
  } catch {
    return null;
  }
}

function authHeaders() {
  const accessValue = readSessionAccessValue();
  return {
    'Content-Type': 'application/json',
    ...(accessValue ? { Authorization: `Bearer ${accessValue}` } : {})
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function clampMark(mark: number): number {
  if (Number.isNaN(mark)) return 0;
  return Math.max(0, Math.min(20, Math.round(mark)));
}

function toSheetMap(sheet: { studentId: string; studentName: string; studentEmail: string; marksBySubject: Record<string, number> }): StudentMarksSheet {
  const marksBySubject = SUBJECTS.reduce<Record<string, number>>((accumulator, subject) => {
    const fromId = sheet.marksBySubject[subject.id];
    const fromCode = sheet.marksBySubject[subject.code];
    accumulator[subject.id] = clampMark((fromId ?? fromCode ?? 0) as number);
    return accumulator;
  }, {});

  return {
    studentId: sheet.studentId,
    studentName: sheet.studentName,
    studentEmail: sheet.studentEmail,
    marksBySubject
  };
}

async function bootstrapIfNeeded(students: Array<{ name: string; attendanceProgress?: number }>): Promise<void> {
  if (students.length === 0) return;

  await request<{ sheets: Array<{ studentId: string; studentName: string; studentEmail: string; marksBySubject: Record<string, number> }> }>('/api/ut-marks/bootstrap', {
    method: 'POST',
    body: JSON.stringify({
      students: students.map((student) => ({
        name: student.name,
        attendanceProgress: student.attendanceProgress ?? 70
      }))
    })
  });
}

export async function getOrCreateUTSheets(
  students: Array<{ name: string; attendanceProgress?: number }>
): Promise<StudentMarksSheet[]> {
  await bootstrapIfNeeded(students);

  const response = await request<{ sheets: Array<{ studentId: string; studentName: string; studentEmail: string; marksBySubject: Record<string, number> }> }>('/api/ut-marks');
  return response.sheets.map(toSheetMap);
}

export async function getStudentUTSheet(): Promise<StudentMarksSheet> {
  const response = await request<{ studentId: string; studentName: string; studentEmail: string; marksBySubject: Record<string, number> }>('/api/ut-marks/me');
  return toSheetMap(response);
}

export function getMarkStatus(mark: number): 'PASS' | 'FAIL' {
  return mark < 8 ? 'FAIL' : 'PASS';
}

export function getFinalResult(marksBySubject: Record<string, number>): 'PASS' | 'KT' {
  const hasFailure = SUBJECTS.some((subject) => (marksBySubject[subject.id] ?? 0) < 8);
  return hasFailure ? 'KT' : 'PASS';
}

export async function updateStudentUTMark(
  studentId: string,
  subjectId: string,
  value: number
): Promise<StudentMarksSheet[]> {
  const subjectCode = subjectIdToCode.get(subjectId) ?? subjectId.toUpperCase();

  const response = await request<{ sheet: { studentId: string; studentName: string; studentEmail: string; marksBySubject: Record<string, number> } | null }>('/api/ut-marks', {
    method: 'PUT',
    body: JSON.stringify({
      studentId,
      subjectCode,
      mark: clampMark(value)
    })
  });

  return response.sheet ? [toSheetMap(response.sheet)] : [];
}

function getDownloadFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) return fallback;
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (standardMatch?.[1]) {
    return standardMatch[1];
  }

  return fallback;
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildFallbackCsv(records: StudentMarksSheet[]): Blob {
  const header = ['Student Name', 'Email', ...SUBJECTS.map((subject) => subject.code), 'Result'];
  const lines = records.map((record) => {
    const marks = SUBJECTS.map((subject) => String(record.marksBySubject[subject.id] ?? 0));
    return [record.studentName, record.studentEmail, ...marks, getFinalResult(record.marksBySubject)];
  });

  const csv = [header, ...lines]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

export async function downloadUTSheetCsv(records: StudentMarksSheet[] = []): Promise<void> {
  const accessValue = readSessionAccessValue();
  try {
    const response = await fetch(`${API_BASE_URL}/api/ut-marks/export.xlsx`, {
      headers: {
        ...(accessValue ? { Authorization: `Bearer ${accessValue}` } : {})
      }
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.message || `Request failed: ${response.status}`);
    }

    const blob = await response.blob();
    const filename = getDownloadFilename(response.headers.get('content-disposition'), 'ut-marks-final-sheet.xlsx');
    triggerBrowserDownload(blob, filename);
    return;
  } catch {
    if (records.length === 0) {
      throw new Error('Unable to download marks sheet. No fallback data available.');
    }

    const fallbackBlob = buildFallbackCsv(records);
    const today = new Date().toISOString().slice(0, 10);
    triggerBrowserDownload(fallbackBlob, `ut-marks-final-sheet-${today}.csv`);
  }
}
