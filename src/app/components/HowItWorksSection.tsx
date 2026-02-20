import { BookOpen, Database, Brain, Lightbulb, UserCheck } from 'lucide-react';

const steps = [
  {
    icon: BookOpen,
    title: 'Teachers teach and assess as usual',
  },
  {
    icon: Database,
    title: 'AMPLIFY captures engagement and performance data',
  },
  {
    icon: Brain,
    title: 'AI identifies learning gaps and patterns',
  },
  {
    icon: Lightbulb,
    title: 'Teachers get insights and recommendations',
  },
  {
    icon: UserCheck,
    title: 'Students receive personalized practice',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800 py-20 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-16">
          How AMPLIFY Works
        </h2>
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 dark:from-blue-700 via-blue-400 dark:via-blue-500 to-blue-200 dark:to-blue-700 mx-20"></div>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-700 border-4 border-blue-600 dark:border-blue-400 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg dark:shadow-lg dark:shadow-gray-900/50">
                  <step.icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 max-w-[180px]">{step.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
