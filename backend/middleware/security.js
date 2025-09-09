const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const express = require('express');

function applySecurity(app) {
  // Helmet helps set secure HTTP headers
  app.use(helmet());

  // Basic rate limiter using environment variables with sensible defaults
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000; // 1 minute
  const max = parseInt(process.env.RATE_LIMIT_MAX, 10) || 100;

  const limiter = rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });

  // Apply limiter to all requests
  app.use(limiter);

  // Enforce a reasonable JSON body size limit
  app.use(express.json({ limit: '100kb' }));
}

module.exports = { applySecurity };