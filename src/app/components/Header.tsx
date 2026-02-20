import { LogIn, Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 backdrop-blur-md border-b border-blue-900/50 z-50 shadow-lg shadow-blue-950/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/favicon.ico" alt="AMPLIFY Logo" className="w-8 h-8 rounded-lg shadow-lg shadow-blue-500/30" />
          <span className="text-xl font-semibold text-white">AMPLIFY</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-blue-200 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#who-its-for" className="text-blue-200 hover:text-white transition-colors">
            Who It's For
          </a>
          <a href="#about" className="text-blue-200 hover:text-white transition-colors">
            About
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-blue-900/50 hover:bg-blue-800/50 transition-colors border border-blue-800/50"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-blue-200" />
            ) : (
              <Sun className="w-5 h-5 text-blue-300" />
            )}
          </button>
          <Link to="/login">
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/30 border border-blue-500/30">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}