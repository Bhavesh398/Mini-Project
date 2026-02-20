import { Activity, Target, Users } from 'lucide-react';

const solutions = [
  {
    icon: Activity,
    title: 'Engagement Tracking',
    features: [
      'Live polls and participation signals',
      'Engagement index for every class',
      'Real-time feedback loops',
    ],
  },
  {
    icon: Target,
    title: 'Mastery-Based Learning',
    features: [
      'Concept-level mastery scoring',
      'Personalized assignments based on learning gaps',
      'Progress tracking over time',
    ],
  },
  {
    icon: Users,
    title: 'Project-Based Learning',
    features: [
      'Team tracking and timelines',
      'Teacher-approved AI feedback support',
      'Fair assessment tools',
    ],
  },
];

export function SolutionSection() {
  return (
    <section className="py-20 dark:bg-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
          What AMPLIFY Solves
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-8 hover:border-blue-300 dark:hover:border-blue-400 hover:shadow-lg dark:hover:shadow-lg dark:shadow-gray-900/50 transition-all"
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-6">
                <solution.icon className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{solution.title}</h3>
              <ul className="space-y-3">
                {solution.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
