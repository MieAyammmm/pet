<template>
  <div id="app">
    <div class="container">
      <header>
        <h1>Expense Tracker</h1>
        <p class="subtitle">Kelola pengeluaran Anda dengan mudah</p>
      </header>

      <!-- Form Section -->
      <section class="form-section">
        <form @submit.prevent="isEditing ? handleUpdate() : handleSubmit()">
          <div class="form-group">
            <input v-model="formData.name" placeholder="Nama Transaksi" required />
          </div>
          <div class="form-group">
            <input
              v-model.number="formData.amount"
              type="number"
              placeholder="Jumlah (Rp)"
              required
              min="1"
            />
          </div>
          <div class="form-group">
            <input v-model="formData.category" placeholder="Kategori (Opsional)" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-primary">
              {{ isEditing ? 'Update Transaksi' : 'Tambah Transaksi' }}
            </button>
            <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-secondary">
              Batal
            </button>
          </div>
        </form>
      </section>

      <!-- Status Messages -->
      <transition name="fade">
        <div v-if="message" :class="['message', message.type]">
          <span>{{ message.text }}</span>
        </div>
      </transition>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memproses data...</p>
      </div>

      <!-- Transactions Table -->
      <section class="table-section" v-else-if="transactions.length">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th class="name-col">Nama Transaksi</th>
                <th class="amount-col">Jumlah</th>
                <th class="category-col">Kategori</th>
                <th class="actions-col">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in transactions" :key="t.id">
                <td>{{ t.name }}</td>
                <td class="amount">Rp{{ t.amount.toLocaleString('id-ID') }}</td>
                <td>
                  <span class="category-tag" v-if="t.category">{{ t.category }}</span>
                  <span v-else>-</span>
                </td>
                <td class="actions">
                  <button @click="handleEdit(t)" class="btn-edit">
                    <i class="icon-edit"></i> Edit
                  </button>
                  <button @click="handleDelete(t.id)" class="btn-delete">
                    <i class="icon-delete"></i> Hapus
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="summary">
          <p>
            Total Transaksi: <strong>{{ transactions.length }}</strong>
          </p>
          <p>
            Total Pengeluaran: <strong>Rp{{ totalExpense.toLocaleString('id-ID') }}</strong>
          </p>
        </div>
      </section>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 10H21M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z"
              stroke="#64748B"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <h3>Belum ada transaksi</h3>
        <p>Mulai dengan menambahkan transaksi pertama Anda</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
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

// Computed property untuk total pengeluaran
const totalExpense = computed(() => {
  return transactions.value.reduce((total, t) => total + t.amount, 0)
})

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
    showMessage('Gagal memuat data transaksi', 'error')
  } finally {
    isLoading.value = false
  }
}

// Fungsi untuk menampilkan pesan
const showMessage = (text, type) => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = null
  }, 5000)
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
      showMessage('Nama transaksi harus diisi', 'error')
      return
    }

    if (formData.value.amount <= 0) {
      showMessage('Jumlah harus lebih dari 0', 'error')
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
    showMessage('Transaksi berhasil ditambahkan', 'success')
  } catch (error) {
    console.error('Gagal menambah transaksi:', error)
    showMessage('Gagal menambahkan transaksi', 'error')
  } finally {
    isLoading.value = false
  }
}

// Fungsi update data
const handleUpdate = async () => {
  try {
    if (!formData.value.id) {
      showMessage('ID transaksi tidak valid', 'error')
      return
    }

    if (!formData.value.name.trim()) {
      showMessage('Nama transaksi harus diisi', 'error')
      return
    }

    if (formData.value.amount <= 0) {
      showMessage('Jumlah harus lebih dari 0', 'error')
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
    showMessage('Transaksi berhasil diperbarui', 'success')
  } catch (error) {
    console.error('Gagal mengupdate transaksi:', error)
    showMessage('Gagal mengupdate transaksi', 'error')
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
    showMessage('Transaksi berhasil dihapus', 'success')
  } catch (error) {
    console.error('Gagal menghapus transaksi:', error)
    showMessage('Gagal menghapus transaksi', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Base Styles */
#app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc;
  padding: 2rem;
}

.container {
  width: 100%;
  max-width: 1200px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  padding: 2.5rem;
  margin: 0 auto;
}

header {
  text-align: center;
  margin-bottom: 2.5rem;
}

header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
}

/* Form Styles */
.form-section {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid #3b82f6;
}

form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

input {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-actions {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
}

/* Button Styles */
button {
  padding: 0.75rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background-color: #f8fafc;
}

.btn-edit {
  background-color: #f59e0b;
  color: white;
}

.btn-edit:hover {
  background-color: #d97706;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover {
  background-color: #dc2626;
}

/* Message Styles */
.message {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  animation: fadeIn 0.3s ease;
}

.message.error {
  background-color: #fee2e2;
  color: #dc2626;
  border-left: 4px solid #dc2626;
}

.message.success {
  background-color: #dcfce7;
  color: #16a34a;
  border-left: 4px solid #16a34a;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Table Styles */
.table-section {
  margin-top: 2rem;
}

.table-responsive {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

thead {
  background-color: #f1f5f9;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background-color: #f8fafc;
}

.amount {
  font-weight: 600;
  color: #1e293b;
}

.category-tag {
  background-color: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.actions button {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

.summary {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
  padding: 1rem;
  background-color: #f8fafc;
  border-radius: 8px;
  font-size: 0.875rem;
}

.summary p {
  color: #64748b;
}

.summary strong {
  color: #1e293b;
  font-weight: 600;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
  margin-top: 2rem;
}

.empty-icon {
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  font-size: 0.875rem;
}

/* Animations */
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

/* Responsive Adjustments */
@media (max-width: 768px) {
  .container {
    padding: 1.5rem;
  }

  form {
    grid-template-columns: 1fr;
  }

  .form-actions {
    grid-column: 1 / -1;
  }

  th,
  td {
    padding: 0.75rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .summary {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  #app {
    padding: 1rem;
  }

  .container {
    padding: 1.25rem;
  }

  header h1 {
    font-size: 1.5rem;
  }
}
</style>
