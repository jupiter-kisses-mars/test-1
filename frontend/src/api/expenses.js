const BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000';
const API_BASE_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

function getHeaders() {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Users API
export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch users');
  return data;
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create user');
  return data;
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete user');
  }
  return true;
}

// Expenses API
export async function fetchExpenses(tripId = null) {
  const url = tripId ? `${API_BASE_URL}/expenses?trip_id=${tripId}` : `${API_BASE_URL}/expenses`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch expenses');
  return data;
}

export async function previewCalculateExpense(reqData) {
  const res = await fetch(`${API_BASE_URL}/expenses/calculate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reqData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to preview expense calculation');
  return data;
}

export async function createExpense(expenseData) {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(expenseData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create expense');
  return data;
}

export async function updateExpense(id, expenseData) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(expenseData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update expense');
  return data;
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete expense');
  }
  return true;
}

// Balances & Settlements API
export async function fetchBalances(tripId = null) {
  const url = tripId ? `${API_BASE_URL}/balances?trip_id=${tripId}` : `${API_BASE_URL}/balances`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch balances');
  return data;
}

export async function fetchSettlements(tripId = null) {
  const url = tripId ? `${API_BASE_URL}/balances/settlements?trip_id=${tripId}` : `${API_BASE_URL}/balances/settlements`;
  const res = await fetch(url, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch settlements');
  return data;
}

// Dashboard Summary API
export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE_URL}/dashboard`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch dashboard summary');
  return data;
}

