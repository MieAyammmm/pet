export default {
  async get(request, env) {
    try {
      const { results } = await env.DB.prepare(
        'SELECT * FROM transactions ORDER BY created_at DESC',
      ).all()
      return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },

  async post(request, env) {
    try {
      const { name, amount, category } = await request.json()

      const { success } = await env.DB.prepare(
        'INSERT INTO transactions (name, amount, category) VALUES (?, ?, ?)',
      )
        .bind(name, amount, category)
        .run()

      if (!success) throw new Error('Failed to insert transaction')

      const { results } = await env.DB.prepare(
        'SELECT * FROM transactions ORDER BY id DESC LIMIT 1',
      ).all()

      return new Response(JSON.stringify(results[0]), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },

  async put(request, env) {
    try {
      const { id } = request.params
      const { name, amount, category } = await request.json()

      const { success } = await env.DB.prepare(
        'UPDATE transactions SET name = ?, amount = ?, category = ? WHERE id = ?',
      )
        .bind(name, amount, category, id)
        .run()

      if (!success) throw new Error('Failed to update transaction')

      return new Response(JSON.stringify({ id, name, amount, category }), {
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },

  async delete(request, env) {
    try {
      const { id } = request.params

      const { success } = await env.DB.prepare('DELETE FROM transactions WHERE id = ?')
        .bind(id)
        .run()

      if (!success) throw new Error('Failed to delete transaction')

      return new Response(null, { status: 204 })
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
}
