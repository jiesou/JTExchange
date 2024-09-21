<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api';

const transactionState = ref({
  amount: null,
  to: null,
  comment: '',
  loading: false
});

const handleTransaction = transaction => {
  callApi('transaction/new', {
    method: 'POST',
    body: {
      amount: transaction.amount.value,
      comment: transaction.comment.value,
      to: transaction
    }
  }).then((res) => {
    console.log(res);
  });
};

</script>

<template>
  <a-form class="new-transaction" :model="transactionState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
    @finish="handleTransaction">
    <a-form-item name="amount" :label="$t('amount')" required>
      <a-input-number :placeholder="$t('amount')" :controls=false></a-input-number>
    </a-form-item>
    <a-form-item name="to" :label="$t('dash.transferTo')" required>
      <a-input-number :placeholder="$t('dash.transferTo')" :controls=false></a-input-number>
    </a-form-item>
    <a-form-item name="comment" :label="$t('comment')">
      <a-textarea :placeholder="$t('comment')" allow-clear></a-textarea>
    </a-form-item>
    <a-button type="primary" html-type="submit" :loading="transactionState.loading">{{ $t('transfer') }}</a-button>
  </a-form>
</template>

<style>
.new-transaction {
  max-width: 400px;
  margin: 0 auto;
}

</style>
