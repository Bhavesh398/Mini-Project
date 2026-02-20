import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  Settings,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { clearUserSession } from '../../services/auth';
import { ChatBuddy } from '../shared/ChatBuddy';

interface AdminLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Classes & Structure', href: '/admin/classes', icon: GraduationCap },
  { name: 'Reports', href: '/admin/reports', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

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
              <div className="text-xs text-indigo-200">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
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
                <div className="text-sm font-medium text-gray-900 dark:text-white">Admin User</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Administrator</div>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">AU</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-8">{children}</main>
      </div>

      {/* Floating Chat Buddy */}
      <ChatBuddy userRole="admin" />
    </div>
  );
}