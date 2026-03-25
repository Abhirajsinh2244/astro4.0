import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { supabase } from '@/lib/supabase';
import { transactionSchema, type Transaction, type ApiResponse } from '@/lib/types';

const transactionsRouter = new Hono()
  .get('/', async (c) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[Supabase GET Error]", error);
      return c.json<ApiResponse<null>>({ success: false, error: 'Database query failed.' }, 500);
    }
    return c.json<ApiResponse<Transaction[]>>({ success: true, data: data as Transaction[], timestamp: new Date().toISOString() });
  })
  .post(
    '/',
    zValidator('json', transactionSchema, (result, c) => {
      if (!result.success) return c.json<ApiResponse<null>>({ success: false, error: 'Payload validation failed', details: result.error.issues }, 400);
    }),
    async (c) => {
      const payload = await c.req.valid('json');
      const newRecord: Transaction = { id: crypto.randomUUID(), ...payload };
      const { data, error } = await supabase.from('transactions').insert([newRecord]).select().single();

      if (error) return c.json<ApiResponse<null>>({ success: false, error: 'Failed to persist record.' }, 500);
      return c.json<ApiResponse<Transaction>>({ success: true, data: data as Transaction }, 201);
    }
  )
  .put(
    '/:id',
    zValidator('json', transactionSchema, (result, c) => {
      if (!result.success) return c.json<ApiResponse<null>>({ success: false, error: 'Payload validation failed', details: result.error.issues }, 400);
    }),
    async (c) => {
      const id = c.req.param('id');
      const payload = await c.req.valid('json');
      const { data, error } = await supabase.from('transactions').update(payload).eq('id', id).select().single();

      if (error) return c.json<ApiResponse<null>>({ success: false, error: 'Failed to update record.' }, 500);
      if (!data) return c.json<ApiResponse<null>>({ success: false, error: 'Record not found.' }, 404);
      return c.json<ApiResponse<Transaction>>({ success: true, data: data as Transaction }, 200);
    }
  )
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    const { data, error } = await supabase.from('transactions').delete().eq('id', id).select();

    if (error) return c.json<ApiResponse<null>>({ success: false, error: 'Failed to delete record.' }, 500);
    if (!data || data.length === 0) return c.json<ApiResponse<null>>({ success: false, error: 'Record not found.' }, 404);
    return c.json<ApiResponse<{ deletedId: string }>>({ success: true, data: { deletedId: id } }, 200);
  });

export default transactionsRouter;