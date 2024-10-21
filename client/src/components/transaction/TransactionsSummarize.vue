<script setup>
import { ref, onMounted, defineProps } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { callApi } from '@/units/api';

const { t } = useI18n();

const props = defineProps(['transactions']);
const result = ref(null);
const isUnderstanding = ref(false);

const handleSummarize = () => {
  isUnderstanding.value = true;
  const response = callApi('generator/summarize', {
    method: 'POST',
    body: { sentence: props.transactions }
  }).then((res) => {
    result.value = res.data.result;
  }).catch((error) => {
    message.error(error);
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
