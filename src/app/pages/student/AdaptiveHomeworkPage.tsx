import { useMemo, useState } from 'react';
import { Clock, Info, Lightbulb, Sparkles, ChevronRight, ChevronDown, CheckCircle, RotateCcw, BookOpen, Activity, Brain } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';

interface Question {
  id: string;
  prompt: string;
  concept: string;
  type: 'numeric' | 'text';
  answer: string;
  hints: string[];
  example: string;
  rationale: string;
  difficulty: 'foundational' | 'core' | 'stretch';
}

export function AdaptiveHomeworkPage() {
  const questions: Question[] = [
    {
      id: 'q1',
      prompt: 'Solve for x: 3x + 7 = 25. What is the value of x?',
      concept: 'Balancing linear equations',
      type: 'numeric',
      answer: '6',
      hints: [
        'Try isolating the term with x by subtracting 7 from both sides first.',
        'After removing the constant, divide both sides by 3 to solve for x.'
      ],
      example: 'For 2x + 4 = 14, subtract 4 to get 2x = 10, then divide by 2 to get x = 5.',
      rationale: 'You recently missed problems that required isolating x after moving a constant.',
      difficulty: 'foundational'
    },
    {
      id: 'q2',
      prompt: 'Solve for x: 5x - 2 = 3x + 14. What is x?',
      concept: 'Variables on both sides',
      type: 'numeric',
      answer: '8',
      hints: [
        'Move all x terms to one side: subtract 3x from both sides.',
        'After combining like terms, isolate x by adding 2 and then dividing.'
      ],
      example: 'For 4x - 5 = 2x + 7, subtract 2x to get 2x - 5 = 7, add 5 to get 2x = 12, then x = 6.',
      rationale: 'This checks that you can collect like terms before solving.',
      difficulty: 'core'
    },
    {
      id: 'q3',
      prompt: 'Create and solve a similar equation: 2x + 9 = x + 18. What is x?',
      concept: 'Rearranging and balancing',
      type: 'numeric',
      answer: '9',
      hints: [
        'Bring the x terms together: subtract x from both sides.',
        'Then remove the constant on the x side before dividing.'
      ],
      example: 'For 3x + 4 = x + 16, subtract x to get 2x + 4 = 16, subtract 4 to get 2x = 12, then x = 6.',
      rationale: 'This stretches the skill by asking you to apply the same pattern once more.',
      difficulty: 'stretch'
    }
  ];

  const totalQuestions = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect' | 'complete'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [masteryDelta, setMasteryDelta] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const remaining = totalQuestions - completedCount - (feedback === 'correct' ? 1 : 0);

  const normalizeAnswer = (value: string) => value.trim().toLowerCase();

  const checkAnswer = (userValue: string, answer: string, type: Question['type']) => {
    if (type === 'numeric') {
      const userNum = Number(userValue);
      const ansNum = Number(answer);
      if (!Number.isNaN(userNum) && !Number.isNaN(ansNum)) {
        return Math.abs(userNum - ansNum) < 0.0001;
      }
    }
    return normalizeAnswer(userValue) === normalizeAnswer(answer);
  };

  const handleSubmit = () => {
    if (!input.trim() || feedback === 'complete') return;

    const isCorrect = checkAnswer(input, currentQuestion.answer, currentQuestion.type);

    if (isCorrect) {
      setFeedback('correct');
      setFeedbackMessage('Nice work—this matches the expected solution. We will nudge difficulty slightly for the next one.');
      setMasteryDelta((prev) => prev + 4);
      setCompletedCount((prev) => (feedback === 'correct' ? prev : prev + 1));
      setShowHint(false);
      setShowExample(false);
    } else {
      setFeedback('incorrect');
      setFeedbackMessage('Close. Re-check how you isolate x. Try moving all x terms to one side, then constants to the other.');
      setShowHint(true);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= totalQuestions) {
      setFeedback('complete');
      setFeedbackMessage('Good progress today. You are closer to mastering this concept.');
      return;
    }
    setCurrentIndex(nextIndex);
    setInput('');
    setShowHint(false);
    setShowExample(false);
    setFeedback('idle');
    setFeedbackMessage('');
  };

  const handleRetry = () => {
    setInput('');
    setFeedback('idle');
    setFeedbackMessage('');
    setShowExample(false);
  };

  const completionSummary = (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <CheckCircle className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Adaptive practice complete</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Good progress today. You are closer to mastering this concept.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Time spent (est.)</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">~18 minutes</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Concepts practiced</p>
          <p className="text-base font-semibold text-gray-900 dark:text-white">Linear equations (variables both sides)</p>
        </div>
        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">Mastery change</p>
          <p className="text-base font-semibold text-green-600">+{masteryDelta}%</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
        <Sparkles className="w-4 h-4" />
        <span>Next: we will introduce mixed-form equations once this concept is steady.</span>
      </div>
    </div>
  );

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <BookOpen className="w-4 h-4" />
              <span>Algebra • Linear Equations</span>
              <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" /> ~18 minutes
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h1 className="text-2xl font-semibold">Adaptive Practice: Linear Equations</h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This homework is personalized based on your recent learning progress.
            </p>
          </div>
        </header>

        {/* Context */}
        <section className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Homework focus</h2>
                <span className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  Adaptive • No grades
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Focus concept</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">Solving linear equations</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Variables on both sides</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Current mastery</p>
                  <p className="text-sm font-semibold text-amber-600">58% • Improving</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recent gains from practice</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Target mastery</p>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Goal: 70%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">We adjust as you improve</p>
                </div>
              </div>
              <button
                onClick={() => setWhyExpanded((prev) => !prev)}
                className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200"
              >
                {whyExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                Why you are seeing this homework
              </button>
              {whyExpanded && (
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  You had difficulty with isolating the variable when terms appear on both sides. These questions focus only on that skill so you can build confidence without extra repetition.
                </div>
              )}
            </div>

            {/* Adaptive Practice */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Adaptive practice</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">One question at a time • No timer • No grades</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                  <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700/60 text-gray-800 dark:text-gray-200">
                    Completed: {completedCount + (feedback === 'correct' ? 1 : 0)} / {totalQuestions}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    Mastery change: {masteryDelta >= 0 ? '+' : ''}{masteryDelta}%
                  </span>
                </div>
              </div>

              {feedback === 'complete' ? (
                completionSummary
              ) : (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Question {currentIndex + 1} of {totalQuestions}</p>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{currentQuestion.prompt}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Focus: {currentQuestion.concept}</p>
                  </div>

                  <div className="space-y-3">
                    <input
                      type={currentQuestion.type === 'numeric' ? 'number' : 'text'}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your answer"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setShowHint(true)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Hint
                      </button>
                      <button
                        onClick={() => setShowExample((prev) => !prev)}
                        className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Example
                      </button>
                      {feedback === 'incorrect' && (
                        <button
                          onClick={handleRetry}
                          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Retry
                        </button>
                      )}
                      {feedback === 'correct' && (
                        <button
                          onClick={handleNext}
                          className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-colors"
                        >
                          Next question
                        </button>
                      )}
                    </div>
                  </div>

                  {showHint && (
                    <div className="rounded-lg border border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                        <Lightbulb className="w-4 h-4" />
                        Guided hints (no full answers)
                      </div>
                      <ul className="list-disc list-inside text-sm text-blue-900 dark:text-blue-100 space-y-1">
                        {currentQuestion.hints.map((hint, idx) => (
                          <li key={idx}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {showExample && (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 text-sm text-gray-700 dark:text-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-gray-900 dark:text-white">Worked example</span>
                      </div>
                      <p>{currentQuestion.example}</p>
                    </div>
                  )}

                  {feedback !== 'idle' && feedback !== 'complete' && (
                    <div
                      className={`rounded-lg p-4 border text-sm space-y-1 ${
                        feedback === 'correct'
                          ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-900/30 dark:text-green-100'
                          : 'border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100'
                      }`}
                    >
                      <p className="font-medium flex items-center gap-2">
                        {feedback === 'correct' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        {feedbackMessage}
                      </p>
                      {feedback === 'incorrect' && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          We will keep the difficulty steady and offer a similar practice if needed.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Remaining questions: {Math.max(remaining, 0)}</span>
                    <span>Adaptive mode: adjusts gently based on each answer</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right panel */}
          <aside className="xl:block">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setPanelOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Practice context
                </span>
                {panelOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {panelOpen && (
                <div className="p-4 space-y-4">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Concept</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Linear equations with variables on both sides</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We focus only on the part you need next.</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Mastery trend</p>
                    <div className="flex items-end gap-1 h-16">
                      {[58, 60, 62, 63, 65, 66].map((value, idx) => (
                        <div
                          key={idx}
                          className="flex-1 rounded bg-blue-200 dark:bg-blue-800"
                          style={{ height: `${Math.max(10, value / 2)}%` }}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300">Steady improvement (+8% over last sessions)</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-100">
                    <p className="font-semibold">Tips</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Keep x terms on one side, constants on the other.</li>
                      <li>Work line by line to avoid slips.</li>
                      <li>If you feel stuck, use the example—not just the hint.</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200">
                    <p className="font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Take a short break
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">If you have been working for a while, pause for a minute to stay fresh.</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </section>
      </div>
    </StudentLayout>
  );
}
