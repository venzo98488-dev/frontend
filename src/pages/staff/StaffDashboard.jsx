import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Layers,
  FileCheck,
  Clock,
  Download,
  Users,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Plus
} from 'lucide-react';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/staff');
        setData(res.data.dashboard);
      } catch (err) {
        console.error('Failed to load staff dashboard:', err);
        setError('Failed to fetch staff management metrics.');
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
      {/* Staff banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
            Staff & Admin Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="mt-2 text-slate-300 text-sm sm:text-base leading-relaxed">
            Monitor the academic repository, review student submissions, respond to resource requests, and manage college departments and courses.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/staff/verify"
            className="px-4 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Review Submissions ({metrics.pendingReviews || 0})
          </Link>
          <Link
            to="/staff/resources"
            className="px-4 py-2.5 bg-white/10 text-white border border-white/20 font-semibold text-xs rounded-xl hover:bg-white/20 transition-colors"
          >
            Manage Repository
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link to="/staff/resources" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Resources</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.totalResources || 0}
            </p>
          </div>
        </Link>

        <Link to="/staff/verify" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Pending Review</p>
            <p className="text-2xl font-bold text-amber-600 mt-0.5">
              {metrics.pendingReviews || 0}
            </p>
          </div>
        </Link>

        <Link to="/staff/requests" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Student Requests</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.pendingRequests || 0}
            </p>
          </div>
        </Link>

        <Link to="/staff/reports" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:border-slate-300 transition-all">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase">Total Downloads</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">
              {metrics.totalDownloads || 0}
            </p>
          </div>
        </Link>
      </div>

      {/* Pending Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Contributions Awaiting Verification
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review student uploaded notes before publishing to the main repository
            </p>
          </div>
          <Link
            to="/staff/verify"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Open Verification Console ({metrics.pendingReviews || 0})
          </Link>
        </div>

        {data?.recentPendingContributions?.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            All submitted materials have been reviewed!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {data?.recentPendingContributions?.map((item) => (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Uploaded by <span className="font-semibold text-slate-700">{item.student_name}</span> •{' '}
                    {item.department_name} ({item.subject_name})
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 font-semibold rounded-full">
                    {item.status}
                  </span>
                  <Link
                    to="/staff/verify"
                    className="inline-flex items-center text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Review
                    <ExternalLink className="w-3 h-3 ml-1.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Downloaded Resources */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Most Downloaded Academic Materials
          </h2>
          <Link to="/staff/reports" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
            View Full Report
          </Link>
        </div>

        {data?.topDownloaded?.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No download records yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {data?.topDownloaded?.map((item, index) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="w-6 text-sm font-bold text-slate-400">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">
                      {item.department_name} • {item.subject_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  <Download className="w-3.5 h-3.5" />
                  <span>{item.download_count} downloads</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
