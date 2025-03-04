<script setup>
import { ref } from 'vue';
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
  const sentence = [...props.transactions].reverse().map((transaction) => `${transaction.from_pk} sent ${transaction.amount} to ${transaction.to_pk} on ${transaction.time} with comment: ${transaction.comment}`).join('\n');
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
  <a-card :title="t('transaction.list')">
    <a-spin :tip="t('voice.understanding')" :spinning="isUnderstanding">
      <a-button @click="handleSummarize" style="margin-bottom: 20px">
        {{ t('transaction.summarize') }}
      </a-button>
      <a-input-group compact>
        <a-input v-model:value="generateMessage" placeholder="追问……"
          style="width: calc(100% - 200px); margin-bottom: 20px" @keyup.enter="handleGenerate" />
        <a-button type="primary" @click="handleGenerate">发送</a-button>
      </a-input-group>
      <a-typography-paragraph v-if="result">
        <pre>
          {{ result }}
        </pre>
      </a-typography-paragraph>

    </a-spin>
    <a-divider v-if="result" />
    <slot />
  </a-card>
</template>