<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

import VoiceTransfer from '@/components/transaction/VoiceTransfer.vue';

const { t } = useI18n();

const transactionState = ref({
  amount: null,
  to: null,
  comment: '',
  loading: false
});

const emit = defineEmits(['success']);

const handleTransaction = transaction => {
  transactionState.value.loading = true;
  callApi('transaction/new', {
    method: 'POST',
    body: transaction
  }).then((res) => {
    transactionState.value.loading = false;
    const transaction = res.data.transaction;
    emit('success', {
      to: transaction.to_pk,
      amount: transaction.amount,
      comment: transaction.comment,
      innerid: transaction.key,
      balance: res.data.balance
    });
  }).catch((err) => {
    transactionState.value.loading = false;
    console.error(err);
    message.error(err.message);
  });
};

const handleVoiceCallback = (transaction) => {
  transactionState.value.amount = transaction.amount;
  transactionState.value.to = transaction.to;
  transactionState.value.comment = transaction.comment;
  handleTransaction(transaction);
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
        <a-input v-model:value="transactionState.to"
          :placeholder="t('dash.transferTo')" />
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
