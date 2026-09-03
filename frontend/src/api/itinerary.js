const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL.replace(/\/$/, '')}/api/trips`;

function getAuthHeader() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
  Fetch itinerary items for a specific trip
 */
export async function fetchItinerary(tripId) {
  const res = await fetch(`${API_BASE_URL}/${tripId}/itinerary`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch itinerary');
  return data;
}

/**
  Create a new itinerary item for a trip
 */
export async function createItineraryItem(tripId, itemData) {
  const res = await fetch(`${API_BASE_URL}/${tripId}/itinerary`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(itemData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create itinerary activity');
  return data;
}

/**
  Update an itinerary item
 */
export async function updateItineraryItem(tripId, itemId, itemData) {
  const res = await fetch(`${API_BASE_URL}/${tripId}/itinerary/${itemId}`, {
    method: 'PUT',
    headers: getAuthHeader(),
    body: JSON.stringify(itemData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update itinerary activity');
  return data;
}

/**
  Delete an itinerary item
 */
export async function deleteItineraryItem(tripId, itemId) {
  const res = await fetch(`${API_BASE_URL}/${tripId}/itinerary/${itemId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete itinerary activity');
  }
  return true;
}
