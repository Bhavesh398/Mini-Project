import { Shield, Lock, CheckCircle, Eye } from 'lucide-react';

const trustFeatures = [
  {
    icon: Lock,
    text: 'Admin-controlled access and permissions',
  },
  {
    icon: CheckCircle,
    text: 'Teacher-approved AI suggestions',
  },
  {
    icon: Shield,
    text: 'Data privacy and control',
  },
];

export function TrustSection() {
  return (
    <section className="bg-gray-50 dark:bg-gray-800 py-20 transition-colors">
      <div className="max-w-5xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Designed for Schools
        </h2>
        <div className="bg-white dark:bg-gray-700 rounded-2xl p-8 md:p-12 shadow-sm dark:shadow-lg dark:shadow-gray-900/50 transition-all">
          <div className="grid md:grid-cols-2 gap-6">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-green-700 dark:text-green-400" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 pt-2">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
