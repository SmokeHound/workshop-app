// User Management JS
// Handles user CRUD, role editing, password reset, search/filter, pagination, status toggle, audit log
import { API_BASE, fetchWithError } from './utils.js';

// Example: Load users
export async function loadUsers() {
  try {
    const res = await fetchWithError(`${API_BASE}/admin/users/export`);
    return await res.json();
  } catch (err) {
    console.error('Failed to load users', err);
    return [];
  }
}

// Example: Import users
export async function importUsers(users) {
  try {
    const res = await fetchWithError(`${API_BASE}/admin/users/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to import users', err);
    return { error: err.message };
  }
}

// Add similar functions for role editing, password reset, search/filter, pagination, status toggle, audit log
// ...existing code...
