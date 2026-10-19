import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/downloadFile';
import { fetchDepartmentsWithFallback, DEFAULT_DEPARTMENTS } from '../../utils/departments';
import ResourcePreviewModal from '../../components/ResourcePreviewModal';
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MessageSquare,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Building,
  Eye,
  Filter
} from 'lucide-react';

const VerifyContributions = () => {
  const { success, error, info } = useToast();

  const [contributions, setContributions] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Review Action Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('PUBLISHED');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [previewResource, setPreviewResource] = useState(null);

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reviews/pending', {
        params: { status: statusFilter }
      });
      setContributions(res.data.pendingContributions || []);
    } catch (err) {
      console.error('Failed to load pending reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
    const loadDepts = async () => {
      const list = await fetchDepartmentsWithFallback();
      setDepartments(list);
    };
    loadDepts();
  }, [statusFilter]);

  const openReviewModal = (item) => {
    setSelectedItem(item);
    setReviewStatus(item.status === 'PENDING' ? 'UNDER_REVIEW' : 'PUBLISHED');
    setRemarks('');
    setModalError('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      await api.post(`/reviews/${selectedItem.id}`, {
        status: reviewStatus,
        remarks: remarks.trim()
      });
      setShowReviewModal(false);
      setSelectedItem(null);
      success(`Submission successfully updated to ${reviewStatus}!`);
      fetchContributions();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit review decision.';
      setModalError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInspectFile = async (item) => {
    info('Downloading submission file for verification...');
    const ok = await downloadFile(item.id, item.title);
    if (ok) {
      success('File downloaded for inspection.');
    }
  };

  const filteredItems = contributions.filter((item) => {
    if (deptFilter && String(item.department_id || '') !== String(deptFilter) && !item.department_name?.toLowerCase().includes(departments.find(d => String(d.id) === String(deptFilter))?.name.toLowerCase() || 'xyz')) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.subject_name?.toLowerCase().includes(q) ||
        item.student_name?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Verify Student Contributions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review, verify, and approve student uploads according to college academic standards across departments.
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
              <option value="ALL">Pending & Under Review</option>
              <option value="PENDING">Pending Only</option>
              <option value="UNDER_REVIEW">Under Review Only</option>
              <option value="REJECTED">Rejected Items</option>
              <option value="VERIFIED">Verified Items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by title, student contributor, or subject name..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No submissions awaiting review</h3>
          <p className="text-sm text-slate-500 mt-1">
            All submitted materials have been processed for the selected department. New student uploads will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {item.resource_type_name}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      item.status === 'UNDER_REVIEW'
                        ? 'bg-purple-100 text-purple-800'
                        : item.status === 'VERIFIED' || item.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-2">{item.title}</h3>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {item.description || 'No description provided.'}
                </p>

                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-700">Contributor:</span> {item.student_name}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Department:</span> {item.department_name}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Subject:</span> {item.subject_name}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Session:</span> AY {item.academic_year}
                  </p>
                </div>

                {item.latest_remarks && (
                  <p className="text-xs text-amber-700 italic mt-2">
                    Previous Remarks: "{item.latest_remarks}"
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewResource(item)}
                    title="Live preview document"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors p-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleInspectFile(item)}
                    title="Download file with auth"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors p-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                </div>

                <button
                  onClick={() => openReviewModal(item)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                >
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Action Modal */}
      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Review Academic Submission</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="text-xs bg-slate-50 p-3 rounded-xl space-y-1 text-slate-700 border border-slate-100">
              <p><span className="font-bold">Title:</span> {selectedItem.title}</p>
              <p><span className="font-bold">Contributor:</span> {selectedItem.student_name}</p>
              <p><span className="font-bold">Department:</span> {selectedItem.department_name}</p>
              <p><span className="font-bold">Subject:</span> {selectedItem.subject_name}</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Decision Action *</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                >
                  <option value="PUBLISHED">PUBLISH (Approve & make available to all students)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Requires faculty verification)</option>
                  <option value="REJECTED">REJECT (Request student to fix and re-upload)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Staff Remarks (Visible to student)
                </label>
                <textarea
                  rows="3"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Excellent notes! Approved for campus repository. OR Please attach Unit 4 and re-upload."
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal
          resource={previewResource}
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </div>
  );
};

export default VerifyContributions;
