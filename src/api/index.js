import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()
app.use('/*', cors())

// CRUD Endpoints
app.get('/transactions', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM transactions ORDER BY created_at DESC',
  ).all()
  return c.json(results)
})

app.post('/transactions', async (c) => {
  const { name, amount, category } = await c.req.json()
  const { success } = await c.env.DB.prepare(
    'INSERT INTO transactions (name, amount, category) VALUES (?, ?, ?)',
  )
    .bind(name, amount, category)
    .run()
  return c.json({ success })
})

app.delete('/transactions/:id', async (c) => {
  const id = c.req.param('id')
  const { success } = await c.env.DB.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run()
  return c.json({ success })
})

export default app
