<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api';
import { getUser, setUser } from '@/units/storage';

import NewTransactionView from '@/components/transaction/NewTransactionView.vue';

const balance = ref('--');
const loading = ref(false);

const fetchBalance = () => {
  balance.value = '--';
  loading.value = true;
  callApi('transaction/fetch_balance').then((res) => {
    balance.value = res.data.balance;
    loading.value = false;
  }).catch((error) => {
    console.error(error);
    loading.value = false;
  });
};
fetchBalance();

const username = ref(getUser().nick);

const logout = () => {
  setUser();
  location.reload();
};
</script>

<template>
  <div class="dash">
    <a-flex justify="space-between">
      <a-typography-title>{{ $t('dash.welcome', { name: username }) }}</a-typography-title>
      <a-button @click="logout">{{ $t('dash.logout') }}</a-button>
    </a-flex>
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
