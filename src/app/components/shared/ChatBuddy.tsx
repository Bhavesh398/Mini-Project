import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBuddyProps {
  userRole: 'admin' | 'teacher' | 'student';
}

export function ChatBuddy({ userRole }: ChatBuddyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm your ${userRole} assistant. How can I help you today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const getRoleSpecificSuggestions = () => {
    switch (userRole) {
      case 'admin':
        return [
          'Show user statistics',
          'Generate reports',
          'Manage classes',
          'System settings'
        ];
      case 'teacher':
        return [
          'Create new assignment',
          'View student progress',
          'Grade assessments',
          'Send announcements'
        ];
      case 'student':
        return [
          'Show my progress',
          'Upcoming assignments',
          'Practice questions',
          'Ask about a concept'
        ];
      default:
        return [];
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateResponse(input, userRole),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);

    setInput('');
  };

  const generateResponse = (query: string, role: string): string => {
    const lowerQuery = query.toLowerCase();

    // Role-specific responses
    if (role === 'admin') {
      if (lowerQuery.includes('user') || lowerQuery.includes('statistics')) {
        return 'You currently have 250 active users (150 students, 80 teachers, 20 admins). User engagement is up 15% this month.';
      }
      if (lowerQuery.includes('report')) {
        return 'I can help you generate reports for attendance, performance, or system usage. Which report would you like to create?';
      }
    }

    if (role === 'teacher') {
      if (lowerQuery.includes('progress') || lowerQuery.includes('student')) {
        return 'Your students have an average mastery of 78%. 5 students need attention in Mathematics. Would you like to see detailed analytics?';
      }
      if (lowerQuery.includes('assignment') || lowerQuery.includes('create')) {
        return 'I can help you create a new assignment. What subject is this for, and what type of assignment would you like to create?';
      }
      if (lowerQuery.includes('grade')) {
        return 'You have 12 pending assessments to grade. Would you like to start with the oldest submissions?';
      }
    }

    if (role === 'student') {
      if (lowerQuery.includes('progress') || lowerQuery.includes('mastery')) {
        return 'Your overall mastery is 65%. You\'re doing great in Mathematics (85%) and English (78%). Physics needs more attention (52%).';
      }
      if (lowerQuery.includes('assignment') || lowerQuery.includes('due')) {
        return 'You have 3 upcoming assignments: Math Assignment (due tomorrow), Physics Lab Report (due in 3 days), and English Essay (due in 5 days).';
      }
      if (lowerQuery.includes('practice') || lowerQuery.includes('help')) {
        return 'I recommend practicing Quadratic Functions and Complex Numbers in Mathematics. Would you like to start a practice session?';
      }
    }

    return `I understand you're asking about "${query}". As your ${role} assistant, I can help with learning resources, progress tracking, and answering questions. What specific information do you need?`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 group"
          aria-label="Open chat assistant"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Assistant</h3>
                <p className="text-xs text-white/80 capitalize">{userRole} Helper</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {getRoleSpecificSuggestions().map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
