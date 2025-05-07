import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// ======================
// 1. Middleware
// ======================
app.use(
  '/*',
  cors({
    origin: ['https://your-frontend-domain.pages.dev'], // Ganti dengan domain frontend
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

// ======================
// 2. Health Check Endpoint
// ======================
app.get('/', (c) => c.text('Expense Tracker API Ready 🚀'))

// ======================
// 3. CRUD Endpoints (Dengan Error Handling)
// ======================
app.get('/transactions', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, amount, category, created_at FROM transactions ORDER BY created_at DESC',
    ).all()
    return c.json(results)
  } catch (error) {
    console.error('DB Error:', error)
    return c.json({ error: 'Database operation failed' }, 500)
  }
})

app.post('/transactions', async (c) => {
  try {
    const { name, amount, category } = await c.req.json()

    // Validasi input
    if (!name || typeof amount !== 'number') {
      return c.json({ error: 'Invalid input data' }, 400)
    }

    const { success } = await c.env.DB.prepare(
      'INSERT INTO transactions (name, amount, category) VALUES (?, ?, ?)',
    )
      .bind(name, amount, category || null)
      .run()

    return c.json({
      success,
      message: 'Transaction added successfully',
    })
  } catch (error) {
    console.error('DB Error:', error)
    return c.json({ error: 'Failed to add transaction' }, 500)
  }
})

app.delete('/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return c.json({ error: 'Invalid transaction ID' }, 400)
    }

    const { success } = await c.env.DB.prepare('DELETE FROM transactions WHERE id = ?')
      .bind(id)
      .run()

    return c.json({
      success,
      message: success ? 'Transaction deleted' : 'No transaction found',
    })
  } catch (error) {
    console.error('DB Error:', error)
    return c.json({ error: 'Failed to delete transaction' }, 500)
  }
})

// ======================
// 4. Error Handling Global
// ======================
app.onError((err, c) => {
  console.error('Server Error:', err)
  return c.json({ error: 'Internal server error' }, 500)
})

app.notFound((c) => c.json({ error: 'not found' }, 404))

app.get('/', (c) => c.text('Expense Tracker API Ready 🚀'))

export default app
