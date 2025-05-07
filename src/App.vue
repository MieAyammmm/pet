<script setup></script>

<template>
  <div class="app">
    <h1>Expense Tracker</h1>
    <router-view></router-view>
    <!-- Halaman CRUD akan muncul di sini -->
  </div>
</template>

<style scoped>
.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
