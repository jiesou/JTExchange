<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api';

import NewTransactionView from '../components/transaction/NewTransactionView.vue';

const balance = ref('--');
const loading = ref(false);

const fetchBalance = () => {
  balance.value = '--';
  loading.value = true;
  callApi('transaction/fetch_balance').then((res) => {
    balance.value = res.data.balance;
    loading.value = false;
  });
};
fetchBalance();
</script>

<template>
  <div class="dash">
    <h1>{{ $t('dash.balance', { amount: balance }) }}</h1>

    <a-button @click="fetchBalance" :loading="loading"> 
      {{ $t('refresh') }}
    </a-button>

  </div>
  <div>
    <NewTransactionView />
  </div>
</template>

<style>
</style>
