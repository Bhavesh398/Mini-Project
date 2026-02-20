import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  Plus,
  Briefcase,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { clearUserSession } from '../../services/auth';
import { ChatBuddy } from '../shared/ChatBuddy';

interface TeacherLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/teacher/projects', icon: Briefcase },
];

// Sample classes data
const classesData = [
  { id: 1, name: 'Mathematics 101' },
  { id: 2, name: 'Physics Advanced' },
  { id: 3, name: 'English Literature' },
  { id: 4, name: 'Chemistry Lab' },
];

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [expandClasses, setExpandClasses] = useState(false);

  const handleLogout = () => {
    clearUserSession();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-600 to-indigo-800 dark:from-indigo-900 dark:to-indigo-950">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-indigo-500/30">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="AMPLIFY Logo" className="w-8 h-8" />
            <div>
              <div className="font-semibold text-white">AMPLIFY</div>
              <div className="text-xs text-indigo-200">Teacher Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {/* Classes Dropdown */}
          <div>
            <button
              onClick={() => setExpandClasses(!expandClasses)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                expandClasses || location.pathname === '/teacher/dashboard'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-indigo-100 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="flex-1 text-left">Classes</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  expandClasses ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Classes Dropdown Menu */}
            {expandClasses && (
              <div className="mt-2 ml-3 space-y-1 border-l border-indigo-400/30 pl-3">
                {classesData.map((cls) => (
                  <Link
                    key={cls.id}
                    to={`/teacher/dashboard?class=${cls.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-indigo-100 hover:bg-white/10 transition-all"
                  >
                    <div className="w-2 h-2 bg-indigo-300 rounded-full"></div>
                    {cls.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    navigate('/teacher/dashboard');
                    setExpandClasses(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-indigo-200 hover:bg-white/10 transition-all mt-2 pt-2 border-t border-indigo-400/30"
                >
                  <Plus className="w-4 h-4" />
                  Create New Class
                </button>
              </div>
            )}
          </div>

          {/* Other Navigation Items */}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-indigo-100 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-500/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-white/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Sun className="w-5 h-5 text-gray-400" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Teacher User</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Teacher</div>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">TU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>

      {/* Floating Chat Buddy */}
      <ChatBuddy userRole="teacher" />
    </div>
  );
}
