// Utility to set active nav item
export function setActiveNav() {
  const currentPage = location.pathname.split('/').pop().split('?')[0].split('#')[0];
  document.querySelectorAll('.nav-link[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}
import { API_BASE_URL as DEFAULT_API_BASE_URL } from './shared/config.js';

// Utility to get API base, allowing localStorage override for dev/testing
export function getApiBase() {
  return localStorage.getItem('API_BASE')?.trim() || DEFAULT_API_BASE_URL;
}

export const API_BASE_URL = DEFAULT_API_BASE_URL;

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
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    console.warn('Toast container not found');
    return;
  }
  
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
  toastContainer.appendChild(toast);
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
  if (!btn) {
    console.warn(`Theme toggle button with id '${toggleBtnId}' not found`);
    return;
  }
  
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

// Authentication utilities
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function getCurrentUser() {
  return {
    username: localStorage.getItem('username'),
    role: localStorage.getItem('userRole'),
    token: getAuthToken()
  };
}

export function isAuthenticated() {
  return !!getAuthToken();
}

export function hasRole(role) {
  const userRole = localStorage.getItem('userRole');
  return userRole === role;
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  localStorage.removeItem('userRole');
  window.location.href = 'login.html';
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Authenticated fetch wrapper
export async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  if (!token) {
    throw new Error('No authentication token available');
  }

  const authOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const response = await fetch(url, authOptions);
  
  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('Authentication failed');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || response.statusText);
  }
  
  return response;
}

// Password validation
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
