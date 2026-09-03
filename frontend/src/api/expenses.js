const API_BASE_URL = 'http://localhost:8000/api';

// Users API
export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/users`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch users');
  return data;
}

export async function createUser(userData) {
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create user');
  return data;
}

export async function deleteUser(id) {
  const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete user');
  }
  return true;
}

// Expenses API
export async function fetchExpenses() {
  const res = await fetch(`${API_BASE_URL}/expenses`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch expenses');
  return data;
}

export async function previewCalculateExpense(reqData) {
  const res = await fetch(`${API_BASE_URL}/expenses/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reqData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to preview expense calculation');
  return data;
}

export async function createExpense(expenseData) {
  const res = await fetch(`${API_BASE_URL}/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create expense');
  return data;
}

export async function updateExpense(id, expenseData) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expenseData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update expense');
  return data;
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_BASE_URL}/expenses/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || 'Failed to delete expense');
  }
  return true;
}

// Balances & Settlements API
export async function fetchBalances() {
  const res = await fetch(`${API_BASE_URL}/balances`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch balances');
  return data;
}

export async function fetchSettlements() {
  const res = await fetch(`${API_BASE_URL}/balances/settlements`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch settlements');
  return data;
}

// Dashboard Summary API
export async function fetchDashboardSummary() {
  const res = await fetch(`${API_BASE_URL}/dashboard`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch dashboard summary');
  return data;
}
