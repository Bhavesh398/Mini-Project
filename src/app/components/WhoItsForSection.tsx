import { Building2, GraduationCap, Users } from 'lucide-react';

const audiences = [
  {
    icon: Building2,
    title: 'Schools & Colleges',
    features: ['Controlled access', 'Centralized system overview', 'Administrative control'],
  },
  {
    icon: GraduationCap,
    title: 'Teachers',
    features: ['Less admin work', 'Clear insights', 'Better interventions'],
  },
  {
    icon: Users,
    title: 'Students',
    features: ['Focused practice', 'Clear progress', 'Fair project evaluation'],
  },
];

export function WhoItsForSection() {
  return (
    <section id="who-its-for" className="py-20 dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Built for Real Classrooms
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-8 shadow-sm dark:shadow-lg dark:shadow-gray-900/50 transition-all"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <audience.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{audience.title}</h3>
              <ul className="space-y-3">
                {audience.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
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
