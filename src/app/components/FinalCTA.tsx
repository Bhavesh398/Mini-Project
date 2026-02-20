import { Button } from './ui/button';
import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

export function FinalCTA() {
  return (
    <section className="py-20 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          Ready to see AMPLIFY in action?
        </h2>
        <Link to="/login">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
            <LogIn className="w-5 h-5 mr-2" />
            Login to AMPLIFY
          </Button>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Access provided by your institution</p>
      </div>
    </section>
  );
}