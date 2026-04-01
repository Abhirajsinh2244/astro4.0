import type { Context } from 'hono';
import { randomUUID } from 'crypto';
import { sign } from 'hono/jwt';
import bcrypt from 'bcryptjs';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { supabase } from '@/db/index.ts';
import { ApiResponse } from '@/utils/ApiResponse.ts';
import type { AuthDTO } from '@/models/auth.model.ts';

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const getJwtSecret = (): string => {
  const secret = 
    (import.meta.env && import.meta.env.JWT_SECRET) || 
    (typeof process !== 'undefined' && process.env.JWT_SECRET);
    
  if (!secret) {
    throw new Error("CRITICAL: JWT_SECRET is missing during token generation.");
  }
  return secret as string;
};

export const registerUser = async (c: Context) => {
  const { email, password } = await c.req.json();

  // 1. Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingUser) {
    return c.json(new ApiResponse(false, undefined, 'Email is already registered'), 409);
  }

  // 2. Hash password and create user
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);
  const userId = randomUUID();

  const { error: insertError } = await supabase
    .from('users')
    .insert([{ id: userId, email, password_hash }]);

  if (insertError) {
    console.error("Supabase Register Error:", insertError);
    return c.json(new ApiResponse(false, undefined, 'Failed to create user account'), 500);
  }

  // 3. Generate JWT
  const payload = { sub: userId, email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
  const token = await sign(payload, getJwtSecret());

  // Note: Returning token at the root level to maintain compatibility with the frontend UI
  return c.json({ success: true, token, user: { id: userId, email } }, 201);
};

export const loginUser = async (c: Context) => {
  const { email, password } = await c.req.json();

  // 1. Find the user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return c.json(new ApiResponse(false, undefined, 'Invalid credentials'), 401);
  }

  // 2. Verify password hash
  const isValid = bcrypt.compareSync(password, user.password_hash);
  if (!isValid) {
    return c.json(new ApiResponse(false, undefined, 'Invalid credentials'), 401);
  }

  // 3. Generate JWT
  const payload = { sub: user.id, email: user.email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 };
  const token = await sign(payload, getJwtSecret());

  return c.json({ success: true, token, user: { id: user.id, email: user.email } }, 200);
};