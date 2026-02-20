import { StudentLayout } from '../../components/student/StudentLayout';
import { BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

interface Assessment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
}

export function AssessmentsPage() {
  const assessments: Assessment[] = [
    {
      id: '1',
      title: 'Mathematics Quiz 5',
      subject: 'Mathematics 101',
      dueDate: 'Jan 10, 2026',
      status: 'graded',
      score: 92
    },
    {
      id: '2',
      title: 'Physics Midterm',
      subject: 'Physics Advanced',
      dueDate: 'Jan 15, 2026',
      status: 'pending'
    },
    {
      id: '3',
      title: 'English Essay',
      subject: 'English Literature',
      dueDate: 'Jan 12, 2026',
      status: 'submitted'
    },
    {
      id: '4',
      title: 'Chemistry Lab Test',
      subject: 'Chemistry Lab',
      dueDate: 'Jan 18, 2026',
      status: 'pending'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'submitted':
        return <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'graded':
        return 'Graded';
      case 'submitted':
        return 'Submitted';
      case 'pending':
        return 'Pending';
      default:
        return '';
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Assessments</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your quizzes, tests, and assignments
          </p>
        </div>

        {/* Assessments List */}
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors hover:shadow-sm"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{assessment.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{assessment.subject}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(assessment.status)}
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    assessment.status === 'graded' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    assessment.status === 'submitted' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                  }`}>
                    {getStatusLabel(assessment.status)}
                  </span>
                </div>
              </div>

              {/* Score (if graded) */}
              {assessment.score !== undefined && (
                <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30">
                  <p className="text-sm text-green-900 dark:text-green-100">
                    <span className="font-semibold">Score:</span> {assessment.score}% - Excellent performance!
                  </p>
                </div>
              )}

              {/* Info */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Due: {assessment.dueDate}</span>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                  {assessment.status === 'pending' ? 'Take Assessment' :
                   assessment.status === 'submitted' ? 'View Submission' :
                   'View Results'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Statistics Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assessment Summary</h3>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">88%</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">2</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Pending</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</p>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
