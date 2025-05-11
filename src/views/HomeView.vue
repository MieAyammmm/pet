<template>
  <div>
    <h1>Expense Tracker</h1>

    <!-- Form Tambah/Edit Data -->
    <form @submit.prevent="isEditing ? handleUpdate() : handleSubmit()">
      <input v-model="formData.name" placeholder="Nama Transaksi" required />
      <input v-model.number="formData.amount" type="number" placeholder="Jumlah" required min="1" />
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
    <p v-else>Belum ada transaksi.</p>
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

<style scoped>
table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px 12px;
  text-align: left;
}
.actions {
  display: flex;
  gap: 8px;
}
button {
  padding: 6px 12px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.loading {
  padding: 12px;
  color: #666;
  font-style: italic;
}
.message {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}
.message.error {
  background-color: #ffebee;
  color: #d32f2f;
}
.message.success {
  background-color: #e8f5e9;
  color: #2e7d32;
}
</style>
