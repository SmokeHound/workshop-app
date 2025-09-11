// Centralized nav loader used by all pages.
import { setActiveNav, initThemeToggle, showToast, isAuthenticated, getCurrentUser } from '../utils.js';

async function loadNav() {
  // Check authentication for protected pages
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const publicPages = ['login.html', 'index.html'];
  
  if (!publicPages.includes(currentPage) && !isAuthenticated()) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('nav.html');
    if (!res.ok) throw new Error(`Failed to load nav.html: ${res.status} ${res.statusText}`);
    const html = await res.text();
    const placeholder = document.getElementById('nav-placeholder');
    if (!placeholder) {
      console.warn('No #nav-placeholder found on page; skipping nav insertion.');
      return;
    }
    placeholder.innerHTML = html;

    // Show user info if authenticated
    if (isAuthenticated()) {
      const user = getCurrentUser();
      const userInfo = document.querySelector('.user-info, .navbar-text');
      if (userInfo) {
        userInfo.textContent = `${user.username} (${user.role})`;
      }

      // Add logout functionality
      const logoutBtn = document.querySelector('#logout-btn, .logout');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.removeItem('authToken');
          localStorage.removeItem('username');
          localStorage.removeItem('userRole');
          showToast('Logged out successfully', 'info');
          window.location.href = 'login.html';
        });
      }
    }

    // Attempt to initialize nav-related behaviors
    try {
      setActiveNav();
    } catch (e) {
      // ignore if not present
      console.warn('setActiveNav failed:', e);
    }

    try {
      // If there's a theme toggle element with id 'themeToggle', initialize it
      initThemeToggle('themeToggle');
    } catch (e) {
      console.warn('initThemeToggle failed:', e);
    }
  } catch (err) {
    console.error('Failed to load nav:', err);
    try {
      showToast?.('Navigation failed to load', 'error');
    } catch (e) {
      // ignore
    }
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', loadNav, { once: true });
} else {
  loadNav();
}