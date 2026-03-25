import type { APIRoute } from 'astro';
import app from '@/api/routes/index'; 

export const ALL: APIRoute = ({ request }) => {
  return app.fetch(request);
};