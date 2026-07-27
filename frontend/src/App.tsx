import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/dashboard/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import UsersPage from './pages/dashboard/UsersPage';
import ServicesPage from './pages/dashboard/ServicesPage';
import PostsPage from './pages/dashboard/PostsPage';
import JobOpeningsPage from './pages/dashboard/JobOpeningsPage';
import PreviousProjectsPage from './pages/dashboard/PreviousProjectsPage';
import OurClientsPage from './pages/dashboard/OurClientsPage';
import ClientStatementsPage from './pages/dashboard/ClientStatementsPage';
import ClientReachPage from './pages/dashboard/ClientReachPage';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="posts" element={<PostsPage />} />
        <Route path="job-openings" element={<JobOpeningsPage />} />
        <Route path="previous-projects" element={<PreviousProjectsPage />} />
        <Route path="our-clients" element={<OurClientsPage />} />
        <Route path="client-statements" element={<ClientStatementsPage />} />
        <Route path="client-reach" element={<ClientReachPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
