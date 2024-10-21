<script setup>
import { ref, h, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message, Modal } from 'ant-design-vue';
import { callApi } from '@/units/api';
import { getUser, setUser } from '@/units/storage';

import NewTransactionView from '@/components/transaction/NewTransactionView.vue';
import TransactionsSummarize from '@/components/transaction/TransactionsSummarize.vue';
import TransactionsList from '@/components/transaction/TransactionsList.vue';

const router = useRouter();
const { t } = useI18n();

const balance = ref('--');
const loading = ref(false);
const transactionsList = ref();

const nick = ref("User");


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

const fetchBalance = () => {
  balance.value = '--';
  loading.value = true;
  callApi('transaction/fetch_balance').then((res) => {
    balance.value = res.data.balance.toString();
  }).catch((error) => {
    message.error(error.message);
  }).finally(() => {
    loading.value = false;
  });

  nick.value = getUser().nick;
};

const handleRefresh = () => {
  fetchBalance();
  transactionsList.value.handleTableChange();
}

fetchBalance();

onMounted(() => {
  const welcomeElement = document.querySelector('.welcome');
  if (welcomeElement) {
    console.log(welcomeElement.innerHTML);
  }
  let speechInstance = new SpeechSynthesisUtterance(welcomeElement.innerHTML);
  speechSynthesis.speak(speechInstance);
});


const handleTransferSuccess = (result) => {
  console.log(result);
  const messages = result.transactions.map((transaction) => {
    return t('dash.transferSuccessMessage', {
      to: transaction.to_pk,
      amount: transaction.amount,
      comment: transaction.comment,
    });
  });

  Modal.success({
    title: t('dash.transferSuccess'),
    content: h('div', {
      innerHTML: messages.join('<br>') + '<br>' + t('dash.balance', { amount: result.balance })
    }),
  });
  balance.value = result.balance;
  transactionsList.value.handleTableChange();
};

</script>

<template>
  <div class="dash">
    <a-flex justify="space-between">
      <a-typography-title :level="2" class="welcome">{{ $t('dash.welcome', { name: nick }) }}</a-typography-title>
      <a-space>
        <a-button @click="logout">{{ $t('dash.logout') }}</a-button>
        <a-button @click="deleteAccount" danger>{{ $t('dash.deleteAccount') }}</a-button>
      </a-space>
    </a-flex>
    <a-space size="middle" align="baseline">
      <a-typography-title :level="3">{{ $t('dash.balance', { amount: balance }) }}</a-typography-title>

      <a-button @click="handleRefresh" :loading="loading">
        {{ $t('refresh') }}
      </a-button>
    </a-space>
  </div>
  <a-flex wrap="wrap" justify="center" gap="large" :style="{ marginTop: '10px' }">
    <NewTransactionView @success="handleTransferSuccess" />
    <TransactionsSummarize transactions="交易1" />
    <TransactionsList :style="{ marginTop: '20px' }" ref="transactionsList" />
  </a-flex>
</template>

<style>
</style>
