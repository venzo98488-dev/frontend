import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/downloadFile';
import api from '../../api/axios';
import {
  BookOpen,
  Bookmark,
  UploadCloud,
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Sparkles,
  Download,
  MessageSquare
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { success, error: toastError, info } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleDownload = async (rec) => {
    info('Downloading recommended material...');
    const ok = await downloadFile(rec.id, rec.title);
    if (ok) {
      success('File downloaded successfully!');
    }
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/student');
        setData(res.data.dashboard);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        setError('Failed to fetch dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            Student Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Search, discover, and download verified notes, question papers, and syllabus copies.
            Contribute your materials for review or request missing items.
          </p>
          {user?.semester && (
            <span className="inline-block mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
              📅 Current Semester: {user.semester}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/resources"
            className="px-4 py-2.5 bg-white text-indigo-700 font-semibold text-xs rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Browse Resources
          </Link>
          <Link
            to="/student/contributions"
            className="px-4 py-2.5 bg-indigo-500/40 text-white border border-white/20 font-semibold text-xs rounded-xl hover:bg-indigo-500/60 transition-colors"
          >
            Contribute Notes
          </Link>
          <Link
            to="/chat"
            className="px-4 py-2.5 bg-indigo-500/40 text-white border border-white/20 font-semibold text-xs rounded-xl hover:bg-indigo-500/60 transition-colors flex items-center space-x-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Faculty</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link
          to="/resources"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Available Materials</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.totalAvailableResources || 0}
            </p>
          </div>
        </Link>

        <Link
          to="/student/bookmarks"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all"
        >
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bookmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Saved Bookmarks</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.totalBookmarks || 0}
            </p>
          </div>
        </Link>

        <Link
          to="/student/contributions"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">My Contributions</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.contributions?.total || 0}
            </p>
          </div>
        </Link>

        <Link
          to="/student/requests"
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Resource Requests</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.requests?.total || 0}
            </p>
          </div>
        </Link>
      </div>

      {/* ============================================================
          Recommended For You Section
          SQL scoring: dept match (+15) + semester match (+10)
          + bookmarked subject (+10) + bookmarked type (+5) + downloads (up to +10)
          ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <p className="text-xs text-slate-500">
                Personalized based on your department
                {user?.semester ? `, ${user.semester}` : ''}
                , bookmarked topics, and peer downloads
              </p>
            </div>
          </div>
          <Link
            to="/resources"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {!data?.recommendations || data.recommendations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">No recommendations yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Explore and bookmark materials to get personalised recommendations!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Type + Reason badges */}
                  <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                      {rec.resource_type_name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                      {rec.recommendation_reason}
                    </span>
                  </div>

                  <Link to={`/resources/${rec.id}`} className="group">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {rec.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {rec.description || 'Curated academic material for your curriculum.'}
                  </p>

                  <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                    <p className="font-semibold text-slate-700">{rec.department_name}</p>
                    <p className="text-slate-500">
                      {rec.subject_name}
                      {rec.subject_semester && (
                        <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-semibold">
                          {rec.subject_semester}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {rec.download_count || 0} downloads
                  </span>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/resources/${rec.id}`}
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => handleDownload(rec)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid: Recent Contributions & Recent Bookmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recent Contributions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Contributions</h2>
            <Link to="/student/contributions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          {data?.recentContributions?.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No contributions submitted yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data?.recentContributions?.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="pr-4">
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.subject_name} • {item.resource_type_name}
                    </p>
                    {item.latest_remarks && (
                      <p className="text-xs text-amber-600 mt-1 italic">
                        Feedback: {item.latest_remarks}
                      </p>
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold inline-flex items-center space-x-1 ${
                        item.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'VERIFIED'
                          ? 'bg-blue-100 text-blue-800'
                          : item.status === 'UNDER_REVIEW'
                          ? 'bg-purple-100 text-purple-800'
                          : item.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookmarks */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Saved Bookmarks</h2>
            <Link to="/student/bookmarks" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>

          {data?.recentBookmarks?.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No saved bookmarks yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data?.recentBookmarks?.map((bm) => (
                <div key={bm.bookmark_id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{bm.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {bm.department_name} • {bm.subject_name}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {bm.resource_type_name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Requests */}
      {data?.recentRequests && data.recentRequests.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Recent Requests</h2>
            <Link to="/student/requests" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data.recentRequests.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between">
                <div className="pr-4">
                  <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">{req.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{req.subject_name}</p>
                  {req.staff_remarks && (
                    <p className="text-xs text-indigo-600 mt-1 italic">Staff: {req.staff_remarks}</p>
                  )}
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    req.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : req.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
