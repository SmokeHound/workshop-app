// Centralized nav loader used by all pages.
import { setActiveNav, initThemeToggle, showToast } from '../utils.js';

async function loadNav() {
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