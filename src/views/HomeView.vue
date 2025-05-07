<script setup>
import { ref, onMounted } from 'vue'
import { getTransactions, addTransaction, deleteTransaction } from '../services/api'

const transactions = ref([])
const newTransaction = ref({ name: '', amount: 0, category: '' })

const fetchData = async () => {
  transactions.value = await getTransactions()
}

const handleSubmit = async () => {
  await addTransaction(newTransaction.value)
  newTransaction.value = { name: '', amount: 0, category: '' }
  await fetchData()
}

const handleDelete = async (id) => {
  await deleteTransaction(id)
  await fetchData()
}

onMounted(() => fetchData())
</script>
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="newTransaction.name" placeholder="Nama" />
    <input v-model.number="newTransaction.amount" type="number" placeholder="Jumlah" />
    <input v-model="newTransaction.category" placeholder="Kategori" />
    <button type="submit">Tambah</button>
  </form>

  <ul>
    <li v-for="t in transactions" :key="t.id">
      {{ t.name }} - Rp{{ t.amount }}
      <button @click="handleDelete(t.id)">Hapus</button>
    </li>
  </ul>
</template>
