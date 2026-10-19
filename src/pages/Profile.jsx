import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import {
  User,
  Mail,
  Building,
  Shield,
  Calendar,
  BookOpen,
  Edit2,
  Check,
  X,
  Sparkles,
  Save,
  AlertCircle
} from 'lucide-react';
import { fetchDepartmentsWithFallback, DEFAULT_DEPARTMENTS } from '../utils/departments';

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const { success, error } = useToast();
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENTS);
  const [loading, setLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDeptId, setEditDeptId] = useState('');
  const [editSemester, setEditSemester] = useState('Semester 1');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchProfileAndDepts = async () => {
    try {
      const [profileRes, deptList] = await Promise.all([
        api.get('/auth/me'),
        fetchDepartmentsWithFallback()
      ]);
      const userData = profileRes.data.user;
      setProfile(userData);
      setDepartments(deptList || DEFAULT_DEPARTMENTS);
      setEditName(userData.name || '');
      setEditDeptId(userData.department_id ? String(userData.department_id) : '1');
      setEditSemester(userData.semester || 'Semester 1');
    } catch (err) {
      console.error('Failed to load profile details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndDepts();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaving(true);

    try {
      const payload = {
        name: editName.trim(),
        department_id: editDeptId ? parseInt(editDeptId, 10) : null
      };
      if (user?.role === 'STUDENT') {
        payload.semester = editSemester;
      }

      const res = await api.put('/auth/profile', payload);
      const updatedUser = res.data.user;
      setProfile(updatedUser);
      updateUser(updatedUser);
      setIsEditing(false);
      success('Academic profile & department affiliation updated successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      const msg = err.response?.data?.error || 'Failed to update profile settings.';
      setSaveError(msg);
      error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = profile || authUser;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Academic Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your academic credentials, departmental affiliation, and curriculum semester.
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => {
              setEditName(user?.name || '');
              setEditDeptId(user?.department_id ? String(user?.department_id) : '1');
              setEditSemester(user?.semester || 'Semester 1');
              setIsEditing(true);
            }}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all border border-indigo-200 self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Change Department / Profile</span>
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(false)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Cover / Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl font-bold shadow-inner">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{user?.name}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-indigo-100">
                  {user?.role}
                </span>
                <span className="text-xs text-indigo-200 font-medium">
                  {user?.department_name || 'General Department'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form or Display */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="p-6 sm:p-8 space-y-5 bg-indigo-50/20">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-200 text-indigo-900 font-bold text-sm">
              <Building className="w-4 h-4 text-indigo-600" />
              <span>Update Affiliation & Department</span>
            </div>

            {saveError && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Academic Department *
                </label>
                <select
                  value={String(editDeptId)}
                  onChange={(e) => setEditDeptId(e.target.value)}
                  required
                  className="w-full text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium text-slate-900"
                >
                  <option value="">-- Select Your Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  Selecting your official department prioritizes relevant course notes and past exams on your dashboard.
                </p>
              </div>

              {user?.role === 'STUDENT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enrolled Semester
                  </label>
                  <select
                    value={editSemester}
                    onChange={(e) => setEditSemester(e.target.value)}
                    className="w-full text-sm py-2.5 px-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 font-medium"
                  >
                    {[
                      'Semester 1',
                      'Semester 2',
                      'Semester 3',
                      'Semester 4',
                      'Semester 5',
                      'Semester 6',
                      'Semester 7',
                      'Semester 8'
                    ].map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center space-x-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Profile Info Grid */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <Mail className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">College Email</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <Building className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Department</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {user?.department_name || 'Institutional'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <Shield className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Role Access Level</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {user?.role === 'STAFF' || user?.role === 'ADMIN'
                      ? 'Faculty / Administrative'
                      : 'Enrolled Student'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <Calendar className="w-5 h-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase">Member Since</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString()
                      : 'Active Member'}
                  </p>
                </div>
              </div>

              {user?.semester && (
                <div className="flex items-start space-x-3 p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 sm:col-span-2">
                  <BookOpen className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-indigo-600 uppercase">Current Enrolled Semester</p>
                    <p className="text-sm font-bold text-indigo-900 mt-0.5">
                      {user.semester}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
