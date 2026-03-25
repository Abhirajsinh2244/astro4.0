import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import transactionsRouter from '@/api/routes/transactions';

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.route('/api/transactions', transactionsRouter);

app.onError((err, c) => {
  console.error(`[Fatal Server Error] ${err.message}`, err.stack);
  return c.json({ 
    success: false, 
    error: 'Internal Server Error',
    timestamp: new Date().toISOString()
  }, 500);
});

export default app;