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
  Fetch chat messages for a trip
 */
export async function fetchChatMessages(tripId) {
  const res = await fetch(`${API_BASE_URL}/${tripId}/chat`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch chat messages');
  return data;
}

/**
  Send a chat message to a trip
 */
export async function sendChatMessage(tripId, messageText) {
  const res = await fetch(`${API_BASE_URL}/${tripId}/chat`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify({ message: messageText }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to send message');
  return data;
}
