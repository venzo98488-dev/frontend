import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/downloadFile';
import { fetchDepartmentsWithFallback, DEFAULT_DEPARTMENTS } from '../../utils/departments';
import {
  UploadCloud,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  MessageSquare,
  Edit,
  Download,
  Building,
  BookOpen
} from 'lucide-react';

const MyContributions = () => {
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [contributions, setContributions] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadDeptId, setUploadDeptId] = useState(user?.department_id ? String(user.department_id) : '1');
  const [subjectId, setSubjectId] = useState('');
  const [resourceTypeId, setResourceTypeId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Modal State (for rejected items)
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editDeptId, setEditDeptId] = useState('');

  const fetchContributions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resources/my-contributions');
      setContributions(res.data.contributions || []);
    } catch (err) {
      console.error('Failed to load contributions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();

    const loadMeta = async () => {
      try {
        const [deptList, subRes, typeRes] = await Promise.all([
          fetchDepartmentsWithFallback(),
          api.get('/categories/subjects'),
          api.get('/categories/resource-types')
        ]);
        setDepartments(deptList);

        const subs = subRes.data.subjects || [];
        setAllSubjects(subs);

        const defaultDept = user?.department_id ? String(user.department_id) : (deptList[0]?.id ? String(deptList[0].id) : '1');
        setUploadDeptId(defaultDept);

        const initialFiltered = subs.filter((s) => String(s.department_id) === String(defaultDept));
        setFilteredSubjects(initialFiltered.length > 0 ? initialFiltered : subs);
        if (initialFiltered.length > 0) {
          setSubjectId(String(initialFiltered[0].id));
        } else if (subs.length > 0) {
          setSubjectId(String(subs[0].id));
        }

        const types = typeRes.data.resourceTypes || [];
        setResourceTypes(types);
        if (types.length > 0) setResourceTypeId(String(types[0].id));
      } catch (err) {
        console.error('Failed to load categories for contribution:', err);
      }
    };
    loadMeta();
  }, [user]);

  // Handle department change in upload modal
  const handleDepartmentChange = (deptId) => {
    setUploadDeptId(deptId);
    const matched = allSubjects.filter((s) => String(s.department_id) === String(deptId));
    setFilteredSubjects(matched.length > 0 ? matched : allSubjects);
    if (matched.length > 0) {
      setSubjectId(String(matched[0].id));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim() || !file || !subjectId || !resourceTypeId || !academicYear.trim()) {
      setFormError('Please complete all required fields and select a file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('subject_id', subjectId);
    formData.append('resource_type_id', resourceTypeId);
    formData.append('academic_year', academicYear.trim());
    formData.append('file', file);

    setSubmitting(true);
    try {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setFile(null);
      success('Material submitted successfully! Staff will review and verify your contribution.');
      fetchContributions();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit contribution.';
      setFormError(msg);
      error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

    setSubmitting(true);
    try {
      await api.put(`/resources/${editingItem.id}`, {
        title: editingItem.title,
        description: editingItem.description,
        subject_id: editingItem.subject_id,
        resource_type_id: editingItem.resource_type_id,
        academic_year: editingItem.academic_year
      });
      setShowEditModal(false);
      setEditingItem(null);
      success('Contribution updated and resubmitted for faculty verification!');
      fetchContributions();
    } catch (err) {
      error(err.response?.data?.error || 'Failed to update contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Published</span>
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
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
            <XCircle className="w-3.5 h-3.5" />
            <span>Changes Requested</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            My Academic Contributions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload lecture notes, solved papers, and lab reports to help classmates and earn peer recognition.
          </p>
        </div>

        <button
          onClick={() => {
            const defaultDept = user?.department_id ? String(user.department_id) : '1';
            handleDepartmentChange(defaultDept);
            setShowUploadModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Contribute Notes</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : contributions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <UploadCloud className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No contributions yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Share your lecture notes, lab records, or solved assignments with fellow students.
          </p>
          <button
            onClick={() => {
              const defaultDept = user?.department_id ? String(user.department_id) : '1';
              handleDepartmentChange(defaultDept);
              setShowUploadModal(true);
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-indigo-700"
          >
            Upload First Note
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {contributions.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
                      {item.resource_type_name}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    <span className="font-semibold text-slate-700">{item.department_name}</span> • {item.subject_name} • AY {item.academic_year}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(item.status)}
                  <button
                    onClick={() => downloadFile(item.id, item.title)}
                    title="Download / View submitted file"
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {item.status === 'REJECTED' && (
                    <button
                      onClick={() => {
                        setEditingItem({ ...item });
                        setShowEditModal(true);
                      }}
                      className="inline-flex items-center text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Fix & Resubmit
                    </button>
                  )}
                </div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {item.description}
                </p>
              )}

              {/* Staff Review Remarks */}
              {item.latest_remarks && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start space-x-2 text-xs text-amber-900">
                  <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Staff Review Remarks:</span>{' '}
                    <span>{item.latest_remarks}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Submitted on {new Date(item.created_at).toLocaleDateString()}</span>
                <span>{item.download_count || 0} downloads</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Contribution Modal with Department Selector */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Contribute Academic Resource</h2>
              <button
                onClick={() => setShowUploadModal(false)}
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

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Unit 1-5 Lecture Notes with Diagrams"
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Select Department *</span>
                </label>
                <select
                  value={String(uploadDeptId)}
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
                <p className="mt-1 text-[11px] text-slate-400">
                  Subject list updates automatically to match selected department.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                      <option value="">No subjects found for this dept</option>
                    ) : (
                      filteredSubjects.map((s) => (
                        <option key={s.id} value={String(s.id)}>
                          {s.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Material Type *
                  </label>
                  <select
                    value={String(resourceTypeId)}
                    onChange={(e) => setResourceTypeId(e.target.value)}
                    required
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {resourceTypes.map((rt) => (
                      <option key={rt.id} value={String(rt.id)}>
                        {rt.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Academic Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2026-27"
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Attach File (PDF, DOCX, PPT, ZIP) *
                  </label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Topic Coverage
                </label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline topics covered, author/faculty name, etc."
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Submit for Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fix & Resubmit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Fix & Resubmit Material</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl"
                ></textarea>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  {submitting ? 'Saving...' : 'Resubmit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyContributions;
