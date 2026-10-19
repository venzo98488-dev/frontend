import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/downloadFile';
import ResourcePreviewModal from '../../components/ResourcePreviewModal';
import { fetchDepartmentsWithFallback, DEFAULT_DEPARTMENTS } from '../../utils/departments';
import {
  Search,
  Filter,
  Download,
  Bookmark,
  Calendar,
  Building,
  BookOpen,
  FileText,
  RotateCcw,
  ExternalLink,
  Eye,
  Sparkles
} from 'lucide-react';

const Resources = () => {
  const { isAuthenticated, user } = useAuth();
  const { success, error, info } = useToast();

  // Filter state
  const [keyword, setKeyword] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [resourceTypeId, setResourceTypeId] = useState('');
  const [year, setYear] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [page, setPage] = useState(1);

  // Metadata dropdowns
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [subjects, setSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // Data state
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [previewResource, setPreviewResource] = useState(null);

  // Load dropdown categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const [deptList, typeRes, yrRes] = await Promise.all([
          fetchDepartmentsWithFallback(),
          api.get('/categories/resource-types'),
          api.get('/categories/academic-years')
        ]);
        setDepartments(deptList || DEFAULT_DEPARTMENTS);
        setResourceTypes(typeRes.data.resourceTypes || []);
        setAcademicYears(yrRes.data.academicYears || []);
      } catch (err) {
        console.error('Failed to load category filters:', err);
      }
    };
    loadCategories();
  }, []);

  // Load subjects whenever department, year, or semester changes
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const params = {};
        if (departmentId) params.department_id = departmentId;
        if (year) params.year = year;
        if (semester) params.semester = semester;

        const res = await api.get('/categories/subjects', { params });
        setSubjects(res.data.subjects || []);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjects();
  }, [departmentId, year, semester]);

  // Load user bookmarks if logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadBookmarks = async () => {
      try {
        const res = await api.get('/bookmarks');
        const ids = new Set((res.data.bookmarks || []).map((b) => b.resource_id));
        setBookmarkedIds(ids);
      } catch (err) {
        console.error('Failed to load user bookmarks:', err);
      }
    };
    loadBookmarks();
  }, [isAuthenticated]);

  // Fetch resources based on current filters
  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sortBy,
        sortOrder: 'DESC'
      };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (departmentId) params.department_id = departmentId;
      if (subjectId) params.subject_id = subjectId;
      if (resourceTypeId) params.resource_type_id = resourceTypeId;
      if (year) params.year = year;
      if (semester) params.semester = semester;
      if (academicYear) params.academic_year = academicYear;

      const res = await api.get('/resources', { params });
      setResources(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, totalPages: 1, page: 1 });
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [page, departmentId, subjectId, resourceTypeId, year, semester, academicYear, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleResetFilters = () => {
    setKeyword('');
    setDepartmentId('');
    setSubjectId('');
    setResourceTypeId('');
    setYear('');
    setSemester('');
    setAcademicYear('');
    setSortBy('created_at');
    setPage(1);
  };

  const handleBookmarkToggle = async (resourceId) => {
    if (!isAuthenticated) {
      alert('Please log in to bookmark resources.');
      return;
    }
    const isCurrentlyBookmarked = bookmarkedIds.has(resourceId);
    try {
      if (isCurrentlyBookmarked) {
        await api.delete(`/bookmarks/${resourceId}`);
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(resourceId);
          return next;
        });
        success('Bookmark removed.');
      } else {
        await api.post(`/bookmarks/${resourceId}`);
        setBookmarkedIds((prev) => new Set([...prev, resourceId]));
        success('Resource saved to bookmarks!');
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      error('Failed to update bookmark.');
    }
  };

  const handleDownload = async (resource) => {
    info('Downloading file...');
    const ok = await downloadFile(resource.id, resource.title);
    if (ok) {
      success('Download completed!');
      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id ? { ...r, download_count: (r.download_count || 0) + 1 } : r
        )
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Academic Resources Repository
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and filter verified course notes, exam papers, syllabus copies, and lab manuals across departments.
        </p>
      </div>

      {/* Quick Department Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Departments:
        </span>
        <button
          onClick={() => {
            setDepartmentId('');
            setSubjectId('');
            setPage(1);
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
            departmentId === ''
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Departments
        </button>

        {user?.department_id && (
          <button
            onClick={() => {
              setDepartmentId(String(user.department_id));
              setSubjectId('');
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center space-x-1 ${
              String(departmentId) === String(user.department_id)
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>My Department ({user.department_name || 'Assigned'})</span>
          </button>
        )}

        {departments.map((dept) => {
          const isSelected = String(departmentId) === String(dept.id);
          return (
            <button
              key={dept.id}
              onClick={() => {
                setDepartmentId(isSelected ? '' : String(dept.id));
                setSubjectId('');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {dept.shortName || dept.name}
            </button>
          );
        })}
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        {/* Keyword Search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-grow">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by resource title, topic, or description..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setSubjectId('');
                setPage(1);
              }}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Subject
            </label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Resource Type
            </label>
            <select
              value={resourceTypeId}
              onChange={(e) => {
                setResourceTypeId(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">All Types</option>
              {resourceTypes.map((rt) => (
                <option key={rt.id} value={String(rt.id)}>
                  {rt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Year of Study
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setSubjectId('');
                setPage(1);
              }}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">All Years</option>
              {['I Year', 'II Year', 'III Year', 'IV Year'].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setSubjectId('');
                setPage(1);
              }}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">All Semesters</option>
              {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
                'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full text-xs py-2 px-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
            >
              <option value="created_at">Newest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Action bar below filters */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{resources.length}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.total}</span> materials
          </span>

          <button
            onClick={handleResetFilters}
            className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No resources found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your department filter or search terms. If you can't find what you need, submit a resource request!
          </p>
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
            <Link
              to="/student/requests"
              className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Request This Resource
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => {
            const isBookmarked = bookmarkedIds.has(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between p-5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                      {item.resource_type_name}
                    </span>
                    <button
                      onClick={() => handleBookmarkToggle(item.id)}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this resource'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isBookmarked
                          ? 'bg-amber-50 text-amber-600'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  <Link to={`/resources/${item.id}`} className="group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {item.description || 'Verified course document for college syllabus.'}
                  </p>

                  <div className="mt-4 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center space-x-1.5">
                      <Building className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate font-medium text-slate-700">{item.department_name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {item.subject_name} {item.subject_year ? `(${item.subject_year})` : ''}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>AY {item.academic_year}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">
                    {item.download_count || 0} downloads
                  </span>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewResource(item)}
                      title="Quick Preview"
                      className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-slate-600 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Resource Quick Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal
          resource={previewResource}
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarked={bookmarkedIds.has(previewResource.id)}
        />
      )}
    </div>
  );
};

export default Resources;
