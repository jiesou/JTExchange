<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { callApi } from '@/units/api';

import { IatRecorder } from './iatrecorder';

const { t } = useI18n();

const recognizedText = ref('');
const isRecording = ref(false);
const isConnecting = ref(false);
const isUnderstanding = ref(false);

const emit = defineEmits(['finish']);

let recorder;
onMounted(() => {
  recorder = new IatRecorder({
    onTextUpdate,
    onStart,
    onStop,
    onError,
  });
});


const texts = [];
const onTextUpdate = (updateFun) => {
  updateFun(texts);
  recognizedText.value = texts.join('');
};

const onStart = () => {
  isRecording.value = true;
  isConnecting.value = false;
};

const onStop = () => {
  isRecording.value = false;
  startUnderstand();
};

const onError = (error) => {
  message.error(error);
  isConnecting.value = false;
};


function startUnderstand() {
  isUnderstanding.value = true;
  const text = recognizedText.value;
  callApi("generator/transaction", {
    method: "POST",
    body: { sentence: text },
  }).then((res) => {
    emit('finish', res.data);
  }).catch((err) => {
    message.error(err.message);
  }).finally(() => {
    isUnderstanding.value = false;
  });
}

function toggleRecording() {
  if (isRecording.value) {
    recorder.stop();
  } else {
    isConnecting.value = true;
    recorder.start();
  }
}
</script>
<template>
  <a-card :title="t('voice.title')">
    <a-spin :tip="t('voice.understanding')" :spinning="isUnderstanding">
      <div style="display: flex; justify-content: space-evenly; margin-bottom: 20px">
        <a-button @click="toggleRecording" :loading="isConnecting" :danger="isRecording">
          {{ isRecording ? t('voice.stop') : t('voice.start') }}
        </a-button>
        <a-button @click="startUnderstand" type="primary">
          {{ t('voice.confirm') }}
        </a-button>
      </div>

      <a-textarea v-model:value="recognizedText" :placeholder="t('voice.content')" @keyup.enter="startUnderstand" />
    </a-spin>
  </a-card>
</template>