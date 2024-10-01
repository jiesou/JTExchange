<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { callApi } from '@/units/api';
import { getUser, setUser } from '@/units/storage';

import NewTransactionView from '@/components/transaction/NewTransactionView.vue';
import TransactionsList from '@/components/transaction/TransactionsList.vue';

const router = useRouter();

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
  router.push({ name: 'login' });
};

const deleteAccount = () => {
  callApi('user/delete', { method: 'DELETE' }).then(() => {
    message.success('Account deleted');
    setUser();
    router.push({ name: 'login' });
  }).catch((error) => {
    message.error(error.message);
  });
};
</script>

<template>
  <div class="dash">
    <a-flex justify="space-between">
      <a-typography-title :level="2">{{ $t('dash.welcome', { name: username }) }}</a-typography-title>
      <a-space>
        <a-button @click="logout">{{ $t('dash.logout') }}</a-button>
        <a-button @click="deleteAccount" danger>{{ $t('dash.deleteAccount') }}</a-button>
      </a-space>
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
    <TransactionsList :style="{ marginTop: '20px' }"/>
  </div>
</template>

<style>
</style>
