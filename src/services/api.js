const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const getTransactions = async () => {
  const res = await fetch('/api/transactions')
  return await res.json()
}

export const addTransaction = async (data) => {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return await res.json()
}

export const deleteTransaction = async (id) => {
  const res = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  })
  return await res.json()
}
