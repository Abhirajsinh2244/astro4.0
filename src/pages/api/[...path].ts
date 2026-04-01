import type { APIRoute } from 'astro';
import app from '@/index.ts'; 

export const ALL: APIRoute = ({ request }) => {
  return app.fetch(request);
};