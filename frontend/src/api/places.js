const BASE_URL = import.meta.env?.VITE_API_URL || import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL.replace(/\/$/, '')}/api/places`;

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch places summary (counts, average rating, category distribution)
 */
export async function fetchPlacesSummary(tripId = null) {
  const url = new URL(`${API_BASE_URL}/summary`);
  if (tripId) url.searchParams.append('trip_id', tripId);

  const res = await fetch(url.toString(), { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch places summary');
  return data;
}

/**
 * Fetch places with search, category, status, trip_id, and sorting
 */
export async function fetchPlaces({ search, category, status, tripId, sortBy } = {}) {
  const url = new URL(API_BASE_URL);
  if (search && search.trim()) url.searchParams.append('search', search.trim());
  if (category && category !== 'All') url.searchParams.append('category', category);
  if (status && status !== 'All') url.searchParams.append('status', status);
  if (tripId) url.searchParams.append('trip_id', tripId);
  if (sortBy) url.searchParams.append('sort_by', sortBy);

  const res = await fetch(url.toString(), { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch places');
  return data;
}

/**
 * Fetch a single place by ID
 */
export async function fetchPlaceById(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Failed to fetch place #${id}`);
  return data;
}

/**
 * Create a new place
 */
export async function createPlace(placeData) {
  const res = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(placeData),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.detail)
      ? data.detail.map((e) => e.msg).join(', ')
      : data.detail || 'Failed to create place';
    throw new Error(errorMsg);
  }
  return data;
}

/**
 * Update an existing place
 */
export async function updatePlace(id, placeData) {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(placeData),
  });
  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.detail)
      ? data.detail.map((e) => e.msg).join(', ')
      : data.detail || 'Failed to update place';
    throw new Error(errorMsg);
  }
  return data;
}

/**
 * Patch place status (Want to Visit | Visited)
 */
export async function updatePlaceStatus(id, newStatus) {
  const res = await fetch(`${API_BASE_URL}/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status: newStatus }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update place status');
  return data;
}

/**
 * Patch place rating (1 to 5 or null)
 */
export async function updatePlaceRating(id, rating) {
  const res = await fetch(`${API_BASE_URL}/${id}/rating`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ rating }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update rating');
  return data;
}

/**
 * Delete a place
 */
export async function deletePlace(id) {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete place');
  }
  return true;
}
