import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export interface Concept {
  id: string;
  name: string;
  status: 'mastered' | 'practicing' | 'needs-focus';
  progress: number;
  lastPracticed: string;
}

interface ConceptListProps {
  concepts: Concept[];
  onSelectConcept: (conceptId: string) => void;
}

export function ConceptList({ concepts, onSelectConcept }: ConceptListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mastered':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'practicing':
        return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'needs-focus':
        return <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'Mastered';
      case 'practicing':
        return 'Practicing';
      case 'needs-focus':
        return 'Needs Focus';
      default:
        return '';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'mastered':
        return 'bg-green-600';
      case 'practicing':
        return 'bg-blue-600';
      case 'needs-focus':
        return 'bg-orange-600';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-2">
      {concepts.map((concept) => (
        <div
          key={concept.id}
          onClick={() => onSelectConcept(concept.id)}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              {getStatusIcon(concept.status)}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{concept.name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  Last practiced: {concept.lastPracticed}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              concept.status === 'mastered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              concept.status === 'practicing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
              'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
            }`}>
              {getStatusLabel(concept.status)}
            </span>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(concept.status)} transition-all`}
                style={{ width: `${concept.progress}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{concept.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}
