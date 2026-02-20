import { Button } from './ui/button';
import { LogIn, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Real-time engagement. Personalized learning. One unified platform for classrooms.
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            AMPLIFY helps teachers track student engagement, measure concept mastery, and manage project-based learning—all in one system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/login">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base">
                <LogIn className="w-5 h-5 mr-2" />
                Login to Dashboard
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base">
              <ChevronDown className="w-5 h-5 mr-2" />
              View How It Works
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-4">
              {/* Mock Dashboard Preview - Header */}
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl"></div>
                    <div className="space-y-1">
                      <div className="h-3 bg-gray-800 rounded-full w-28"></div>
                      <div className="h-2 bg-gray-300 rounded-full w-20"></div>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full">
                    <div className="h-2 bg-white rounded w-12"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-4 shadow-md">
                    <div className="h-6 w-6 bg-white/30 rounded-lg mb-2"></div>
                    <div className="h-2 bg-white/60 rounded w-full mb-1"></div>
                    <div className="h-3 bg-white rounded w-10"></div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl p-4 shadow-md">
                    <div className="h-6 w-6 bg-white/30 rounded-lg mb-2"></div>
                    <div className="h-2 bg-white/60 rounded w-full mb-1"></div>
                    <div className="h-3 bg-white rounded w-10"></div>
                  </div>
                  <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-4 shadow-md">
                    <div className="h-6 w-6 bg-white/30 rounded-lg mb-2"></div>
                    <div className="h-2 bg-white/60 rounded w-full mb-1"></div>
                    <div className="h-3 bg-white rounded w-10"></div>
                  </div>
                </div>
              </div>
              
              {/* Progress Chart */}
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-3 bg-gray-800 rounded-full w-36"></div>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full flex-1 shadow-sm"></div>
                    <div className="px-3 py-1 bg-blue-100 rounded-full">
                      <div className="h-2 bg-blue-600 rounded w-8"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex-1 shadow-sm"></div>
                    <div className="px-3 py-1 bg-green-100 rounded-full">
                      <div className="h-2 bg-green-600 rounded w-8"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full w-2/3 shadow-sm"></div>
                    <div className="px-3 py-1 bg-purple-100 rounded-full">
                      <div className="h-2 bg-purple-600 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bottom Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-md">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl mb-3 shadow-sm"></div>
                  <div className="h-2 bg-orange-300 rounded-full w-20 mb-2"></div>
                  <div className="h-3 bg-orange-600 rounded-full w-12"></div>
                </div>
                <div className="bg-gradient-to-br from-teal-100 to-teal-50 border-2 border-teal-200 rounded-2xl p-4 shadow-md">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-500 rounded-xl mb-3 shadow-sm"></div>
                  <div className="h-2 bg-teal-300 rounded-full w-20 mb-2"></div>
                  <div className="h-3 bg-teal-600 rounded-full w-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}