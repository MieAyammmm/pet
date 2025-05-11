import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// ======================
// 1. Middleware & CORS Configuration
// ======================
app.use('*', async (c, next) => {
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.path}`)
  await next()
})

app.use(
  '/*',
  cors({
    origin: ['http://localhost:5173', 'https://expense-tracker-6kf.pages.dev'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

app.options('*', (c) => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin':
        c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '600',
    },
    status: 204,
  })
})

// ======================
// 2. Health Check Endpoint
// ======================
app.get('/', (c) => {
  return c.text('Expense Tracker API Ready 🚀', 200, {
    'Access-Control-Allow-Origin':
      c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
  })
})

// ======================
// 3. CRUD Endpoints
// ======================

// Get all transactions
app.get('/transactions', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, amount, category, created_at FROM transactions ORDER BY created_at DESC',
    ).all()

    return c.json(
      {
        success: true,
        data: results,
      },
      200,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  } catch (error) {
    console.error('DB Error:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to fetch transactions',
      },
      500,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  }
})

// Create new transaction
app.post('/transactions', async (c) => {
  try {
    const { name, amount, category } = await c.req.json()

    // Validation
    if (!name?.trim()) {
      return c.json(
        {
          success: false,
          error: 'Transaction name is required',
        },
        400,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return c.json(
        {
          success: false,
          error: 'Amount must be a positive number',
        },
        400,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    // Insert to database
    const { success, meta } = await c.env.DB.prepare(
      'INSERT INTO transactions (name, amount, category) VALUES (?, ?, ?)',
    )
      .bind(name, amount, category || null)
      .run()

    if (!success) {
      throw new Error('Database insert failed')
    }

    // Get the newly created transaction
    const { results } = await c.env.DB.prepare('SELECT * FROM transactions WHERE id = ?')
      .bind(meta.last_row_id)
      .all()

    return c.json(
      {
        success: true,
        data: results[0],
        message: 'Transaction created successfully',
      },
      201,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  } catch (error) {
    console.error('Transaction Error:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to create transaction',
      },
      500,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  }
})

// Update transaction
app.put('/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { name, amount, category } = await c.req.json()

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return c.json(
        {
          success: false,
          error: 'Invalid transaction ID',
        },
        400,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    // Validate input
    if (!name?.trim()) {
      return c.json(
        {
          success: false,
          error: 'Transaction name is required',
        },
        400,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return c.json(
        {
          success: false,
          error: 'Amount must be a positive number',
        },
        400,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    // Update database
    const { success } = await c.env.DB.prepare(
      'UPDATE transactions SET name = ?, amount = ?, category = ? WHERE id = ?',
    )
      .bind(name, amount, category || null, id)
      .run()

    if (!success) {
      return c.json(
        {
          success: false,
          error: 'Transaction not found',
        },
        404,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    // Get updated transaction
    const { results } = await c.env.DB.prepare('SELECT * FROM transactions WHERE id = ?')
      .bind(id)
      .all()

    return c.json(
      {
        success: true,
        data: results[0],
        message: 'Transaction updated successfully',
      },
      200,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  } catch (error) {
    console.error('Update Error:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to update transaction',
      },
      500,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  }
})

// Delete transaction
app.delete('/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id')

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return c.json(
        {
          success: false,
          error: 'Invalid transaction ID',
        },
        400,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    // Check if exists
    const { results } = await c.env.DB.prepare('SELECT id FROM transactions WHERE id = ?')
      .bind(id)
      .all()

    if (!results.length) {
      return c.json(
        {
          success: false,
          error: 'Transaction not found',
        },
        404,
        {
          'Access-Control-Allow-Origin':
            c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
        },
      )
    }

    // Delete from database
    const { success } = await c.env.DB.prepare('DELETE FROM transactions WHERE id = ?')
      .bind(id)
      .run()

    return c.json(
      {
        success: true,
        message: 'Transaction deleted successfully',
      },
      200,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  } catch (error) {
    console.error('Delete Error:', error)
    return c.json(
      {
        success: false,
        error: 'Failed to delete transaction',
      },
      500,
      {
        'Access-Control-Allow-Origin':
          c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
      },
    )
  }
})

// ======================
// 4. Error Handling
// ======================
app.onError((err, c) => {
  console.error('Server Error:', err)
  return c.json(
    {
      success: false,
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    },
    500,
    {
      'Access-Control-Allow-Origin':
        c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
    },
  )
})

app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Endpoint not found',
    },
    404,
    {
      'Access-Control-Allow-Origin':
        c.req.header('Origin') || 'https://expense-tracker-6kf.pages.dev',
    },
  )
})

export default app
