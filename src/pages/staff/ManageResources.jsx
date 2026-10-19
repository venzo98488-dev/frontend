import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/downloadFile';
import { fetchDepartmentsWithFallback, DEFAULT_DEPARTMENTS } from '../../utils/departments';
import ResourcePreviewModal from '../../components/ResourcePreviewModal';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Archive,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Eye,
  Building,
  BookOpen
} from 'lucide-react';

const ManageResources = () => {
  const { success, error, info } = useToast();

  const [resources, setResources] = useState([]);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [allSubjects, setAllSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  // Upload Modal (Staff Direct Upload)
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadDeptId, setUploadDeptId] = useState('1');
  const [subjectId, setSubjectId] = useState('');
  const [resourceTypeId, setResourceTypeId] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [status, setStatus] = useState('PUBLISHED');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {
        limit: 50,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (statusFilter) params.status = statusFilter;
      if (departmentId) params.department_id = departmentId;

      const res = await api.get('/resources', { params });
      setResources(res.data.data || []);
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
    const loadCategories = async () => {
      try {
        const [deptList, typeRes, subRes] = await Promise.all([
          fetchDepartmentsWithFallback(),
          api.get('/categories/resource-types'),
          api.get('/categories/subjects')
        ]);
        setDepartments(deptList);
        setResourceTypes(typeRes.data.resourceTypes || []);

        const subs = subRes.data.subjects || [];
        setAllSubjects(subs);

        const initialDept = deptList[0]?.id ? String(deptList[0].id) : '1';
        setUploadDeptId(initialDept);

        const initialMatched = subs.filter((s) => String(s.department_id) === String(initialDept));
        setFilteredSubjects(initialMatched.length > 0 ? initialMatched : subs);
        if (initialMatched.length > 0) {
          setSubjectId(String(initialMatched[0].id));
        } else if (subs.length > 0) {
          setSubjectId(String(subs[0].id));
        }

        if (typeRes.data.resourceTypes?.length > 0) {
          setResourceTypeId(String(typeRes.data.resourceTypes[0].id));
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleUploadDepartmentChange = (deptId) => {
    setUploadDeptId(deptId);
    const matched = allSubjects.filter((s) => String(s.department_id) === String(deptId));
    setFilteredSubjects(matched.length > 0 ? matched : allSubjects);
    if (matched.length > 0) {
      setSubjectId(String(matched[0].id));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');

    if (!title.trim() || !file || !subjectId || !resourceTypeId || !academicYear.trim()) {
      setUploadError('Please fill all required fields and choose a file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('subject_id', subjectId);
    formData.append('resource_type_id', resourceTypeId);
    formData.append('academic_year', academicYear.trim());
    formData.append('status', status);
    formData.append('file', file);

    setUploading(true);
    try {
      await api.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setFile(null);
      success('Academic resource published successfully!');
      fetchResources();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to upload resource.';
      setUploadError(msg);
      error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;

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
      success('Resource metadata updated successfully!');
      fetchResources();
    } catch (err) {
      error(err.response?.data?.error || 'Failed to update resource.');
    }
  };

  const handleArchive = async (id) => {
    if (!window.confirm('Are you sure you want to archive this resource?')) return;
    try {
      await api.patch(`/resources/${id}/archive`);
      success('Resource archived.');
      fetchResources();
    } catch (err) {
      error(err.response?.data?.error || 'Failed to archive resource.');
    }
  };

  const handleDownload = async (item) => {
    info('Downloading file...');
    const ok = await downloadFile(item.id, item.title);
    if (ok) {
      success('File downloaded successfully!');
      setResources((prev) =>
        prev.map((r) =>
          r.id === item.id ? { ...r, download_count: (r.download_count || 0) + 1 } : r
        )
      );
    }
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'PUBLISHED':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">Published</span>;
      case 'ARCHIVED':
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">Archived</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-bold">Rejected</span>;
      case 'VERIFIED':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">Verified</span>;
      default:
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">{s}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Manage Academic Resources
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Directly upload, edit metadata, archive outdated materials, and monitor departmental resources.
          </p>
        </div>
        <button
          onClick={() => {
            handleUploadDepartmentChange('1');
            setShowUploadModal(true);
          }}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resource</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchResources()}
            placeholder="Search by title or topic..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchResources}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No resources match the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Title & Subject</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Uploader</th>
                  <th className="py-3.5 px-4">Downloads</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.subject_name} ({item.academic_year})
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{item.department_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.resource_type_name}</td>
                    <td className="py-3.5 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {item.uploader_name}{' '}
                      <span className="text-[10px] text-slate-400">({item.uploader_role})</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {item.download_count || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setPreviewResource(item)}
                        title="Preview document"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(item)}
                        title="Download file"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingItem({ ...item });
                          setShowEditModal(true);
                        }}
                        title="Edit metadata"
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {item.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleArchive(item.id)}
                          title="Archive resource"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Direct Upload Modal with Department Selector */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Upload & Publish Academic Resource</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Lab Manual & Viva Questions"
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Department Selector for Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center space-x-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Academic Department *</span>
                </label>
                <select
                  value={String(uploadDeptId)}
                  onChange={(e) => handleUploadDepartmentChange(e.target.value)}
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
                  Subject options update to show subjects belonging to this department.
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
                          {s.name} ({s.year})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Material Type *</label>
                  <select
                    value={String(resourceTypeId)}
                    onChange={(e) => setResourceTypeId(e.target.value)}
                    required
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    {resourceTypes.map((rt) => (
                      <option key={rt.id} value={String(rt.id)}>{rt.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                  >
                    <option value="PUBLISHED">PUBLISHED (Instant Live)</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">File Attachment (PDF, DOCX, ZIP) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs py-1.5 px-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  disabled={uploading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Publish Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Edit Resource Metadata</h2>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
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
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Preview Modal */}
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

export default ManageResources;
