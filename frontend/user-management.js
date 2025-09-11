// User Management JS
// Handles user CRUD, role editing, password reset, search/filter, pagination, status toggle, audit log
import { fetchWithAuth, showToast, requireAuth, hasRole, getCurrentUser } from './utils.js';
import { API_BASE_URL } from '../shared/config.js';

// Require authentication and admin role
if (!requireAuth() || !hasRole('admin')) {
  showToast('Access denied. Admin role required.', 'error');
  window.location.href = 'index.html';
  throw new Error('Access denied');
}

// Load users
export async function loadUsers() {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/export`);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Failed to load users', err);
    showToast('Failed to load users: ' + err.message, 'error');
    return [];
  }
}

// Import users
export async function importUsers(users) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/import`, {
      method: 'POST',
      body: JSON.stringify({ users })
    });
    const data = await response.json();
    showToast('Users imported successfully', 'success');
    return data;
  } catch (err) {
    console.error('Failed to import users', err);
    showToast('Failed to import users: ' + err.message, 'error');
    return { error: err.message };
  }
}

// Create user
export async function createUser(username, role, password = 'TempPass123!') {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ username, role, password })
    });
    const data = await response.json();
    showToast('User created successfully', 'success');
    return data;
  } catch (err) {
    console.error('Failed to create user', err);
    showToast('Failed to create user: ' + err.message, 'error');
    return { error: err.message };
  }
}

// Update user role
export async function updateUserRole(username, role) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${encodeURIComponent(username)}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    });
    const data = await response.json();
    showToast('Role updated successfully', 'success');
    return data;
  } catch (err) {
    console.error('Failed to update role', err);
    showToast('Failed to update role: ' + err.message, 'error');
    return { error: err.message };
  }
}

// Toggle user status
export async function toggleUserStatus(username) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${encodeURIComponent(username)}/status`, {
      method: 'PATCH'
    });
    const data = await response.json();
    showToast('User status updated successfully', 'success');
    return data;
  } catch (err) {
    console.error('Failed to update status', err);
    showToast('Failed to update status: ' + err.message, 'error');
    return { error: err.message };
  }
}

// Reset user password
export async function resetUserPassword(username) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${encodeURIComponent(username)}/reset-password`, {
      method: 'POST'
    });
    const data = await response.json();
    showToast(`Password reset. New password: ${data.newPassword}`, 'success');
    return data;
  } catch (err) {
    console.error('Failed to reset password', err);
    showToast('Failed to reset password: ' + err.message, 'error');
    return { error: err.message };
  }
}

// Delete user
export async function deleteUser(username) {
  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/admin/users/${encodeURIComponent(username)}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    showToast('User deleted successfully', 'success');
    return data;
  } catch (err) {
    console.error('Failed to delete user', err);
    showToast('Failed to delete user: ' + err.message, 'error');
    return { error: err.message };
  }
}

// Validation helpers
export function validateUsername(username) {
  if (!username || username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  return { isValid: true };
}

export function canModifyUser(targetUsername) {
  const currentUser = getCurrentUser().username;
  if (targetUsername === currentUser) {
    return { canModify: false, reason: 'Cannot modify your own account' };
  }
  return { canModify: true };
}
