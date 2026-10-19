import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { fetchDepartmentsWithFallback, DEFAULT_DEPARTMENTS } from '../../utils/departments';
import {
  HelpCircle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertCircle,
  Building,
  Search,
  Filter
} from 'lucide-react';

const StaffRequests = () => {
  const { success, error } = useToast();

  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Response Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('COMPLETED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/requests', { params });
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const loadDepts = async () => {
      const depts = await fetchDepartmentsWithFallback();
      setDepartments(depts);
    };
    loadDepts();
  }, [statusFilter]);

  const openResponseModal = (req) => {
    setSelectedRequest(req);
    setNewStatus(req.status === 'PENDING' ? 'COMPLETED' : req.status);
    setRemarks(req.staff_remarks || '');
    setModalError('');
    setShowModal(true);
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      await api.patch(`/requests/${selectedRequest.id}/respond`, {
        status: newStatus,
        staff_remarks: remarks.trim()
      });
      setShowModal(false);
      setSelectedRequest(null);
      success('Request status and faculty response updated!');
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update request.';
      setModalError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'COMPLETED':
        return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">Completed</span>;
      case 'UNDER_REVIEW':
        return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">Under Review</span>;
      case 'REJECTED':
      case 'CLOSED':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-full">{s}</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">Pending</span>;
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (deptFilter && String(req.department_id || '') !== String(deptFilter) && !req.department_name?.toLowerCase().includes(departments.find(d => String(d.id) === String(deptFilter))?.name.toLowerCase() || 'xyz')) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        req.title?.toLowerCase().includes(q) ||
        req.subject_name?.toLowerCase().includes(q) ||
        req.student_name?.toLowerCase().includes(q) ||
        req.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Student Resource Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Address missing lecture materials, past papers, or syllabus documents requested by students across departments.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Building className="w-3.5 h-3.5 text-indigo-600" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none font-medium text-slate-800"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none font-medium text-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Only</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="CLOSED">Closed / Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search requests by topic, student name, or course title..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No requests found</h3>
          <p className="text-sm text-slate-500 mt-1">
            No student requests match the selected department or status criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{req.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{req.department_name}</span> • {req.subject_name} ({req.year}) • Requested by <span className="font-semibold text-slate-700">{req.student_name}</span>
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(req.status)}
                  <button
                    onClick={() => openResponseModal(req)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Respond
                  </button>
                </div>
              </div>

              {req.description && (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {req.description}
                </p>
              )}

              {req.staff_remarks && (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-start space-x-2 text-xs text-indigo-900">
                  <MessageSquare className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Faculty Feedback / Update:</span>{' '}
                    <span>{req.staff_remarks}</span>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-400">
                Submitted on {new Date(req.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Respond to Student Request</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="text-xs bg-slate-50 p-3 rounded-xl space-y-1 text-slate-700 border border-slate-100">
              <p><span className="font-bold">Topic:</span> {selectedRequest.title}</p>
              <p><span className="font-bold">Department:</span> {selectedRequest.department_name}</p>
              <p><span className="font-bold">Subject:</span> {selectedRequest.subject_name}</p>
              <p><span className="font-bold">Student:</span> {selectedRequest.student_name}</p>
            </div>

            <form onSubmit={handleResponseSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Update Status *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                >
                  <option value="COMPLETED">COMPLETED (Material Uploaded / Fulfilled)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Faculty Sourcing Material)</option>
                  <option value="REJECTED">REJECTED (Out of Syllabus / Duplicate)</option>
                  <option value="CLOSED">CLOSED (Resolved)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty Remarks & Instructions</label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Uploaded Unit 3 question bank in Repository under Operating Systems. Please check."
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Submit Response'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffRequests;
