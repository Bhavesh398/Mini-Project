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
import { SubjectsPage } from './pages/student/LearningPage';
import { StudentCourseSelectionPage } from './pages/student/CourseSelectionPage';
import { ProjectsPage as StudentProjectsPage } from './pages/student/ProjectsPage';
import { MiniProjectDetailPage } from './pages/student/MiniProjectDetailPage';
import { QueriesPage } from './pages/student/QueriesPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { StudentSubmissionsPage } from './pages/student/SubmissionsPage';
import { StudentTasksPage } from './pages/student/TasksPage';
import { TeacherDashboardPage } from './pages/teacher/DashboardPage';
import { TeacherClassesPage } from './pages/teacher/ClassesPage';
import { ProjectsPage } from './pages/teacher/ProjectsPage';
import { ProjectDashboardPage } from './pages/teacher/ProjectDashboardPage';
import { TeamDetailPage } from './pages/teacher/TeamDetailPage';
import { TeacherSubmissionsPage } from './pages/teacher/SubmissionsPage';
import { TeacherTasksPage } from './pages/teacher/TasksPage';

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
            <Route path="/teacher/classes" element={<TeacherClassesPage />} />
            <Route path="/teacher/tasks" element={<TeacherTasksPage />} />
            <Route path="/teacher/projects" element={<ProjectsPage />} />
            <Route path="/teacher/submissions" element={<TeacherSubmissionsPage />} />
            <Route path="/teacher/projects/:projectId" element={<ProjectDashboardPage />} />
            <Route path="/teacher/projects/:projectId/teams/:teamId" element={<TeamDetailPage />} />
            
            {/* Student Routes */}
            <Route path="/student/dashboard" element={<StudentDashboardPage />} />
            <Route path="/student/subjects" element={<SubjectsPage />} />
            <Route path="/student/course-selection" element={<StudentCourseSelectionPage />} />
            <Route path="/student/learning" element={<Navigate to="/student/subjects" replace />} />
            <Route path="/student/tasks" element={<StudentTasksPage />} />
            <Route path="/student/submissions" element={<StudentSubmissionsPage />} />
            <Route path="/student/projects" element={<StudentProjectsPage />} />
            <Route path="/student/projects/:projectId" element={<MiniProjectDetailPage />} />
            <Route path="/student/queries" element={<QueriesPage />} />
            <Route path="/student/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  );
}