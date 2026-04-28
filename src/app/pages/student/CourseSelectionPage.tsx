import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentLayout } from '../../components/student/StudentLayout';
import { getUserSession } from '../../services/auth';
import { SUBJECTS } from '../../data/subjects';
import { getFinalResult, getMarkStatus, getStudentUTSheet, type StudentMarksSheet } from '../../services/utMarks';

export function StudentCourseSelectionPage() {
  const navigate = useNavigate();
  const user = getUserSession();
  const studentName = user?.name || 'Student';
  const [studentSheet, setStudentSheet] = useState<StudentMarksSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;

    const loadMarks = async () => {
      if (!user || user.role !== 'student') return;

      try {
        const sheet = await getStudentUTSheet();
        if (mounted) {
          setStudentSheet(sheet);
        }
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to load student UT marks');
        }
        console.error('Failed to load student UT marks', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadMarks();

    return () => {
      mounted = false;
    };
  }, [user?.role]);

  if (!user) return null;

  if (user.role !== 'student') {
    return null;
  }

  if (error) {
    return (
      <StudentLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 p-6 text-red-800 dark:text-red-200 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600 dark:text-red-300">UT Marks</p>
            <h1 className="mt-2 text-2xl font-bold">Unable to load marks</h1>
            <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (loading || !studentSheet) {
    return (
      <StudentLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="rounded-2xl border border-orange-200/70 dark:border-orange-900/50 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 text-white shadow-xl">
            <h1 className="mt-2 text-3xl font-bold">UT Marks</h1>
            <p className="mt-2 text-sm text-white/85">Loading your examination marks...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  const utMarks = SUBJECTS.map((subject) => ({
    subject: subject.displayName,
    marks: studentSheet.marksBySubject[subject.id] ?? 0,
    status: getMarkStatus(studentSheet.marksBySubject[subject.id] ?? 0)
  }));
  const totalMarks = utMarks.reduce((sum, row) => sum + row.marks, 0);
  const maxMarks = utMarks.length * 20;
  const averageMarks = Math.round((totalMarks / utMarks.length) * 10) / 10;
  const finalResult = getFinalResult(studentSheet.marksBySubject);

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl border border-orange-200/70 dark:border-orange-900/50 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/75">Examination</p>
              <h1 className="mt-2 text-3xl font-bold">UT Marks</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85">
                Subject-wise UT marks are shown here for {studentName}. Any subject below 8 is marked FAIL and final result becomes KT.
              </p>
            </div>
            <div className="grid grid-cols-4 gap-3 text-center text-sm">
              <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-2xl font-bold">{totalMarks}</div>
                <div className="text-white/80">Total</div>
              </div>
              <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-2xl font-bold">{maxMarks}</div>
                <div className="text-white/80">Max</div>
              </div>
              <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-2xl font-bold">{averageMarks}</div>
                <div className="text-white/80">Avg</div>
              </div>
              <div className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-2xl font-bold">{finalResult}</div>
                <div className="text-white/80">Result</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">UT Subject Marks</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/60">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">UT Marks</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">Subject Result</th>
                </tr>
              </thead>
              <tbody>
                {utMarks.map((row, idx) => (
                  <tr
                    key={`${row.subject}-${idx}`}
                    className="border-b border-gray-200 dark:border-gray-700 odd:bg-gray-100 even:bg-gray-50 dark:odd:bg-gray-700/70 dark:even:bg-gray-700/40"
                  >
                    <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{row.subject}</td>
                    <td className="px-4 py-4 font-semibold text-gray-900 dark:text-white whitespace-nowrap">{row.marks}/20</td>
                    <td className={`px-4 py-4 whitespace-nowrap font-semibold ${row.status === 'FAIL' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {row.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
