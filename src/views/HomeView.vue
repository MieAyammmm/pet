<template>
  <div id="app">
    <div class="container">
      <!-- Form Tambah/Edit Data -->
      <form @submit.prevent="isEditing ? handleUpdate() : handleSubmit()">
        <input v-model="formData.name" placeholder="Nama Transaksi" required />
        <input
          v-model.number="formData.amount"
          type="number"
          placeholder="Jumlah"
          required
          min="1"
        />
        <input v-model="formData.category" placeholder="Kategori" />
        <button type="submit">
          {{ isEditing ? 'Update' : 'Tambah' }}
        </button>
        <button v-if="isEditing" type="button" @click="cancelEdit">Batal</button>
      </form>

      <!-- Pesan Error/Sukses -->
      <div v-if="message" :class="['message', message.type]">
        {{ message.text }}
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading">Memuat data...</div>

      <!-- Tabel Daftar Transaksi -->
      <table v-else-if="transactions.length">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Jumlah</th>
            <th>Kategori</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in transactions" :key="t.id">
            <td>{{ t.name }}</td>
            <td>Rp{{ t.amount.toLocaleString('id-ID') }}</td>
            <td>{{ t.category || '-' }}</td>
            <td class="actions">
              <button @click="handleEdit(t)" :disabled="isLoading">Edit</button>
              <button @click="handleDelete(t.id)" :disabled="isLoading">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">
        <p>Belum ada transaksi.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/api'

const transactions = ref([])
const formData = ref({
  id: null,
  name: '',
  amount: 0,
  category: '',
})
const isEditing = ref(false)
const isLoading = ref(false)
const message = ref(null)

// Load data saat komponen ter-mount
onMounted(() => {
  loadTransactions()
})

// Fungsi untuk memuat data transaksi
const loadTransactions = async () => {
  try {
    isLoading.value = true
    const response = await getTransactions()
    transactions.value = response.data || response
    message.value = null
  } catch (error) {
    console.error('Gagal memuat data:', error)
    message.value = {
      text: 'Gagal memuat data transaksi',
      type: 'error',
    }
  } finally {
    isLoading.value = false
  }
}

// Fungsi untuk memulai edit
const handleEdit = (transaction) => {
  isEditing.value = true
  formData.value = { ...transaction }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Fungsi untuk membatalkan edit
const cancelEdit = () => {
  isEditing.value = false
  resetForm()
}

// Fungsi reset form
const resetForm = () => {
  formData.value = {
    id: null,
    name: '',
    amount: 0,
    category: '',
  }
}

// Fungsi tambah data baru
const handleSubmit = async () => {
  try {
    if (!formData.value.name.trim()) {
      message.value = {
        text: 'Nama transaksi harus diisi',
        type: 'error',
      }
      return
    }

    if (formData.value.amount <= 0) {
      message.value = {
        text: 'Jumlah harus lebih dari 0',
        type: 'error',
      }
      return
    }

    isLoading.value = true
    await addTransaction({
      name: formData.value.name.trim(),
      amount: Number(formData.value.amount),
      category: formData.value.category.trim(),
    })

    resetForm()
    await loadTransactions()
    message.value = {
      text: 'Transaksi berhasil ditambahkan',
      type: 'success',
    }
  } catch (error) {
    console.error('Gagal menambah transaksi:', error)
    message.value = {
      text: 'Gagal menambahkan transaksi',
      type: 'error',
    }
  } finally {
    isLoading.value = false
  }
}

// Fungsi update data
const handleUpdate = async () => {
  try {
    if (!formData.value.id) {
      message.value = {
        text: 'ID transaksi tidak valid',
        type: 'error',
      }
      return
    }

    if (!formData.value.name.trim()) {
      message.value = {
        text: 'Nama transaksi harus diisi',
        type: 'error',
      }
      return
    }

    if (formData.value.amount <= 0) {
      message.value = {
        text: 'Jumlah harus lebih dari 0',
        type: 'error',
      }
      return
    }

    isLoading.value = true
    await updateTransaction(formData.value.id, {
      name: formData.value.name.trim(),
      amount: Number(formData.value.amount),
      category: formData.value.category.trim(),
    })

    isEditing.value = false
    resetForm()
    await loadTransactions()
    message.value = {
      text: 'Transaksi berhasil diperbarui',
      type: 'success',
    }
  } catch (error) {
    console.error('Gagal mengupdate transaksi:', error)
    message.value = {
      text: 'Gagal mengupdate transaksi',
      type: 'error',
    }
  } finally {
    isLoading.value = false
  }
}

// Fungsi hapus data
const handleDelete = async (id) => {
  try {
    if (!confirm('Yakin ingin menghapus transaksi ini?')) return

    isLoading.value = true
    await deleteTransaction(id)
    await loadTransactions()
    message.value = {
      text: 'Transaksi berhasil dihapus',
      type: 'success',
    }
  } catch (error) {
    console.error('Gagal menghapus transaksi:', error)
    message.value = {
      text: 'Gagal menghapus transaksi',
      type: 'error',
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
:root {
  --primary-color: #4361ee;
  --primary-hover: #3a56d4;
  --danger-color: #ef476f;
  --danger-hover: #d64060;
  --success-color: #06d6a0;
  --background-color: #f7f9fc;
  --card-bg: #ffffff;
  --text-color: #333333;
  --text-muted: #6c757d;
  --border-color: #e0e6ed;
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  --radius: 8px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family:
    'Segoe UI',
    system-ui,
    -apple-system,
    sans-serif;
}

body {
  background-color: var(--background-color);
  color: var(--text-color);
  line-height: 1.6;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
}

h1 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  position: relative;
  padding-bottom: 0.5rem;
}

h1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 3px;
  background-color: var(--primary-color);
  border-radius: 3px;
}

form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 20px;
  background-color: #f0f4f8;
  border-radius: var(--radius);
  border-left: 4px solid var(--primary-color);
}

input {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: var(--transition);
  width: 100%;
}

input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
}

button {
  padding: 12px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

button:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-2px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button[type='button'] {
  background-color: #f0f4f8;
  color: var(--text-color);
  border: 1px solid var(--border-color);
}

button[type='button']:hover:not(:disabled) {
  background-color: #e1e5eb;
}

.actions button:first-child {
  background-color: #4895ef;
}

.actions button:last-child {
  background-color: var(--danger-color);
}

.actions button:first-child:hover:not(:disabled) {
  background-color: #3d87db;
}

.actions button:last-child:hover:not(:disabled) {
  background-color: var(--danger-hover);
}

.message {
  padding: 12px 16px;
  margin: 16px 0;
  border-radius: var(--radius);
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.message.error {
  background-color: #ffe3e3;
  color: #d90429;
  border-left: 4px solid #d90429;
}

.message.success {
  background-color: #e3f8f4;
  color: #087f5b;
  border-left: 4px solid #087f5b;
}

.loading {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
  font-style: italic;
  animation: pulse 1.5s infinite;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 24px;
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  overflow: hidden;
}

thead {
  background-color: #f0f4f8;
}

th {
  text-align: left;
  padding: 16px;
  font-weight: 600;
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
}

td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr {
  transition: var(--transition);
}

tbody tr:hover {
  background-color: #f9fafc;
}

.actions {
  display: flex;
  gap: 8px;
}

.actions button {
  padding: 8px 12px;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-muted);
  background-color: #f9fafb;
  border-radius: var(--radius);
  margin-top: 24px;
  border: 1px dashed var(--border-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 20px 15px;
  }

  form {
    grid-template-columns: 1fr;
  }
}
</style>
