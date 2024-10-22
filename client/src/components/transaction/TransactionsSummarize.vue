<script setup>
import { ref, defineProps } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { callApi } from '@/units/api';

const { t } = useI18n();

const props = defineProps({
  transactions: {
    type: Array,
    default: () => [],
  },
});
const result = ref(null);
const isUnderstanding = ref(false);

const handleSummarize = () => {
  isUnderstanding.value = true;
  const sentence = [...props.transactions].reverse().map((transaction) => `${transaction.from_pk} sent ${transaction.amount} to ${transaction.to_pk} on ${new Date(Number(transaction.time)).toLocaleString()} with comment: ${transaction.comment}`).join('\n');
  console.log(sentence);
  callApi('generator/summarize', {
    method: 'POST',
    body: { sentence: sentence }
  }).then((res) => {
    result.value = res.data.result;
  }).catch((error) => {
    message.error(error.message);
  }).finally(() => {
    isUnderstanding.value = false;
  });
};
</script>

<template>
  <a-card :title="t('transaction.summarize')">
    <a-spin :tip="t('voice.understanding')" :spinning="isUnderstanding">
      <a-button
          @click="handleSummarize"
          style="margin-bottom: 20px"
          >
          {{ t('transaction.summarize') }}
      </a-button>
        <a-textarea
            v-model:value="result"
            :placeholder="t('transaction.summarize')"
            />
    </a-spin>
  </a-card>
</template>
