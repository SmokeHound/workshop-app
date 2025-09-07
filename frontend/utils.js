// ...existing code...

import { API_BASE_URL as DEFAULT_API_BASE_URL } from '../shared/config.js';

// Utility to get API base, allowing localStorage override for dev/testing
export function getApiBase() {
  return localStorage.getItem('API_BASE')?.trim() || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = DEFAULT_API_BASE_URL;
// utils.js
// Import API_BASE_URL from shared config
import { API_BASE_URL } from '../shared/config.js';

// Utility for fetch with error handling
export async function fetchWithError(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || response.statusText);
  }
  return response.json();
}

// Spinner Logic
export function showSpinner(containerId) {
  const container = document.getElementById(containerId);
  container.textContent = '';
  const spinner = document.createElement('div');
  spinner.className = 'spinner-border text-primary';
  spinner.setAttribute('role', 'status');
  const span = document.createElement('span');
  span.className = 'visually-hidden';
  span.textContent = 'Loading...';
  spinner.appendChild(span);
  container.appendChild(spinner);
}

export function hideSpinner(containerId) {
  document.getElementById(containerId).textContent = '';
}

// Toast System
export function showToast(message, type = 'info') {
  const iconMap = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${type} border-0 show`;
  toast.role = 'alert';
  const dFlex = document.createElement('div');
  dFlex.className = 'd-flex';
  const toastBody = document.createElement('div');
  toastBody.className = 'toast-body';
  toastBody.textContent = `${iconMap[type] || ''} ${message}`;
  const btnClose = document.createElement('button');
  btnClose.type = 'button';
  btnClose.className = 'btn-close btn-close-white me-2 m-auto';
  btnClose.setAttribute('data-bs-dismiss', 'toast');
  dFlex.appendChild(toastBody);
  dFlex.appendChild(btnClose);
  toast.appendChild(dFlex);
  document.getElementById('toastContainer').appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Theme Toggle Logic
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('themePreference', theme);
  updateGlassyEffects(theme);
}

export function initThemeToggle(toggleBtnId) {
  const btn = document.getElementById(toggleBtnId);
  const savedTheme = localStorage.getItem('themePreference') || 'light';
  applyTheme(savedTheme);
  btn.textContent = '';
  const icon = document.createElement('i');
  icon.className = savedTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon';
  btn.appendChild(icon);
  btn.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    btn.textContent = '';
    const newIcon = document.createElement('i');
    newIcon.className = newTheme === 'dark' ? 'bi bi-sun' : 'bi bi-moon';
    btn.appendChild(newIcon);
  });
}

function updateGlassyEffects(theme) {
  const glassElements = document.querySelectorAll('.glassy');
  glassElements.forEach(el => {
    el.style.backdropFilter = 'blur(10px)';
    el.style.backgroundColor = theme === 'dark'
      ? 'rgba(25, 25, 25, 0.5)'
      : 'rgba(255, 255, 255, 0.5)';
    el.style.transition = 'background-color 0.3s ease';
  });
}
