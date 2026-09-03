const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL.replace(/\/$/, '')}/api/trips`;


function getAuthHeader() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

/**
 * Fetch all trips accessible by current logged in user
 */
export async function fetchTrips() {
  const response = await fetch(`${API_BASE_URL}`, {
    headers: getAuthHeader(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch trips');
  }
  return data;
}

/**
 * Fetch detailed info for a single trip
 */
export async function fetchTripById(tripId) {
  const response = await fetch(`${API_BASE_URL}/${tripId}`, {
    headers: getAuthHeader(),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to fetch trip details');
  }
  return data;
}

/**
 * Create a new trip
 * @param {Object} tripData - { title, destination, start_date, end_date, description, cover_image, invite_emails }
 */
export async function createTrip(tripData) {
  const response = await fetch(`${API_BASE_URL}`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(tripData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to create trip');
  }
  return data;
}

/**
 * Add a collaborator to a trip by email
 */
export async function addTripMember(tripId, email) {
  const response = await fetch(`${API_BASE_URL}/${tripId}/members`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || 'Failed to add member to trip');
  }
  return data;
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId) {
  const response = await fetch(`${API_BASE_URL}/${tripId}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete trip');
  }
  return true;
}
