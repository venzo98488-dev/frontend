import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Download,
  Bookmark,
  Share2,
  Sparkles,
  ExternalLink,
  BookOpen,
  Building,
  Calendar,
  FileText,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { downloadFile, getResourcePreviewURL } from '../utils/downloadFile';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const ResourcePreviewModal = ({ resource, isOpen, onClose, onBookmarkToggle, isBookmarked }) => {
  const navigate = useNavigate();
  const { success, error, info } = useToast();
  const { isAuthenticated } = useAuth();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !resource) return null;

  const fileUrl = getResourcePreviewURL(resource.file_path);
  const ext = (resource.file_path || '').split('.').pop().toLowerCase();
  const isPdf = ext === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'].includes(ext);

  const handleDownload = async () => {
    setDownloading(true);
    info('Starting authenticated document download...');
    const ok = await downloadFile(resource.id, resource.title);
    setDownloading(false);
    if (ok) {
      success('Document downloaded successfully!');
    }
  };

  const handleShareLink = () => {
    const url = `${window.location.origin}/resources/${resource.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      success('Resource link copied to clipboard!');
    } else {
      prompt('Copy this link:', url);
    }
  };

  const handleStudyWithAI = () => {
    onClose();
    navigate(`/ai-tools?topic=${encodeURIComponent(resource.title)}&subject=${encodeURIComponent(resource.subject_name || '')}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col w-full transition-all duration-200 ${
          isFullscreen
            ? 'fixed inset-2 z-50 h-[calc(100vh-1rem)]'
            : 'max-w-4xl max-h-[92vh] h-[85vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center space-x-3 truncate mr-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                  {resource.resource_type_name || 'Academic Material'}
                </span>
                <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline">
                  {resource.subject_name}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate mt-0.5" title={resource.title}>
                {resource.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            {isPdf && (
              <div className="hidden sm:flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-1 mr-2 text-xs">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-medium px-1 text-slate-500">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors hidden sm:block"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Preview'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-auto bg-slate-100/60 p-4 flex flex-col items-center justify-center relative">
          {isPdf ? (
            <div
              className="w-full h-full bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden flex flex-col"
              style={{ transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : 'none', transformOrigin: 'top center' }}
            >
              <object
                data={`${fileUrl}#toolbar=1&navpanes=0`}
                type="application/pdf"
                className="w-full h-full min-h-[450px]"
              >
                <div className="p-8 text-center flex flex-col items-center justify-center h-full space-y-3">
                  <FileText className="w-12 h-12 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">
                    PDF Preview requires an embedded PDF plugin.
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm">
                    You can inspect the full verified document directly or download it using the button below.
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Browser Tab</span>
                    </a>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl inline-flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>
                  </div>
                </div>
              </object>
            </div>
          ) : isImage ? (
            <div className="max-w-full max-h-full overflow-auto flex items-center justify-center p-2">
              <img
                src={fileUrl}
                alt={resource.title}
                className="max-h-[60vh] rounded-lg shadow-md object-contain transition-transform"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              />
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center max-w-md w-full space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
                  .{ext.toUpperCase()} Document
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{resource.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Office documents and archive bundles can be reviewed after quick download.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Department:</span>
                  <span className="font-semibold text-slate-800">{resource.department_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Subject:</span>
                  <span className="font-semibold text-slate-800">{resource.subject_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Academic Year:</span>
                  <span className="font-semibold text-slate-800">{resource.academic_year}</span>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center justify-center space-x-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{downloading ? 'Preparing Download...' : 'Download to View Document'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 bg-white rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500 w-full sm:w-auto">
            <span className="flex items-center space-x-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[150px]">{resource.department_name}</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>AY {resource.academic_year}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleStudyWithAI}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-sm hover:from-purple-700 hover:to-indigo-700 transition-all"
              title="Clarify doubts & generate exam answers for this topic"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Study with AI</span>
            </button>

            {onBookmarkToggle && (
              <button
                onClick={() => onBookmarkToggle(resource.id)}
                className={`p-2 rounded-xl border transition-all text-xs flex items-center space-x-1 ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-200 text-amber-700 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Bookmark'}</span>
              </button>
            )}

            <button
              onClick={handleShareLink}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
              title="Copy link to this resource"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Downloading...' : 'Download'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePreviewModal;
