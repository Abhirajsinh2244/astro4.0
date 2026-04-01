// src/db/index.ts
import { createClient } from '@supabase/supabase-js';

// 1. Resolve variables robustly across Vite and Vercel Serverless environments
const supabaseUrl = 
  (import.meta.env && import.meta.env.SUPABASE_URL) || 
  (typeof process !== 'undefined' && process.env.SUPABASE_URL);

const supabaseKey = 
  (import.meta.env && import.meta.env.SUPABASE_ANON_KEY) || 
  (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY);

// 2. Strict Guard Clause (Fail-Fast Architecture)
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "CRITICAL BOOT FAILURE: Supabase credentials are missing. " +
    "Ensure SUPABASE_URL and SUPABASE_ANON_KEY are configured in Vercel."
  );
}

// 3. Export strongly-typed client
export const supabase = createClient(
  supabaseUrl as string, 
  supabaseKey as string
);