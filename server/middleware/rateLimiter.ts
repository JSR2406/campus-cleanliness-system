import rateLimit from 'express-rate-limit';

// 10 login attempts per 15 min = reasonable human use, blocks brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per IP
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
});

// 5 registrations per 60 min = prevents spam account creation
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5, // 5 requests per IP
  message: { error: 'Too many accounts created from this IP.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 100 requests per 1 min = general API rate limit to prevent abuse
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per IP
  message: { error: 'Too many requests. Slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
