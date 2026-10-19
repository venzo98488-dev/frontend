import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Layers, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';

const ResourceTypes = () => {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [typeName, setTypeName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories/resource-types');
      setTypes(res.data.resourceTypes || []);
    } catch (err) {
      console.error('Failed to load resource types:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const openAddModal = () => {
    setEditingType(null);
    setTypeName('');
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (t) => {
    setEditingType(t);
    setTypeName(t.name);
    setModalError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) return;

    setSubmitting(true);
    try {
      if (editingType) {
        await api.put(`/categories/resource-types/${editingType.id}`, { name: typeName.trim() });
      } else {
        await api.post('/categories/resource-types', { name: typeName.trim() });
      }
      setShowModal(false);
      fetchTypes();
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to save resource type.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resource type?')) return;
    try {
      await api.delete(`/categories/resource-types/${id}`);
      fetchTypes();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete resource type.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Resource Classification Types
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Define material types like Lecture Notes, Question Banks, and Laboratory Manuals.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Resource Type</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : types.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No resource types configured.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-6">Classification Name</th>
                <th className="py-3.5 px-6">Associated Files</th>
                <th className="py-3.5 px-6">Created On</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-6 font-bold text-slate-800 text-sm">
                    {t.name}
                  </td>
                  <td className="py-3.5 px-6 font-semibold text-slate-600">
                    {t.resource_count || 0} Materials
                  </td>
                  <td className="py-3.5 px-6 text-slate-400">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">
              {editingType ? 'Edit Material Type' : 'Add Material Type'}
            </h2>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type Name *
                </label>
                <input
                  type="text"
                  required
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  placeholder="e.g. Previous-Year Question Papers"
                  className="w-full text-sm py-2 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
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
                  {submitting ? 'Saving...' : 'Save Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceTypes;
