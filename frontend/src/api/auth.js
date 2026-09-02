const API_BASE_URL = 'http://localhost:8000/api/auth';

/**
 * Register a new user
 * @param {Object} userData - { full_name, email, password, confirm_password }
 */
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Registration failed');
  }

  return data;
}

/**
 * Log in an existing user
 * @param {Object} credentials - { email, password }
 */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed');
  }

  // Store token in localStorage
  if (data.access_token) {
    localStorage.setItem('token', data.access_token);
  }

  return data;
}

/**
 * Get current logged in user details using stored JWT token
 */
export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    localStorage.removeItem('token');
    return null;
  }

  return await response.json();
}

/**
 * Log out user by removing token
 */
export function logoutUser() {
  localStorage.removeItem('token');
}
