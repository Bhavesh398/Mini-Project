import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Clock, Calendar as CalendarIcon, MoreVertical, Plus, X
} from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { getUserSession } from '../../services/auth';
import { getTeacherSubjects } from '../../data/subjects';
import {
  addStudentToClass,
  createTeacherClass,
  getClassStudents,
  getStudentDirectory,
  getTeacherClasses,
  type StudentDirectoryItem,
  type TeacherClass,
} from '../../services/teacherClasses';

interface TeacherClassView {
  id: string;
  name: string;
  students: number;
  status: 'active' | 'inactive';
  time: string;
  day: string;
}

export function TeacherClassesPage() {
  const navigate = useNavigate();
  const user = getUserSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState<TeacherClassView[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [showStudentPanelFor, setShowStudentPanelFor] = useState<string | null>(null);
  const [addingStudent, setAddingStudent] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentDirectory, setStudentDirectory] = useState<StudentDirectoryItem[]>([]);
  const [selectedDirectoryStudent, setSelectedDirectoryStudent] = useState('');

  const [newClass, setNewClass] = useState({
    name: '',
    subject: getTeacherSubjects(user?.email)[0]?.displayName ?? 'DBMS (Database Management System)',
    gradeLevel: 'Third Year',
    section: 'A',
    color: 'blue'
  });

  const scheduleBySubject: Record<string, { students: number; time: string; day: string; status: 'active' | 'inactive' }> = {
    dbms: { students: 28, time: '9:00 AM - 10:30 AM', day: 'Mon, Wed, Fri', status: 'active' },
    os: { students: 22, time: '11:00 AM - 12:30 PM', day: 'Tue, Thu', status: 'active' },
    mdm: { students: 25, time: '1:00 PM - 2:30 PM', day: 'Mon, Wed', status: 'active' },
    oe: { students: 19, time: '3:00 PM - 4:00 PM', day: 'Wed, Fri', status: 'active' },
    ct: { students: 24, time: '10:00 AM - 11:30 AM', day: 'Sat', status: 'active' }
  };

  const inferScheduleKey = (subject: string): string => {
    const normalized = subject.toLowerCase();
    if (normalized.includes('dbms')) return 'dbms';
    if (normalized.includes('operating') || normalized.includes('(os') || normalized === 'os') return 'os';
    if (normalized.includes('multidisciplinary') || normalized.includes('mdm')) return 'mdm';
    if (normalized.includes('open elective') || normalized.includes('(oe') || normalized === 'oe') return 'oe';
    if (normalized.includes('computational') || normalized.includes('ct')) return 'ct';
    return 'dbms';
  };

  const buildClassView = async (classRows: TeacherClass[]): Promise<TeacherClassView[]> => {
    const enriched = await Promise.all(
      classRows.map(async (classRow) => {
        const students = await getClassStudents(classRow.id).catch(() => []);
        const key = inferScheduleKey(classRow.subject);
        const schedule = scheduleBySubject[key] ?? { students: 0, time: '10:00 AM - 11:00 AM', day: 'Mon, Wed', status: 'active' as const };

        return {
          id: classRow.id,
          name: classRow.name,
          students: students.length,
          status: schedule.status,
          time: schedule.time,
          day: schedule.day
        };
      })
    );

    return enriched;
  };

  const loadClasses = async () => {
    try {
      setError('');
      const classRows = await getTeacherClasses();
      const viewRows = await buildClassView(classRows);
      setClasses(viewRows);
    } catch (apiError) {
      const fallback = getTeacherSubjects(user?.email).map((subject) => ({
        id: subject.id,
        name: subject.displayName,
        ...(scheduleBySubject[subject.id] ?? { students: 20, time: '10:00 AM - 11:00 AM', day: 'Mon, Wed', status: 'active' as const })
      }));
      setClasses(fallback);
      setError('Backend unavailable. Showing fallback class data.');
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
      return;
    }

    Promise.all([loadClasses(), getStudentDirectory().then(setStudentDirectory).catch(() => [])])
      .finally(() => setLoading(false));
  }, [user?.role, navigate]);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name.trim()) {
      setError('Class name is required.');
      return;
    }

    try {
      setCreatingClass(true);
      setError('');
      await createTeacherClass({
        name: newClass.name.trim(),
        subject: newClass.subject.trim(),
        gradeLevel: newClass.gradeLevel.trim(),
        section: newClass.section.trim() || undefined,
        color: newClass.color.trim() || 'blue'
      });
      await loadClasses();
      setShowCreateForm(false);
      setNewClass({
        name: '',
        subject: getTeacherSubjects(user?.email)[0]?.displayName ?? 'DBMS (Database Management System)',
        gradeLevel: 'Third Year',
        section: 'A',
        color: 'blue'
      });
    } catch (createError: any) {
      setError(createError?.message || 'Failed to create class.');
    } finally {
      setCreatingClass(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showStudentPanelFor) return;

    const emailToUse = studentEmail.trim() || (selectedDirectoryStudent
      ? studentDirectory.find((student) => student.id === selectedDirectoryStudent)?.email ?? ''
      : '');

    if (!emailToUse) {
      setError('Enter student email or select a student.');
      return;
    }

    try {
      setAddingStudent(true);
      setError('');
      await addStudentToClass(showStudentPanelFor, { studentEmail: emailToUse });
      await loadClasses();
      setStudentEmail('');
      setSelectedDirectoryStudent('');
    } catch (addError: any) {
      setError(addError?.message || 'Failed to add student.');
    } finally {
      setAddingStudent(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
          <div className="text-gray-500 dark:text-gray-400">Loading...</div>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Classes Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Classes</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and view all your classes</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Add New Class
          </button>
        </div>

        {error ? (
          <div className="rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/30 p-3">
            <p className="text-sm text-orange-700 dark:text-orange-300">{error}</p>
          </div>
        ) : null}

        {showCreateForm ? (
          <form onSubmit={handleCreateClass} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Class</h2>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={newClass.name}
                onChange={(event) => setNewClass((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Class name (e.g. DBMS - B)"
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newClass.subject}
                onChange={(event) => setNewClass((prev) => ({ ...prev, subject: event.target.value }))}
                placeholder="Subject"
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newClass.gradeLevel}
                onChange={(event) => setNewClass((prev) => ({ ...prev, gradeLevel: event.target.value }))}
                placeholder="Grade/Semester"
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <input
                value={newClass.section}
                onChange={(event) => setNewClass((prev) => ({ ...prev, section: event.target.value }))}
                placeholder="Section"
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={creatingClass}
              className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {creatingClass ? 'Creating...' : 'Create Class'}
            </button>
          </form>
        ) : null}

        {/* Classes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all cursor-pointer overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {classItem.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        classItem.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {classItem.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.students} Students
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {classItem.day}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-lg transition-colors">
                    View Details
                  </button>
                  <button
                    onClick={() => setShowStudentPanelFor(classItem.id)}
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                  >
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showStudentPanelFor ? (
          <form onSubmit={handleAddStudent} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Student to Class</h2>
              <button
                type="button"
                onClick={() => {
                  setShowStudentPanelFor(null);
                  setStudentEmail('');
                  setSelectedDirectoryStudent('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={studentEmail}
                onChange={(event) => setStudentEmail(event.target.value)}
                placeholder="Student email"
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
              <select
                value={selectedDirectoryStudent}
                onChange={(event) => setSelectedDirectoryStudent(event.target.value)}
                className="rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="">Select from active students</option>
                {studentDirectory.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.email})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={addingStudent}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
            >
              {addingStudent ? 'Adding...' : 'Add Student'}
            </button>
          </form>
        ) : null}
      </div>
    </TeacherLayout>
  );
}
