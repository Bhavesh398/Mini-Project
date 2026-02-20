export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-semibold text-white">AMPLIFY</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Adaptive Mastery & Engagement Platform — A unified system for tracking student engagement, measuring concept mastery, and managing project-based learning.
            </p>
          </div>
          <div className="md:text-right">
            <h3 className="text-white font-semibold mb-4">Links</h3>
            <nav className="space-y-2">
              <a href="#about" className="block text-gray-400 hover:text-white transition-colors">
                About
              </a>
              <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">
                Contact
              </a>
              <a href="#privacy" className="block text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
            </nav>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2026 AMPLIFY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
