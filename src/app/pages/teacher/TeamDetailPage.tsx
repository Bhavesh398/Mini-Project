import { useState } from 'react';
import { ChevronLeft, Download, Share2, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { TeacherLayout } from '../../components/teacher/TeacherLayout';
import { ContributionBreakdown, type StudentContribution } from '../../components/pbl/ContributionBreakdown';
import { FeedbackSection, type FeedbackItem } from '../../components/pbl/FeedbackSection';

export function TeamDetailPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'feedback'>('overview');

  // Mock team data
  const team = {
    id: 't2',
    name: 'Team Beta',
    project: 'Build a Weather App',
    progress: 65,
    status: 'at-risk'
  };

  // Mock student contributions
  const students: StudentContribution[] = [
    {
      id: 's1',
      name: 'Ananya Iyer',
      tasksCompleted: 12,
      tasksPending: 3,
      lastContribution: '2 hours ago',
      participationPercent: 92,
      status: 'active'
    },
    {
      id: 's2',
      name: 'Rohan Verma',
      tasksCompleted: 8,
      tasksPending: 7,
      lastContribution: '1 day ago',
      participationPercent: 68,
      status: 'low-activity'
    },
    {
      id: 's3',
      name: 'Diya Patel',
      tasksCompleted: 10,
      tasksPending: 5,
      lastContribution: '4 hours ago',
      participationPercent: 85,
      status: 'active'
    },
    {
      id: 's4',
      name: 'Karan Shah',
      tasksCompleted: 2,
      tasksPending: 13,
      lastContribution: '1 week ago',
      participationPercent: 22,
      status: 'inactive'
    }
  ];

  // Mock submissions
  const submissions = [
    {
      id: 'sub1',
      title: 'API Documentation',
      submittedBy: 'Alice Johnson',
      submittedDate: '2026-01-06',
      status: 'approved',
      feedback: 'Great work on the documentation. Very clear and comprehensive.'
    },
    {
      id: 'sub2',
      title: 'Frontend Mockups',
      submittedBy: 'Carol White',
      submittedDate: '2026-01-05',
      status: 'pending-feedback',
      feedback: null
    },
    {
      id: 'sub3',
      title: 'Database Schema',
      submittedBy: 'Alice Johnson',
      submittedDate: '2026-01-04',
      status: 'approved',
      feedback: 'Schema looks solid. Consider indexing on user_id for performance.'
    },
    {
      id: 'sub4',
      title: 'Code Review Notes',
      submittedBy: 'Bob Smith',
      submittedDate: '2025-12-30',
      status: 'approved',
      feedback: 'Good observations. Apply these to your own code.'
    }
  ];

  // Mock feedback items
  const feedbackItems: FeedbackItem[] = [
    {
      id: 'fb1',
      studentName: 'Rohan Verma',
      submissionTitle: 'Frontend Mockups',
      manualFeedback: '',
      suggestedFeedback: 'The mockups show good visual design, but consider improving the error state designs and adding more spacing between elements.',
      status: 'draft'
    },
    {
      id: 'fb2',
      studentName: 'Karan Shah',
      submissionTitle: 'API Documentation',
      manualFeedback: 'David, I noticed you haven\'t submitted your API documentation draft yet. Let\'s discuss your progress in class.',
      suggestedFeedback: 'Consider reaching out for additional support. The API documentation is crucial for team coordination.',
      status: 'draft'
    }
  ];

  const handleSendFeedback = (feedbackId: string, content: string) => {
    console.log('Send feedback:', feedbackId, content);
    // In real app, send feedback to backend
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Navigation */}
        <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Back to Project
        </button>

        {/* Team Header */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 transition-colors">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{team.project}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{team.progress}%</p>
              <p className={`text-sm font-semibold mt-1 ${
                team.status === 'at-risk' ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
              }`}>
                {team.status === 'at-risk' ? '⚠️ At Risk' : '✓ On Track'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message Team
            </button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Schedule Check-in
            </button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {['overview', 'submissions', 'feedback'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ContributionBreakdown students={students} />
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Work Submissions</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{submissions.length} submissions</p>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {submissions.map((submission) => (
                <div key={submission.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{submission.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Submitted by {submission.submittedBy} on {submission.submittedDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.status === 'approved' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-xs font-semibold text-green-700 dark:text-green-400">Approved</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-orange-500" />
                          <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  {submission.feedback && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border-l-2 border-blue-500">
                      "{submission.feedback}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {feedbackItems.map((item) => (
              <FeedbackSection
                key={item.id}
                feedback={item}
                onSendFeedback={handleSendFeedback}
              />
            ))}
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}
