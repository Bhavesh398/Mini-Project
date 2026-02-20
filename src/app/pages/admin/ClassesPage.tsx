import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/button';
import { Plus, Users, BookOpen } from 'lucide-react';

const departments = [
  { name: 'Computer Science', teachers: 8, students: 312, classes: 24 },
  { name: 'Mathematics', teachers: 12, students: 428, classes: 32 },
  { name: 'Physics', teachers: 6, students: 186, classes: 15 },
  { name: 'Chemistry', teachers: 7, students: 198, classes: 18 },
  { name: 'Biology', teachers: 9, students: 124, classes: 12 },
];

const mockClasses = [
  { id: 'CS-101-A', name: 'Intro to Programming', department: 'Computer Science', teacher: 'Prof. Arjun Patel', students: 32, schedule: 'MWF 9:00-10:30' },
  { id: 'MATH-201-B', name: 'Calculus II', department: 'Mathematics', teacher: 'Dr. Priya Sharma', students: 28, schedule: 'TTh 10:00-11:30' },
  { id: 'PHY-101-A', name: 'Physics I', department: 'Physics', teacher: 'Dr. Kavya Reddy', students: 30, schedule: 'MWF 13:00-14:30' },
  { id: 'CHEM-101-A', name: 'General Chemistry', department: 'Chemistry', teacher: 'Prof. Rajesh Kumar', students: 26, schedule: 'TTh 14:00-15:30' },
];

export function AdminClassesPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Classes & Structure</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage departments, classes, and course structure
            </p>
          </div>
          <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Class
          </Button>
        </div>

        {/* Departments Overview */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.name} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">{dept.name}</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Teachers</span>
                    <span className="font-medium text-gray-900 dark:text-white">{dept.teachers}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Students</span>
                    <span className="font-medium text-gray-900 dark:text-white">{dept.students}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Classes</span>
                    <span className="font-medium text-gray-900 dark:text-white">{dept.classes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Classes List */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Classes</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Class ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Students
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Schedule
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mockClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{cls.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{cls.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{cls.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{cls.teacher}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        {cls.students}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-400">{cls.schedule}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}