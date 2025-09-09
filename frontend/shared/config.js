// Frontend-local copy of shared config.
// NOTE: This duplicates /shared/config.js because the deployed site root is the frontend/ folder
// and the browser cannot import files above that root. Keep these in sync until a build step
// or different deploy layout consolidates them.

export const API_BASE_URL = 'https://workshop-backend.joshburt.com.au/api';

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  TECH: 'tech',
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  HIGH_CONTRAST: 'contrast',
};

export const FEATURES = {
  ENABLE_AUDIT_LOGS: true,
  ENABLE_THEME_TOGGLE: true,
  ENABLE_USER_MANAGEMENT: true,
};