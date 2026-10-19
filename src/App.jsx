import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Shared Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import Help from './pages/Help';
import AITools from './pages/AITools';
import Flashcards from './pages/Flashcards';
import GlobalAIAssistant from './components/GlobalAIAssistant';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import Resources from './pages/student/Resources';
import ResourceDetails from './pages/student/ResourceDetails';
import Bookmarks from './pages/student/Bookmarks';
import StudentRequests from './pages/student/StudentRequests';
import MyContributions from './pages/student/MyContributions';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import ManageResources from './pages/staff/ManageResources';
import VerifyContributions from './pages/staff/VerifyContributions';
import StaffRequests from './pages/staff/StaffRequests';
import Departments from './pages/staff/Departments';
import Subjects from './pages/staff/Subjects';
import ResourceTypes from './pages/staff/ResourceTypes';
import Reports from './pages/staff/Reports';

// Smart Home redirection based on auth status
const HomeRedirect = () => {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/resources" replace />;
  }

  return isStaff ? (
    <Navigate to="/staff/dashboard" replace />
  ) : (
    <Navigate to="/student/dashboard" replace />
  );
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-slate-50 font-['Plus_Jakarta_Sans',sans-serif]">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                {/* Public & Shared Routes */}
                <Route path="/" element={<HomeRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetails />} />
                <Route path="/help" element={<Help />} />
                <Route path="/ai-tools" element={<AITools />} />
                <Route path="/flashcards" element={<Flashcards />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Authenticated Shared Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/chat" element={<Chat />} />
                </Route>

                {/* Student Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/bookmarks" element={<Bookmarks />} />
                  <Route path="/student/contributions" element={<MyContributions />} />
                  <Route path="/student/requests" element={<StudentRequests />} />
                </Route>

                {/* Staff / Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
                  <Route path="/staff/dashboard" element={<StaffDashboard />} />
                  <Route path="/staff/resources" element={<ManageResources />} />
                  <Route path="/staff/verify" element={<VerifyContributions />} />
                  <Route path="/staff/requests" element={<StaffRequests />} />
                  <Route path="/staff/departments" element={<Departments />} />
                  <Route path="/staff/subjects" element={<Subjects />} />
                  <Route path="/staff/types" element={<ResourceTypes />} />
                  <Route path="/staff/reports" element={<Reports />} />
                </Route>

                {/* Fallback 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <GlobalAIAssistant />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
