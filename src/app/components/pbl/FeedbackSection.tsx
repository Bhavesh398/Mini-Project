import { Check, Send, Lightbulb, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export interface FeedbackItem {
  id: string;
  studentName: string;
  submissionTitle: string;
  manualFeedback: string;
  suggestedFeedback: string;
  status: 'draft' | 'sent' | 'responded';
}

interface FeedbackSectionProps {
  feedback: FeedbackItem;
  onSendFeedback: (feedbackId: string, content: string) => void;
}

export function FeedbackSection({ feedback, onSendFeedback }: FeedbackSectionProps) {
  const [manualFeedback, setManualFeedback] = useState(feedback.manualFeedback);
  const [useSuggested, setUseSuggested] = useState(false);
  const [submitted, setSubmitted] = useState(feedback.status === 'sent' || feedback.status === 'responded');

  const handleSendFeedback = () => {
    const feedbackToSend = useSuggested 
      ? `${feedback.suggestedFeedback}\n\n${manualFeedback}` 
      : manualFeedback;
    
    onSendFeedback(feedback.id, feedbackToSend);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Feedback Sent</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your feedback to {feedback.studentName} has been delivered.
          </p>
          {feedback.status === 'responded' && (
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
              ✓ Student has viewed and responded
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 bg-gray-50 dark:bg-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Feedback for {feedback.studentName}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Submission: {feedback.submissionTitle}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Manual Feedback Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Your Feedback
          </label>
          <textarea
            value={manualFeedback}
            onChange={(e) => setManualFeedback(e.target.value)}
            placeholder="Write your feedback here... Be specific and constructive."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Clear, specific feedback helps students improve.</p>
        </div>

        {/* AI Suggested Feedback */}
        <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 transition-colors">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="checkbox"
                  checked={useSuggested}
                  onChange={(e) => setUseSuggested(e.target.checked)}
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-semibold text-gray-900 dark:text-white">AI-Suggested Feedback (optional)</span>
              </label>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded border border-blue-100 dark:border-blue-900">
                "{feedback.suggestedFeedback}"
              </p>

              <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                ℹ️ Suggestions are for your review only. You must explicitly approve before sending.
              </p>
            </div>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSendFeedback}
            disabled={!manualFeedback.trim()}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Approve & Send
          </button>
          <button
            onClick={() => setManualFeedback('')}
            className="px-4 py-3 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
