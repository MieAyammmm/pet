<script setup>
import { ref, onMounted } from 'vue'
import { getTransactions, addTransaction, deleteTransaction } from '../services/api'

const transactions = ref([])
const newTransaction = ref({ name: '', amount: 0, category: '' })
const isLoading = ref(false)
const errorMessage = ref('')

// Fungsi untuk memuat ulang data
const loadTransactions = async () => {
  try {
    isLoading.value = true
    const response = await getTransactions()
    // Pastikan struktur data sesuai dengan respons API
    transactions.value = response.data || response // Sesuaikan dengan struktur respons backend
  } catch (error) {
    console.error('Gagal memuat data:', error)
    errorMessage.value = 'Gagal memuat data transaksi'
  } finally {
    isLoading.value = false
  }
}

// Fetch data saat komponen ter-load
onMounted(() => {
  loadTransactions()
})

// Tambah data baru
const handleSubmit = async () => {
  try {
    if (!newTransaction.value.name.trim()) {
      errorMessage.value = 'Nama transaksi harus diisi'
      return
    }

    if (newTransaction.value.amount <= 0) {
      errorMessage.value = 'Jumlah harus lebih dari 0'
      return
    }

    await addTransaction({
      name: newTransaction.value.name.trim(),
      amount: Number(newTransaction.value.amount),
      category: newTransaction.value.category.trim(),
    })

    newTransaction.value = { name: '', amount: 0, category: '' }
    await loadTransactions() // Refresh data
    errorMessage.value = ''
  } catch (error) {
    console.error('Gagal menambah transaksi:', error)
    errorMessage.value = 'Gagal menambahkan transaksi'
  }
}

// Hapus data
const handleDelete = async (id) => {
  try {
    await deleteTransaction(id)
    await loadTransactions() // Refresh data
    errorMessage.value = ''
  } catch (error) {
    console.error('Gagal menghapus transaksi:', error)
    errorMessage.value = 'Gagal menghapus transaksi'
  }
}
</script>

<template>
  <div>
    <!-- Form Tambah Data -->
    <form @submit.prevent="handleSubmit">
      <input v-model="newTransaction.name" placeholder="Nama Transaksi" required />
      <input
        v-model.number="newTransaction.amount"
        type="number"
        placeholder="Jumlah"
        required
        min="1"
      />
      <input v-model="newTransaction.category" placeholder="Kategori" />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Memproses...' : 'Tambah' }}
      </button>
    </form>

    <!-- Pesan Error -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
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
          <td>
            <button @click="handleDelete(t.id)" :disabled="isLoading">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Belum ada transaksi.</p>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
.error-message {
  color: red;
  margin: 10px 0;
}
.loading {
  margin: 20px 0;
  font-style: italic;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
