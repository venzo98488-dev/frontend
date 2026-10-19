import api from '../api/axios';

/**
 * Standard Academic Departments with short codes and display names.
 * Used across Register, Resources, Upload/Contributions, Staff Management, and Profile.
 */
export const DEFAULT_DEPARTMENTS = [
  { id: 1, name: 'Artificial Intelligence & Data Science', code: 'AI&DS', shortName: 'AI & Data Science' },
  { id: 2, name: 'Computer Science & Engineering', code: 'CSE', shortName: 'Computer Science' },
  { id: 3, name: 'Information Technology', code: 'IT', shortName: 'Info Technology' },
  { id: 4, name: 'Electronics & Communication Engineering', code: 'ECE', shortName: 'Electronics & Comm.' },
  { id: 5, name: 'Mechanical Engineering', code: 'MECH', shortName: 'Mechanical Engg.' },
  { id: 6, name: 'Electrical & Electronics Engineering', code: 'EEE', shortName: 'Electrical Engg.' },
  { id: 7, name: 'Civil Engineering', code: 'CIVIL', shortName: 'Civil Engg.' },
  { id: 8, name: 'Master of Business Administration (MBA)', code: 'MBA', shortName: 'MBA / Management' },
  { id: 9, name: 'Science & Humanities', code: 'S&H', shortName: 'Basic Sciences' }
];

/**
 * Fetch departments from backend with automatic fallback to DEFAULT_DEPARTMENTS
 * so users never see an empty dropdown or get blocked.
 */
export const fetchDepartmentsWithFallback = async () => {
  try {
    const res = await api.get('/categories/departments');
    if (res.data?.departments && res.data.departments.length > 0) {
      return res.data.departments;
    }
    return DEFAULT_DEPARTMENTS;
  } catch (err) {
    console.warn('Backend departments fetch failed, using college department taxonomy:', err);
    return DEFAULT_DEPARTMENTS;
  }
};

/**
 * Helper to get department name by ID
 */
export const getDepartmentName = (deptId, departments = DEFAULT_DEPARTMENTS) => {
  if (!deptId) return 'General Department';
  const found = departments.find((d) => String(d.id) === String(deptId));
  return found ? found.name : 'General Department';
};
