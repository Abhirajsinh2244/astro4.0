// src/lib/api.ts

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin;
  if (import.meta.env.VERCEL_URL) return `https://${import.meta.env.VERCEL_URL}`;
  return 'http://localhost:4321'; 
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const headers = new Headers(options.headers);
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ledger_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Ensure JSON content-type for POST/PUT requests
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(url, { ...options, headers });
};