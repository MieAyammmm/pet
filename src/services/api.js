const API_BASE_URL = 'https://expense-tracker.briad0096.workers.dev'

async function handleFetch(url, options = {}) {
  const fullUrl = `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`

  try {
    const response = await fetch(fullUrl, options)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API Request Failed:', {
      url: fullUrl,
      error: error.message,
    })
    throw error
  }
}

// CRUD
export const getTransactions = async () => {
  return handleFetch('transactions') // Tanpa slash juga bisa karena sudah dihandle
}

export const addTransaction = async (data = {}) => {
  if (!data.name || typeof data.amount !== 'number') {
    throw new Error('Invalid transaction data: name and amount are required')
  }

  return handleFetch('transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const updateTransaction = async (id, data = {}) => {
  if (!id) throw new Error('Transaction ID is required')
  if (data.name && typeof data.name !== 'string') {
    throw new Error('Invalid name format')
  }
  if (data.amount && typeof data.amount !== 'number') {
    throw new Error('Amount must be a number')
  }

  return handleFetch(`transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export const deleteTransaction = async (id) => {
  if (!id) throw new Error('Transaction ID is required')
  return handleFetch(`transactions/${id}`, {
    method: 'DELETE',
  })
}
