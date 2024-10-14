<script setup>
import { ref, onMounted } from 'vue';
import { callApi } from '@/units/api';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

import VoiceTransfer from '@/components/transaction/VoiceTransfer.vue';

const { t } = useI18n();

const transactionState = ref({
  amount: null,
  comment: '',
  loading: false
});

const users = ref([]);
const userNames = ref([]);

const emit = defineEmits(['success']);

const fetchUsers = () => {
  callApi('user/fetch').then((res) => {
    users.value = res.data;
    userNames.value = users.value.map(user => ({
      label: user.nick,
      value: user.pk
    }));
  }).catch((err) => {
    message.error(err.message);
  });
};

onMounted(() => {
  fetchUsers();
});

const handleTransaction = transaction => {
  transactionState.value.loading = true;
  const transactions = [];
  transactionState.value.to.forEach(to => {
    transactions.push({
      amount: transactionState.value.amount,
      to_pk: to,
      comment: transactionState.value.comment
    });
  });
  callApi('transaction/new', {
    method: 'POST',
    body: { transactions: transactions }
  }).then((res) => {
    transactionState.value.loading = false;
    emit('success', res.data);
  }).catch((err) => {
    transactionState.value.loading = false;
    message.error(err.message);
  });
};

const handleVoiceCallback = (transactions) => {
  transactionState.value.loading = true;
  callApi('transaction/new', {
    method: 'POST',
    body: { transactions: transactions }
  }).then((res) => {
    transactionState.value.loading = false;
    emit('success', res.data);
  }).catch((err) => {
    transactionState.value.loading = false;
    message.error(err.message);
  });
};
</script>

<template>
  <a-card :title="t('transaction.title')">
    <a-form class="new-transaction" :model="transactionState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
      @finish="handleTransaction">
      <a-form-item name="amount" :label="t('amount')" required>
        <a-input v-model:value="transactionState.amount"
          :placeholder="t('amount')"
          type="number"
          suffix="$JTX"
          />
      </a-form-item>
      <a-form-item name="to" :label="t('dash.transferTo')" required>
        <a-select
          v-model:value="transactionState.to"
          :placeholder="t('dash.transferTo')"
          mode="multiple"
          :options="userNames" />
      </a-form-item>
      <a-form-item name="comment" :label="t('comment')">
        <a-textarea v-model:value="transactionState.comment"
          :placeholder="t('comment')" allow-clear />
      </a-form-item>
      <a-button type="primary" html-type="submit" :loading="transactionState.loading">{{ t('transfer') }}</a-button>
    </a-form>
  </a-card>
  <VoiceTransfer @finish="handleVoiceCallback" />
</template>

<style>
.new-transaction {
  max-width: 400px;
  margin: 0 auto;
}
</style>
