import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { StudentLayout } from '../../components/student/StudentLayout';
import { ConceptList, type Concept } from '../../components/student/ConceptList';
import { SUBJECTS, getSubjectDisplayName } from '../../data/subjects';
import { getTeacherSubjects } from '../../data/subjects';
import { getUserSession } from '../../services/auth';

interface SubjectLearningUnit {
  title: string;
  concepts: Concept[];
}

interface SubjectLearningContent {
  summary: string;
  units: SubjectLearningUnit[];
}

const SUBJECT_LEARNING_CONTENT: Record<string, SubjectLearningContent> = {
  dbms: {
    summary: '5 chapters • 22 concepts',
    units: [
      {
        title: 'Unit 1: Data Modeling',
        concepts: [
          { id: 'dbms-c1', name: 'ER Modeling', status: 'mastered', progress: 100, lastPracticed: 'Today' },
          { id: 'dbms-c2', name: 'Normalization (1NF to BCNF)', status: 'practicing', progress: 72, lastPracticed: 'Yesterday' }
        ]
      },
      {
        title: 'Unit 2: Query Optimization',
        concepts: [
          { id: 'dbms-c3', name: 'Join Ordering', status: 'practicing', progress: 48, lastPracticed: '2 days ago' },
          { id: 'dbms-c4', name: 'Index Selection', status: 'needs-focus', progress: 34, lastPracticed: '5 days ago' }
        ]
      }
    ]
  },
  os: {
    summary: '4 chapters • 18 concepts',
    units: [
      {
        title: 'Unit 1: Process Management',
        concepts: [
          { id: 'os-c1', name: 'Process States and PCB', status: 'mastered', progress: 100, lastPracticed: 'Today' },
          { id: 'os-c2', name: 'CPU Scheduling', status: 'practicing', progress: 66, lastPracticed: 'Yesterday' }
        ]
      },
      {
        title: 'Unit 2: Concurrency',
        concepts: [
          { id: 'os-c3', name: 'Critical Sections', status: 'practicing', progress: 59, lastPracticed: '3 days ago' },
          { id: 'os-c4', name: 'Deadlock Handling', status: 'needs-focus', progress: 27, lastPracticed: '1 week ago' }
        ]
      }
    ]
  },
  mdm: {
    summary: '3 chapters • 14 concepts',
    units: [
      {
        title: 'Unit 1: Interdisciplinary Problem Framing',
        concepts: [
          { id: 'mdm-c1', name: 'Stakeholder Mapping', status: 'mastered', progress: 100, lastPracticed: 'Today' },
          { id: 'mdm-c2', name: 'Problem Reframing', status: 'practicing', progress: 74, lastPracticed: 'Yesterday' }
        ]
      },
      {
        title: 'Unit 2: Integration Techniques',
        concepts: [
          { id: 'mdm-c3', name: 'Cross-domain Synthesis', status: 'practicing', progress: 61, lastPracticed: '2 days ago' },
          { id: 'mdm-c4', name: 'Evidence-backed Proposals', status: 'needs-focus', progress: 40, lastPracticed: '4 days ago' }
        ]
      }
    ]
  },
  oe: {
    summary: '4 chapters • 16 concepts',
    units: [
      {
        title: 'Unit 1: Applied Foundations',
        concepts: [
          { id: 'oe-c1', name: 'Domain Basics', status: 'practicing', progress: 63, lastPracticed: 'Yesterday' },
          { id: 'oe-c2', name: 'Tooling Workflow', status: 'practicing', progress: 57, lastPracticed: '2 days ago' }
        ]
      },
      {
        title: 'Unit 2: Project Readiness',
        concepts: [
          { id: 'oe-c3', name: 'Portfolio Artifacts', status: 'needs-focus', progress: 32, lastPracticed: '6 days ago' },
          { id: 'oe-c4', name: 'Demo Storytelling', status: 'mastered', progress: 100, lastPracticed: 'Today' }
        ]
      }
    ]
  },
  ct: {
    summary: '5 chapters • 20 concepts',
    units: [
      {
        title: 'Unit 1: Logic and Proofs',
        concepts: [
          { id: 'ct-c1', name: 'Propositional Logic', status: 'mastered', progress: 100, lastPracticed: 'Today' },
          { id: 'ct-c2', name: 'Induction Proofs', status: 'practicing', progress: 69, lastPracticed: 'Yesterday' }
        ]
      },
      {
        title: 'Unit 2: Graph and Automata Thinking',
        concepts: [
          { id: 'ct-c3', name: 'Graph Traversals', status: 'practicing', progress: 58, lastPracticed: '2 days ago' },
          { id: 'ct-c4', name: 'Finite Automata', status: 'needs-focus', progress: 29, lastPracticed: '5 days ago' }
        ]
      }
    ]
  }
};

export function SubjectsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const user = getUserSession();
  const visibleSubjects = user?.role === 'teacher' ? getTeacherSubjects(user.email) : SUBJECTS;

  const selectedSubjectName = selectedSubject ? getSubjectDisplayName(selectedSubject) : null;

  const selectedContent = selectedSubject ? SUBJECT_LEARNING_CONTENT[selectedSubject] : null;
  const selectedConcepts = selectedContent ? selectedContent.units.flatMap((unit) => unit.concepts) : [];
  const masteredCount = selectedConcepts.filter((concept) => concept.status === 'mastered').length;
  const practicingCount = selectedConcepts.filter((concept) => concept.status === 'practicing').length;
  const needsFocusCount = selectedConcepts.filter((concept) => concept.status === 'needs-focus').length;

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
            {selectedSubjectName ?? 'Subjects'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedSubject ? 'Preview the chapters and progress for this subject' : 'Select a subject to preview its chapters and progress'}
          </p>
        </div>

        {!selectedSubject ? (
          // Subject Preview View
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className="text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{subject.displayName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{SUBJECT_LEARNING_CONTENT[subject.id]?.summary ?? '4 chapters • 16 concepts'}</p>
              </button>
            ))}
          </div>
        ) : (
          // Concept List View
          <div className="space-y-6">
            {/* Units/Chapters */}
            <div className="space-y-4">
              {selectedContent?.units.map((unit) => (
                <div key={unit.title}>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{unit.title}</h2>
                  <ConceptList concepts={unit.concepts} onSelectConcept={handleSelectConcept} />
                </div>
              ))}
            </div>

            {/* Subject Summary */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Progress</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mastered</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{masteredCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Practicing</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{practicingCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Needs Focus</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{needsFocusCount}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export { SubjectsPage as LearningPage };
