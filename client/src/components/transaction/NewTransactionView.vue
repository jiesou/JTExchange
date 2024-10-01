<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

const { t } = useI18n();

const transactionState = ref({
  amount: null,
  to: null,
  comment: '',
  loading: false
});

const emit = defineEmits(['finish']);

const handleTransaction = transaction => {
  transactionState.value.loading = true;
  callApi('transaction/new', {
    method: 'POST',
    body: transaction
  }).then(() => {
    transactionState.value.loading = false;
    message.success(t('dash.transferSuccess'));
    emit('finish');
  }).catch((err) => {
    transactionState.value.loading = false;
    message.error(err.message);
  });
};

</script>

<template>
  <a-form class="new-transaction" :model="transactionState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
    @finish="handleTransaction">
    <a-form-item name="amount" :label="t('amount')" required>
      <a-input-number v-model:value="transactionState.amount" :placeholder="t('amount')" :controls=false></a-input-number>
    </a-form-item>
    <a-form-item name="to" :label="t('dash.transferTo')" required>
      <a-input v-model:value="transactionState.to" :placeholder="t('dash.transferTo')"></a-input>
    </a-form-item>
    <a-form-item name="comment" :label="t('comment')">
      <a-textarea v-model:value="transactionState.comment" :placeholder="t('comment')" allow-clear></a-textarea>
    </a-form-item>
    <a-button type="primary" html-type="submit" :loading="transactionState.loading">{{ t('transfer') }}</a-button>
  </a-form>
</template>

<style>
.new-transaction {
  max-width: 400px;
  margin: 0 auto;
}

</style>
