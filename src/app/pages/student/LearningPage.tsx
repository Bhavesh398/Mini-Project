import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { ConceptList, type Concept } from '../../components/student/ConceptList';

export function LearningPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // Mock subjects
  const subjects = [
    { id: '1', name: 'Mathematics 101' },
    { id: '2', name: 'Physics Advanced' },
    { id: '3', name: 'English Literature' },
    { id: '4', name: 'Chemistry Lab' }
  ];

  // Mock concepts
  const concepts: Concept[] = [
    {
      id: 'c1',
      name: 'Algebraic Equations',
      status: 'mastered',
      progress: 100,
      lastPracticed: 'Today'
    },
    {
      id: 'c2',
      name: 'Quadratic Functions',
      status: 'practicing',
      progress: 72,
      lastPracticed: 'Yesterday'
    },
    {
      id: 'c3',
      name: 'Calculus Basics',
      status: 'practicing',
      progress: 45,
      lastPracticed: '2 days ago'
    },
    {
      id: 'c4',
      name: 'Complex Numbers',
      status: 'needs-focus',
      progress: 20,
      lastPracticed: '1 week ago'
    },
    {
      id: 'c5',
      name: 'Matrix Operations',
      status: 'needs-focus',
      progress: 35,
      lastPracticed: '3 days ago'
    }
  ];

  const handleSelectConcept = (conceptId: string) => {
    console.log('Selected concept:', conceptId);
    // Navigate to practice page
    // navigate(`/student/learning/${selectedSubject}/practice/${conceptId}`);
  };

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          {selectedSubject ? (
            <button
              onClick={() => setSelectedSubject(null)}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Subjects
            </button>
          ) : null}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {selectedSubject ? `Mathematics 101` : 'Learning Center'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedSubject ? 'Practice and master key concepts' : 'Select a subject to start learning'}
          </p>
        </div>

        {!selectedSubject ? (
          // Subject List View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{subject.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">5 chapters • 24 concepts</p>
              </button>
            ))}
          </div>
        ) : (
          // Concept List View
          <div className="space-y-6">
            {/* Units/Chapters */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Unit 1: Foundations</h2>
                <ConceptList concepts={concepts.slice(0, 2)} onSelectConcept={handleSelectConcept} />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Unit 2: Advanced Topics</h2>
                <ConceptList concepts={concepts.slice(2, 5)} onSelectConcept={handleSelectConcept} />
              </div>
            </div>

            {/* Learning Summary */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mastered</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">1</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Practicing</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">2</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Needs Focus</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">2</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
