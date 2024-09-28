<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api';
import { getUser } from '@/units/storage';

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

const username = ref(getUser().pk);


</script>

<template>
  <div class="dash">
    <a-typography-title>{{ $t('dash.welcome', { name: username }) }}</a-typography-title>
    <a-space size="middle" align="baseline">
      <a-typography-title :level="3">{{ $t('dash.balance', { amount: balance }) }}</a-typography-title>

      <a-button @click="fetchBalance" :loading="loading"> 
        {{ $t('refresh') }}
      </a-button>
    </a-space>
  </div>
  <div>
    <NewTransactionView @finish="fetchBalance" />
  </div>
</template>

<style>
</style>
