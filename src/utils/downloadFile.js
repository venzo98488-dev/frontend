import api, { getBaseURL, getBackendURL } from '../api/axios';

/**
 * Authenticated file download utility.
 * Uses fetch with the stored JWT Bearer token so downloads are
 * recorded against the logged-in student, and staff can inspect
 * pending/under-review files without receiving 403 Forbidden.
 *
 * @param {number|string} resourceId - The resource ID to download
 * @param {string} [filename]        - Optional filename / title hint
 * @param {Function} [onProgress]    - Optional callback when download starts
 * @returns {Promise<boolean>}
 */
export const downloadFile = async (resourceId, filename, onProgress) => {
  const token = localStorage.getItem('token');
  const base = getBaseURL().replace(/\/+$/, '');

  if (onProgress && typeof onProgress === 'function') {
    onProgress('START');
  }

  try {
    const response = await fetch(`${base}/resources/${resourceId}/download`, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `Download failed with HTTP ${response.status}`);
    }

    // Try to extract filename from Content-Disposition header
    const disposition = response.headers.get('content-disposition');
    let resolvedFilename = filename || `resource-${resourceId}.pdf`;
    if (disposition) {
      const match = disposition.match(/filename[^;=\n]*=(['"]?)(.+?)\1(;|$)/);
      if (match && match[2]) resolvedFilename = match[2].trim();
    } else if (filename && !filename.includes('.')) {
      resolvedFilename = `${filename}.pdf`;
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = resolvedFilename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    if (onProgress && typeof onProgress === 'function') {
      onProgress('SUCCESS');
    }
    return true;
  } catch (err) {
    console.error('Download error:', err);
    if (onProgress && typeof onProgress === 'function') {
      onProgress('ERROR', err.message);
    }
    alert(err.message || 'Failed to download file. Please check your network or try again.');
    return false;
  }
};

/**
 * Helper to build an accessible URL for previewing a resource.
 * @param {string} filePath - relative file path (e.g. 'uploads/...')
 */
export const getResourcePreviewURL = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }
  const backendBase = getBackendURL().replace(/\/+$/, '');
  const cleanPath = filePath.replace(/^\/+/, '');
  return `${backendBase}/${cleanPath}`;
};
