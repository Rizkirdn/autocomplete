const API_URL = 'http://localhost:5000/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Server error' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getSuggestions: () => fetchAPI('/suggestions'),
  searchSuggestions: (q, category = 'All') =>
    fetchAPI(`/suggestions/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(category)}`),
  createSuggestion: (data) => fetchAPI('/suggestions', { method: 'POST', body: JSON.stringify(data) }),
  updateSuggestion: (id, data) => fetchAPI(`/suggestions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSuggestion: (id) => fetchAPI(`/suggestions/${id}`, { method: 'DELETE' }),
  getRecent: () => fetchAPI('/suggestions/recent'),
  trackSearch: (text) => fetchAPI('/suggestions/track', { method: 'POST', body: JSON.stringify({ text }) }),
  getStats: () => fetchAPI('/suggestions/stats')
};