import { useState } from 'react';
import { ChevronUp, Lightbulb, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';

export interface PracticeQuestion {
  id: string;
  conceptName: string;
  question: string;
  explanation: string;
  hints: string[];
  importance: string;
}

interface PracticeInterfaceProps {
  question: PracticeQuestion;
  onSubmit: (answer: string) => void;
  onSkip: () => void;
  feedbackMessage?: string;
  feedbackStatus?: 'correct' | 'incorrect' | null;
}

export function PracticeInterface({
  question,
  onSubmit,
  onSkip,
  feedbackMessage,
  feedbackStatus,
}: PracticeInterfaceProps) {
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  const handleNextHint = () => {
    if (hintIndex < question.hints.length - 1) {
      setHintIndex(hintIndex + 1);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 transition-colors">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
          {question.conceptName}
        </p>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{question.question}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          This practice helps improve your understanding of {question.conceptName}.
        </p>
      </div>

      {/* Why This Matters */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <Lightbulb className="w-4 h-4 inline mr-2" />
          {question.importance}
        </p>
      </div>

      {/* Input Area */}
      <div className="mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter your answer..."
          rows={4}
          disabled={feedbackStatus !== null}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors"
        />
      </div>

      {/* Feedback */}
      {feedbackStatus && (
        <div className={`mb-6 p-4 rounded-lg border ${
          feedbackStatus === 'correct'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/40'
            : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/40'
        }`}>
          <div className="flex items-start gap-3">
            {feedbackStatus === 'correct' ? (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-semibold ${
                feedbackStatus === 'correct'
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-orange-900 dark:text-orange-100'
              }`}>
                {feedbackStatus === 'correct' ? 'Correct!' : 'Not quite right'}
              </p>
              <p className={`text-sm mt-1 ${
                feedbackStatus === 'correct'
                  ? 'text-green-800 dark:text-green-200'
                  : 'text-orange-800 dark:text-orange-200'
              }`}>
                {feedbackMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hints and Examples */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Hint Button */}
        <button
          onClick={() => setShowHint(!showHint)}
          disabled={feedbackStatus !== null}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
          Hint
        </button>

        {/* Example Button */}
        <button
          onClick={() => setShowExample(!showExample)}
          disabled={feedbackStatus !== null}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          Example
        </button>
      </div>

      {/* Hint Content */}
      {showHint && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/40 rounded-lg">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
            Hint: {question.hints[hintIndex]}
          </p>
          {question.hints.length > 1 && (
            <button
              onClick={handleNextHint}
              className="text-xs text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 flex items-center gap-1"
            >
              {hintIndex < question.hints.length - 1 ? 'Next hint' : 'No more hints'}
              {hintIndex < question.hints.length - 1 && <ChevronUp className="w-3 h-3" />}
            </button>
          )}
        </div>
      )}

      {/* Explanation / Learning Content */}
      {showExample && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/40 rounded-lg">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">Learning Explanation</p>
          <p className="text-sm text-purple-800 dark:text-purple-200">{question.explanation}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!answer.trim() || feedbackStatus !== null}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          Submit Answer
        </button>
        <button
          onClick={onSkip}
          disabled={feedbackStatus !== null}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
