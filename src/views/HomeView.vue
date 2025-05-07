<template>
  <div>
    <h1>Expense Tracker</h1>

    <!-- Form Tambah Data -->
    <form @submit.prevent="handleSubmit">
      <input v-model="newTransaction.name" placeholder="Nama Transaksi" required />
      <input v-model.number="newTransaction.amount" type="number" placeholder="Jumlah" required />
      <input v-model="newTransaction.category" placeholder="Kategori" />
      <button type="submit">Tambah</button>
    </form>

    <!-- Tabel Daftar Transaksi -->
    <table v-if="transactions.length">
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
          <td>Rp{{ t.amount }}</td>
          <td>{{ t.category || '-' }}</td>
          <td>
            <button @click="handleDelete(t.id)">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Belum ada transaksi.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getTransactions, addTransaction, deleteTransaction } from '../services/api'

const transactions = ref([])
const newTransaction = ref({ name: '', amount: 0, category: '' })

// Fetch data saat komponen ter-load
onMounted(async () => {
  transactions.value = await getTransactions()
})

// Tambah data baru
const handleSubmit = async () => {
  await addTransaction(newTransaction.value)
  newTransaction.value = { name: '', amount: 0, category: '' }
  transactions.value = await getTransactions() // Refresh data
}

// Hapus data
const handleDelete = async (id) => {
  await deleteTransaction(id)
  transactions.value = await getTransactions() // Refresh data
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
  padding: 8px;
}
</style>
