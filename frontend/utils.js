// utils.js

// Spinner Logic
export function showSpinner(containerId) {
  document.getElementById(containerId).innerHTML = `
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  `;
}

export function hideSpinner(containerId) {
  document.getElementById(containerId).innerHTML = '';
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
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${iconMap[type] || ''} ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
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

  btn.innerHTML = savedTheme === 'dark'
    ? '<i class="bi bi-sun"></i>'
    : '<i class="bi bi-moon"></i>';

  btn.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    btn.innerHTML = newTheme === 'dark'
      ? '<i class="bi bi-sun"></i>'
      : '<i class="bi bi-moon"></i>';
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
