# Security Middleware Testing Guide

This guide helps you verify the security middleware implementation.

## Quick Testing Steps

1. **Install dependencies and start server:**
```bash
cd backend
npm install
npm start
```

2. **Test security headers (should include Helmet headers):**
```bash
curl -I http://localhost:3000/api/login | grep -E "^(X-DNS-Prefetch-Control|X-Frame-Options|Strict-Transport-Security)"
```

3. **Test rate limiting (make multiple requests):**
```bash
for i in {1..5}; do echo "Request $i:"; curl -s -I http://localhost:3000/api/login | grep RateLimit-Remaining; done
```

4. **Test basic functionality:**
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

## Expected Results

- **Security Headers**: Should see headers like `X-DNS-Prefetch-Control`, `X-Frame-Options`, `Strict-Transport-Security`
- **Rate Limiting**: Should see `RateLimit-Remaining` count decrease with each request
- **Basic Functionality**: Should return JSON response with user info and JWT token
- **JSON Body Size Limit**: Set to 100kb (configurable via environment)

## Environment Variables

The middleware uses these environment variables with fallbacks:
- `RATE_LIMIT_WINDOW_MS=60000` (1 minute window)
- `RATE_LIMIT_MAX=100` (100 requests per window)

## Files Modified

- `backend/middleware/security.js` - New security middleware module
- `backend/server.js` - Updated to use security middleware
- `backend/package.json` - Fixed JSON syntax (dependencies were already present)