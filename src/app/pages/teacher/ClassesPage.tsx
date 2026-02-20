import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Clock, Calendar as CalendarIcon, MoreVertical, Plus 
} from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { getUserSession } from '../../services/auth';

export function TeacherClassesPage() {
  const navigate = useNavigate();
  const user = getUserSession();
  const [loading, setLoading] = useState(true);

  // Sample classes data
  const classes = [
    { id: 1, name: 'Mathematics 101', students: 28, status: 'active', time: '9:00 AM - 10:30 AM', day: 'Mon, Wed, Fri' },
    { id: 2, name: 'Physics Advanced', students: 22, status: 'active', time: '11:00 AM - 12:30 PM', day: 'Tue, Thu' },
    { id: 3, name: 'English Literature', students: 25, status: 'active', time: '1:00 PM - 2:30 PM', day: 'Mon, Wed, Fri' },
    { id: 4, name: 'Chemistry Lab', students: 20, status: 'active', time: '3:00 PM - 4:30 PM', day: 'Tue, Thu' },
    { id: 5, name: 'History Seminar', students: 18, status: 'inactive', time: '10:00 AM - 11:30 AM', day: 'Sat' },
  ];

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [user?.role, navigate]);

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
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
            <Plus className="w-5 h-5" />
            Add New Class
          </button>
        </div>

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
                  <button className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeacherLayout>
  );
}
