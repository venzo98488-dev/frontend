import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchDepartmentsWithFallback, DEFAULT_DEPARTMENTS } from '../../utils/departments';
import {
  HelpCircle,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Building
} from 'lucide-react';

const StudentRequests = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [requests, setRequests] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [deptId, setDeptId] = useState(user?.department_id ? String(user.department_id) : '1');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/requests/my-requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    const loadMeta = async () => {
      try {
        const [deptList, subRes] = await Promise.all([
          fetchDepartmentsWithFallback(),
          api.get('/categories/subjects')
        ]);
        setDepartments(deptList);

        const subs = subRes.data.subjects || [];
        setAllSubjects(subs);

        const initialDept = user?.department_id ? String(user.department_id) : (deptList[0]?.id ? String(deptList[0].id) : '1');
        setDeptId(initialDept);

        const matched = subs.filter((s) => String(s.department_id) === String(initialDept));
        setFilteredSubjects(matched.length > 0 ? matched : subs);
        if (matched.length > 0) {
          setSubjectId(String(matched[0].id));
        } else if (subs.length > 0) {
          setSubjectId(String(subs[0].id));
        }
      } catch (err) {
        console.error('Failed to load subjects or departments:', err);
      }
    };
    loadMeta();
  }, [user]);

  const handleDepartmentChange = (selectedDept) => {
    setDeptId(selectedDept);
    const matched = allSubjects.filter((s) => String(s.department_id) === String(selectedDept));
    setFilteredSubjects(matched.length > 0 ? matched : allSubjects);
    if (matched.length > 0) {
      setSubjectId(String(matched[0].id));
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !subjectId) {
      setFormError('Please enter a title and select a subject.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/requests', {
        subject_id: parseInt(subjectId, 10),
        title: title.trim(),
        description: description.trim()
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      success('Material request submitted! Faculty members will be notified.');
      fetchRequests();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit resource request.';
      setFormError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed</span>
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Under Review</span>
          </span>
        );
      case 'REJECTED':
      case 'CLOSED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-full">
            <XCircle className="w-3.5 h-3.5" />
            <span>Closed</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Material Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Can't find notes or question papers for a subject? Submit a request and faculty or peers will upload them.
          </p>
        </div>

        <button
          onClick={() => {
            const initialDept = user?.department_id ? String(user.department_id) : '1';
            handleDepartmentChange(initialDept);
            setShowModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Request</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No requests submitted yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Need past university question papers or specific unit summaries? Request them from faculty here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{req.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <span className="font-semibold text-slate-700">{req.department_name}</span> • {req.subject_name} ({req.year})
                  </p>
                </div>
                <div>{getStatusBadge(req.status)}</div>
              </div>

              {req.description && (
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {req.description}
                </p>
              )}

              {/* Staff Response / Remarks */}
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
                Requested on {new Date(req.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal with Department Selector */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Request Academic Material</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              {/* Department Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Department *</span>
                </label>
                <select
                  value={String(deptId)}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  required
                  className="w-full text-sm py-2 px-3 bg-indigo-50/40 border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium text-slate-900"
                >
                  {departments.map((dept) => (
                    <option key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Subject *</span>
                </label>
                <select
                  value={String(subjectId)}
                  onChange={(e) => setSubjectId(e.target.value)}
                  required
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                >
                  {filteredSubjects.length === 0 ? (
                    <option value="">No subjects found for this department</option>
                  ) : (
                    filteredSubjects.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name} ({s.year} - {s.semester})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Title / Request Details *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Trees & Graphs Solved University Questions"
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Additional Details / Context (Optional)
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention specific syllabus regulations, exam year, or faculty notes requested..."
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
                  {submitting ? 'Submitting...' : 'Post Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentRequests;
