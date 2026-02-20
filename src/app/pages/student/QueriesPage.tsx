import { useState } from 'react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { Send, Check, Clock, MessageCircle } from 'lucide-react';

interface Query {
  id: string;
  title: string;
  subject: string;
  postedDate: string;
  status: 'pending' | 'answered' | 'resolved';
  lastResponse?: string;
}

export function QueriesPage() {
  const [queryType, setQueryType] = useState<'ask' | 'list'>('list');
  const [newQuery, setNewQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const queries: Query[] = [
    {
      id: '1',
      title: 'How do I approach quadratic equations with complex roots?',
      subject: 'Mathematics 101',
      postedDate: 'Jan 5, 2026',
      status: 'answered',
      lastResponse: 'Check the learning materials on complex numbers. Your teacher replied to your query.'
    },
    {
      id: '2',
      title: 'Can you clarify the concept of wave interference?',
      subject: 'Physics Advanced',
      postedDate: 'Jan 7, 2026',
      status: 'pending',
      lastResponse: undefined
    },
    {
      id: '3',
      title: "Shakespeare's use of metaphor in Hamlet",
      subject: 'English Literature',
      postedDate: 'Jan 4, 2026',
      status: 'resolved',
      lastResponse: 'Your teacher provided detailed feedback on the essay.'
    },
    {
      id: '4',
      title: 'Safe handling procedures for reactive chemicals',
      subject: 'Chemistry Lab',
      postedDate: 'Jan 6, 2026',
      status: 'answered',
      lastResponse: 'AI Assistant provided guidance based on lab safety protocols.'
    }
  ];

  const subjects = ['Mathematics 101', 'Physics Advanced', 'English Literature', 'Chemistry Lab'];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'answered':
        return <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'resolved':
        return <Check className="w-5 h-5 text-green-600 dark:text-green-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Awaiting Response';
      case 'answered':
        return 'Answered';
      case 'resolved':
        return 'Resolved';
      default:
        return '';
    }
  };

  const handleSubmitQuery = () => {
    if (newQuery.trim() && selectedSubject) {
      console.log('Submit query:', { query: newQuery, subject: selectedSubject });
      setNewQuery('');
      setSelectedSubject('');
      setQueryType('list');
    }
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Queries & Help</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ask questions to your teacher or AI assistant
          </p>
        </div>

        {/* Query Type Selector */}
        <div className="flex gap-3">
          <button
            onClick={() => setQueryType('list')}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              queryType === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            My Queries
          </button>
          <button
            onClick={() => setQueryType('ask')}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              queryType === 'ask'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Ask New Query
          </button>
        </div>

        {queryType === 'ask' ? (
          // Ask New Query Form
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Ask a Question</h2>

            {/* Subject Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Query Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Your Question
              </label>
              <textarea
                value={newQuery}
                onChange={(e) => setNewQuery(e.target.value)}
                placeholder="Be specific and clear about what you're asking..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Be clear and specific. If you're asking about a concept, mention what you've already tried.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmitQuery}
                disabled={!newQuery.trim() || !selectedSubject}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Post Query
              </button>
              <button
                onClick={() => {
                  setNewQuery('');
                  setSelectedSubject('');
                  setQueryType('list');
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Queries List
          <div className="space-y-4">
            {queries.map((query) => (
              <div
                key={query.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors hover:shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{query.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{query.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(query.status)}
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      query.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      query.status === 'answered' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>
                      {getStatusLabel(query.status)}
                    </span>
                  </div>
                </div>

                {/* Response Info */}
                {query.lastResponse && (
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      <span className="font-semibold">Response:</span> {query.lastResponse}
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-600 dark:text-gray-400">Posted: {query.postedDate}</span>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                    {query.status === 'pending' ? 'View Details' : 'Read Response'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
