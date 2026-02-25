import rateLimit from 'express-rate-limit';

export const coachingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many coaching requests, try again later' },
});

export const summaryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { error: 'Too many summary requests, try again later' },
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Too many requests, try again later' },
});
