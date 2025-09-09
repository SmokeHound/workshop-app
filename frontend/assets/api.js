// Global API wrapper (window.api) for legacy/static pages
(function () {
  'use strict';

  function getBase() {
    try {
      if (typeof getApiBase === 'function') return getApiBase();
    } catch (e) {
      // ignore
    }
    if (typeof API_BASE_URL !== 'undefined') return API_BASE_URL;
    return '/api';
  }

  function normalizePath(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path; // absolute
    const base = getBase();
    if (path.startsWith('/')) return base.replace(/\/$/, '') + path;
    return base.replace(/\/$/, '') + '/' + path;
  }

  async function request(path, opts) {
    const url = normalizePath(path);
    const headers = Object.assign({}, opts && opts.headers ? opts.headers : {});

    // Try common localStorage keys for auth token
    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || null;
    if (token && !headers['Authorization']) headers['Authorization'] = 'Bearer ' + token;

    // Default to JSON body handling when body present and no Content-Type
    if (opts && opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

    const fetchOpts = Object.assign({}, opts, { headers: headers });

    const res = await fetch(url, fetchOpts);
    const contentType = res.headers.get('content-type') || '';

    if (!res.ok) {
      let parsed;
      try {
        parsed = contentType.includes('application/json') ? await res.json() : await res.text();
      } catch (err) {
        parsed = null;
      }
      const err = new Error((parsed && parsed.message) || res.statusText || 'Request failed');
      err.status = res.status;
      err.body = parsed;
      throw err;
    }

    if (contentType.includes('application/json')) return res.json();
    return res.text();
  }

  const api = {
    request: request,
    get: (p, opts) => request(p, Object.assign({}, opts, { method: 'GET' })),
    post: (p, body, opts) => request(p, Object.assign({}, opts, { method: 'POST', body: body != null && typeof body !== 'string' ? JSON.stringify(body) : body })),
    put: (p, body, opts) => request(p, Object.assign({}, opts, { method: 'PUT', body: body != null && typeof body !== 'string' ? JSON.stringify(body) : body })),
    patch: (p, body, opts) => request(p, Object.assign({}, opts, { method: 'PATCH', body: body != null && typeof body !== 'string' ? JSON.stringify(body) : body })),
    del: (p, opts) => request(p, Object.assign({}, opts, { method: 'DELETE' }))
  };

  // Expose globally if not already defined
  if (typeof window !== 'undefined' && !window.api) {
    window.api = api;
  }

})();