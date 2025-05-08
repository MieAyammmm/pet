import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// ======================
// 1. Middleware
// ======================
app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'https://expense-tracker-6kf.pages.dev/'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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

// Get all transactions
app.get('/transactions', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, amount, category, created_at FROM transactions ORDER BY created_at DESC',
    ).all()
    return c.json(results)
  } catch (error) {
    console.error('DB Error:', error)
    return c.json({ error: 'Failed to fetch transactions' }, 500)
  }
})

// Create new transaction
app.post('/transactions', async (c) => {
  try {
    const { name, amount, category } = await c.req.json()

    // Validasi input
    if (!name || typeof amount !== 'number' || amount <= 0) {
      return c.json({ error: 'Invalid input data. Name and positive amount are required.' }, 400)
    }

    const { success, meta } = await c.env.DB.prepare(
      'INSERT INTO transactions (name, amount, category) VALUES (?, ?, ?)',
    )
      .bind(name, amount, category || null)
      .run()

    if (!success) {
      return c.json({ error: 'Failed to insert transaction' }, 500)
    }

    // Ambil data yang baru dibuat
    const { results } = await c.env.DB.prepare('SELECT * FROM transactions WHERE id = ?')
      .bind(meta.last_row_id)
      .all()

    return c.json(
      {
        success: true,
        data: results[0],
        message: 'Transaction added successfully',
      },
      201,
    )
  } catch (error) {
    console.error('DB Error:', error)
    return c.json({ error: 'Failed to add transaction' }, 500)
  }
})

// Update transaction
app.put('/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { name, amount, category } = await c.req.json()

    // Validasi input
    if (!id || isNaN(parseInt(id))) {
      return c.json({ error: 'Invalid transaction ID' }, 400)
    }
    if (!name || typeof amount !== 'number' || amount <= 0) {
      return c.json({ error: 'Invalid input data. Name and positive amount are required.' }, 400)
    }

    const { success } = await c.env.DB.prepare(
      'UPDATE transactions SET name = ?, amount = ?, category = ? WHERE id = ?',
    )
      .bind(name, amount, category || null, id)
      .run()

    if (!success) {
      return c.json({ error: 'Transaction not found or update failed' }, 404)
    }

    // Ambil data yang sudah diupdate
    const { results } = await c.env.DB.prepare('SELECT * FROM transactions WHERE id = ?')
      .bind(id)
      .all()

    return c.json({
      success: true,
      data: results[0],
      message: 'Transaction updated successfully',
    })
  } catch (error) {
    console.error('DB Error:', error)
    return c.json({ error: 'Failed to update transaction' }, 500)
  }
})

// Delete transaction
app.delete('/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // Validasi ID
    if (!id || isNaN(parseInt(id))) {
      return c.json({ error: 'Invalid transaction ID' }, 400)
    }

    // Cek apakah transaksi ada sebelum menghapus
    const { results } = await c.env.DB.prepare('SELECT id FROM transactions WHERE id = ?')
      .bind(id)
      .all()

    if (!results.length) {
      return c.json({ error: 'Transaction not found' }, 404)
    }

    const { success } = await c.env.DB.prepare('DELETE FROM transactions WHERE id = ?')
      .bind(id)
      .run()

    return c.json({
      success: !!success,
      message: 'Transaction deleted successfully',
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

app.notFound((c) => c.json({ error: 'Endpoint not found' }, 404))

export default app
