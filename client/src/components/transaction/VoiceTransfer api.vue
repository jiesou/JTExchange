<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { callApi } from '@/units/api';

const { t } = useI18n();

const recognizedText = ref('');
const isRecording = ref(false);
const isConnecting = ref(false);
const isUnderstanding = ref(false);

const emit = defineEmits(['finish']);

let recognition;

onMounted(() => {
  if (!('webkitSpeechRecognition' in window)) {
    message.error(t('voice.noSupport'));
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'zh-CN';

  recognition.onstart = onStart;
  recognition.onresult = onResult;
  recognition.onerror = onError;
  // recognition.onend = onStop;
});

onUnmounted(() => {
  if (recognition) {
    recognition.stop();
  }
});

const onResult = (event) => {
  let interimTranscript = '';
  let finalTranscript = '';

  for (let i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      finalTranscript += event.results[i][0].transcript;
    } else {
      interimTranscript += event.results[i][0].transcript;
    }
  }

  console.log('finalTranscript:', finalTranscript);
  recognizedText.value = finalTranscript || interimTranscript;
};

const onStart = () => {
  isRecording.value = true;
  isConnecting.value = false;
};

const onStop = () => {
  isRecording.value = false;
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
};

const onError = (event) => {
  message.error(event.error);
  console.error(event);
  isConnecting.value = false;
};

function toggleRecording() {
  if (isRecording.value) {
    recognition.stop();
  } else {
    isConnecting.value = true;
    recognition.start();
  }
}
</script>

<template>
  <a-card :title="t('voice.title')">
    <a-spin :tip="t('voice.understanding')" :spinning="isUnderstanding">
      <a-button
          @click="toggleRecording"
          :loading="isConnecting"
          :danger="isRecording"
          style="margin-bottom: 20px"
          >
          {{ isRecording ? t('voice.stop') : t('voice.start') }}
      </a-button>
        <a-textarea
            v-model:value="recognizedText"
            :placeholder="t('voice.content')"
            />
    </a-spin>
  </a-card>
</template>
