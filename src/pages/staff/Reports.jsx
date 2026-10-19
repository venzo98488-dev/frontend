import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  BarChart3,
  Download,
  Building,
  FileText,
  Clock,
  User,
  ArrowUpRight
} from 'lucide-react';

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/downloads/analytics');
        setAnalytics(res.data.analytics);
      } catch (err) {
        console.error('Failed to load reports analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    totalDownloads = 0,
    topResources = [],
    recentLogs = [],
    departmentDownloads = []
  } = analytics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Repository Usage & Reports
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monitor download activities, most demanded academic materials, and department trends.
        </p>
      </div>

      {/* Overview Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Student Downloads
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{totalDownloads}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Top Subject Materials
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-0.5">{topResources.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Departments
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-0.5">
              {departmentDownloads.length}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Top Resources & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Downloaded Resources */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Most Popular Study Materials
          </h2>
          {topResources.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No download records yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Resource Title</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-right">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topResources.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-400">#{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{item.title}</td>
                      <td className="py-3 px-3 text-slate-600">{item.department_name}</td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600">
                        {item.download_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Downloads by Department */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Department Activity
          </h2>
          {departmentDownloads.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No downloads logged yet.</p>
          ) : (
            <div className="space-y-4">
              {departmentDownloads.map((dept) => {
                const percentage = totalDownloads > 0
                  ? Math.round((dept.download_count / totalDownloads) * 100)
                  : 0;
                return (
                  <div key={dept.department_name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{dept.department_name}</span>
                      <span>{dept.download_count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Download Activity Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>Recent Download Logs</span>
          <Clock className="w-4 h-4 text-slate-400" />
        </h2>

        {recentLogs.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">No activity logged.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Resource Downloaded</th>
                  <th className="py-2.5 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-semibold text-slate-800">{log.student_name}</td>
                    <td className="py-3 px-3 text-slate-500">{log.student_email}</td>
                    <td className="py-3 px-3 font-medium text-slate-700">{log.resource_title}</td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {new Date(log.downloaded_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
