// src/middleware/auth.middleware.ts
import { jwt } from 'hono/jwt';

export const verifyJWT = () => {
  const secret = 
    (import.meta.env && import.meta.env.JWT_SECRET) || 
    (typeof process !== 'undefined' && process.env.JWT_SECRET);

  if (!secret) {
    throw new Error("CRITICAL: JWT_SECRET is not defined in the environment.");
  }

  return jwt({
    secret: secret as string,
    alg: 'HS256'
  });
};