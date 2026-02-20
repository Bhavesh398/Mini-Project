import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/admin/DashboardPage';
import { AdminUsersPage } from './pages/admin/UsersPage';
import { AdminClassesPage } from './pages/admin/ClassesPage';
import { AdminReportsPage } from './pages/admin/ReportsPage';
import { AdminSettingsPage } from './pages/admin/SettingsPage';
import { StudentDashboardPage } from './pages/student/DashboardPage';
import { LearningPage } from './pages/student/LearningPage';
import { ProjectsPage as StudentProjectsPage } from './pages/student/ProjectsPage';
import { AssessmentsPage } from './pages/student/AssessmentsPage';
import { QueriesPage } from './pages/student/QueriesPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { AdaptiveHomeworkPage } from './pages/student/AdaptiveHomeworkPage';
import { TeacherDashboardPage } from './pages/teacher/DashboardPage';
import { ProjectsPage } from './pages/teacher/ProjectsPage';
import { ProjectDashboardPage } from './pages/teacher/ProjectDashboardPage';
import { TeamDetailPage } from './pages/teacher/TeamDetailPage';

export default function App() {
  return (
    <ThemeProvider>
      <div className="bg-white dark:bg-gray-950 min-h-screen transition-colors">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/classes" element={<AdminClassesPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/projects" element={<ProjectsPage />} />
            <Route path="/teacher/projects/:projectId" element={<ProjectDashboardPage />} />
            <Route path="/teacher/projects/:projectId/teams/:teamId" element={<TeamDetailPage />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/learning" element={<LearningPage />} />
            <Route path="/student/homework" element={<AdaptiveHomeworkPage />} />
            <Route path="/student/projects" element={<StudentProjectsPage />} />
            <Route path="/student/assessments" element={<AssessmentsPage />} />
            <Route path="/student/queries" element={<QueriesPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}