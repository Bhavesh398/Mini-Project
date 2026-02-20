import { AlertCircle, UserX, FileText, FolderKanban } from 'lucide-react';

const problems = [
  {
    icon: AlertCircle,
    title: 'Limited real-time visibility',
    description: 'Teachers lack real-time visibility into student understanding during lessons.',
  },
  {
    icon: UserX,
    title: 'Quiet students overlooked',
    description: 'Quiet students fall behind unnoticed without clear participation signals.',
  },
  {
    icon: FileText,
    title: 'One-size-fits-all homework',
    description: 'Homework assignments are one-size-fits-all, missing individual learning gaps.',
  },
  {
    icon: FolderKanban,
    title: 'Project tracking challenges',
    description: 'Project work is hard to track and assess fairly across different teams.',
  },
];

export function ProblemSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-900 py-20 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
          The Problem in Today's Classrooms
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all"
            >
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4">
                <problem.icon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{problem.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
