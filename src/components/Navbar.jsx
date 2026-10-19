import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen,
  LayoutDashboard,
  Bookmark,
  UploadCloud,
  CheckCircle,
  HelpCircle,
  Layers,
  LogOut,
  User,
  BarChart3,
  Search,
  Building,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
                  egspec<span className="text-indigo-600">.com</span>
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-0.5">
                  Resource Hub
                </span>
              </div>
            </Link>

            {/* Navigation links */}
            {isAuthenticated && (
              <nav className="hidden lg:flex ml-6 space-x-1">
                {isStaff ? (
                  <>
                    <Link
                      to="/staff/dashboard"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/dashboard')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/staff/resources"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/resources')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Manage Resources</span>
                    </Link>
                    <Link
                      to="/staff/verify"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/verify')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Verify Submissions</span>
                    </Link>
                    <Link
                      to="/staff/requests"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/requests')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Requests</span>
                    </Link>
                    <Link
                      to="/staff/departments"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/departments')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span>Departments</span>
                    </Link>
                    <Link
                      to="/staff/subjects"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/subjects')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Subjects</span>
                    </Link>
                    <Link
                      to="/staff/types"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/types')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Types</span>
                    </Link>
                    <Link
                      to="/staff/reports"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/staff/reports')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Reports</span>
                    </Link>
                    <Link
                      to="/chat"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/chat')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <span>Doubt Chat</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/student/dashboard"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/student/dashboard')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      to="/resources"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/resources')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      <span>Browse Resources</span>
                    </Link>
                    <Link
                      to="/student/bookmarks"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/student/bookmarks')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span>Bookmarks</span>
                    </Link>
                    <Link
                      to="/student/contributions"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/student/contributions')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>My Contributions</span>
                    </Link>
                    <Link
                      to="/student/requests"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/student/requests')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Requests</span>
                    </Link>
                    <Link
                      to="/chat"
                      className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 ${
                        isActive('/chat')
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 text-indigo-600" />
                      <span>Doubt Clearance</span>
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>

          {/* User profile & actions */}
          <div className="flex items-center space-x-3">
            <Link
              to="/ai-tools"
              title="AI Academic Clarity & Doubts Solver"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 border shadow-xs ${
                isActive('/ai-tools')
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-indigo-200'
                  : 'bg-indigo-50/70 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/70'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
              <span>AI Tools</span>
            </Link>
            <Link
              to="/flashcards"
              title="Exam Revision Flashcards"
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 border shadow-xs ${
                isActive('/flashcards')
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-amber-200'
                  : 'bg-amber-50/70 text-amber-800 border-amber-200/80 hover:bg-amber-100/70'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Flashcards</span>
            </Link>
            <Link
              to="/help"
              title="All-in-One Platform Guide & Help Center"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1.5 border border-slate-200/60 ${
                isActive('/help')
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Help & Guide</span>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 border border-slate-200">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.name}
                    </p>
                    <span
                      className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.2 rounded ${
                        isStaff
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/resources"
                  className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  Browse
                </Link>
                <Link
                  to="/login"
                  className="px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
