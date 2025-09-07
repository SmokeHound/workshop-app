// Admin Tools JS
// Handles bulk import/export, role access, logs, announcements, sessions, API keys, backup/restore
// frontend/admin-tools.js

import { fetchWithError } from './utils.js';
import { API_BASE_URL } from './shared/config.js';

// …rest of file remains unchanged

// Example: Load announcements
export async function loadAnnouncements() {
  try {
    const res = await fetchWithError(`${API_BASE}/admin/announcements`);
    return await res.json();
  } catch (err) {
    console.error('Failed to load announcements', err);
    return [];
  }
}

// Example: Post announcement
export async function postAnnouncement(text) {
  try {
    const res = await fetchWithError(`${API_BASE}/admin/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to post announcement', err);
    return { error: err.message };
  }
}

// Add similar functions for users, roles, logs, sessions, apikeys, backup/restore as needed
// ...existing code...
