/**
 * Extract a user-friendly message from an API/axios error.
 */
export function getApiErrorMessage(err, fallback = 'Something went wrong') {
  if (!err?.response) {
    if (err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
      return 'Cannot reach the server. Make sure the backend is running on port 8000.';
    }
    return err?.message || fallback;
  }

  const detail = err.response.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || d.message || JSON.stringify(d)).join(', ');
  }
  if (detail && typeof detail === 'object') {
    return detail.message || fallback;
  }

  return fallback;
}
