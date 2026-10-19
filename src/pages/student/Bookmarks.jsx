import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { downloadFile } from '../../utils/downloadFile';
import { Bookmark, Download, Trash2, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

const Bookmarks = () => {
  const { success, error, info } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookmarks');
      setBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleRemoveBookmark = async (resourceId) => {
    try {
      await api.delete(`/bookmarks/${resourceId}`);
      setBookmarks((prev) => prev.filter((b) => b.resource_id !== resourceId));
      success('Bookmark removed.');
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      error('Failed to remove bookmark.');
    }
  };

  const handleDownload = async (resourceId, title) => {
    info('Downloading bookmarked file...');
    const ok = await downloadFile(resourceId, title);
    if (ok) {
      success('File downloaded successfully!');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          My Saved Bookmarks
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quick access to your saved study guides, notes, and question banks.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No bookmarks saved yet</h3>
          <p className="text-sm text-slate-500 mt-1">
            Browse the academic repository and click the bookmark icon on any material to save it for quick access.
          </p>
          <Link
            to="/resources"
            className="mt-5 inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Explore Resources
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((bm) => (
            <div
              key={bm.bookmark_id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                    {bm.resource_type_name}
                  </span>
                  <button
                    onClick={() => handleRemoveBookmark(bm.resource_id)}
                    title="Remove from bookmarks"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link to={`/resources/${bm.resource_id}`} className="group">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {bm.title}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {bm.description || 'No description provided.'}
                </p>

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-700">{bm.department_name}</p>
                  <p className="text-slate-500">
                    {bm.subject_name} • {bm.subject_year}
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Saved {new Date(bm.bookmarked_at).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/resources/${bm.resource_id}`}
                    className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                  >
                    Details
                  </Link>
                  <button
                    onClick={() => handleDownload(bm.resource_id, bm.title)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
