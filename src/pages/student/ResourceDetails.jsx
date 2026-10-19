import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/downloadFile';
import ResourcePreviewModal from '../../components/ResourcePreviewModal';
import {
  Download,
  Bookmark,
  Calendar,
  Building,
  BookOpen,
  User,
  ArrowLeft,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
  Eye,
  Sparkles
} from 'lucide-react';

const ResourceDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/resources/${id}`);
        setResource(res.data.resource);

        if (isAuthenticated) {
          const bmRes = await api.get(`/bookmarks/check/${id}`);
          setIsBookmarked(bmRes.data.isBookmarked);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load resource details.');
      } finally {
        setLoading(false);
      }
    };
    fetchResource();
  }, [id, isAuthenticated]);

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated) {
      toastError('Please log in to bookmark resources.');
      return;
    }
    try {
      if (isBookmarked) {
        await api.delete(`/bookmarks/${id}`);
        setIsBookmarked(false);
        success('Bookmark removed.');
      } else {
        await api.post(`/bookmarks/${id}`);
        setIsBookmarked(true);
        success('Resource bookmarked!');
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      toastError('Failed to toggle bookmark.');
    }
  };

  const handleDownload = async () => {
    info('Downloading file...');
    const ok = await downloadFile(resource.id, resource.title);
    if (ok) {
      success('File downloaded successfully!');
      setResource((prev) => ({
        ...prev,
        download_count: (prev.download_count || 0) + 1
      }));
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-900">Resource Unavailable</h2>
          <p className="text-sm text-slate-500 mt-2">{error || 'Resource not found.'}</p>
          <Link
            to="/resources"
            className="mt-5 inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <Link
        to="/resources"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Back to Resources
      </Link>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                {resource.resource_type_name}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-md font-semibold ${
                  resource.status === 'PUBLISHED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {resource.status}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {resource.title}
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm rounded-xl transition-all"
            >
              <Eye className="w-4 h-4 text-indigo-600" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleBookmarkToggle}
              className={`p-2.5 rounded-xl border transition-all ${
                isBookmarked
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Resource</span>
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Description / Overview
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            {resource.description || 'No detailed description provided for this academic resource.'}
          </p>
        </div>

        {/* Academic Metadata Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Curriculum Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Department</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{resource.department_name}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Subject</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{resource.subject_name}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Year / Semester</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {resource.subject_year} • {resource.subject_semester}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Academic Session</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">AY {resource.academic_year}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Uploaded By</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {resource.uploader_name} ({resource.uploader_role})
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Usage Statistics</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{resource.download_count || 0} Downloads</p>
            </div>
          </div>
        </div>

        {/* Verification / Review Audit Trail (if present) */}
        {resource.reviews && resource.reviews.length > 0 && (
          <div className="pt-4 border-t border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Staff Verification Audit Log</span>
            </h2>
            <div className="space-y-2.5">
              {resource.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-start"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800">{rev.reviewer_name}</span>
                      <span className="font-semibold text-indigo-600">[{rev.status}]</span>
                    </div>
                    {rev.remarks && (
                      <p className="mt-1 text-slate-600">{rev.remarks}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(rev.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {resource && (
        <ResourcePreviewModal
          resource={resource}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          onBookmarkToggle={handleBookmarkToggle}
          isBookmarked={isBookmarked}
        />
      )}
    </div>
  );
};

export default ResourceDetails;
