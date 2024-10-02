<template>
  <a-card title="语音识别" style="margin: 20px auto">
    <a-button
      type="primary"
      @click="toggleRecording"
      :loading="isConnecting"
      style="margin-bottom: 20px"
    >
      {{ isRecording ? "停止录音" : "开始录音" }}
    </a-button>
    <a-textarea
      v-model:value="recognizedText"
      readonly
      placeholder="识别结果将显示在此处..."
    />
  </a-card>
</template>

<script setup>
import { ref } from 'vue';
import { IatRecorder } from './iatrecorder';
import { message } from 'ant-design-vue';

const recognizedText = ref('');
const isRecording = ref(false);
const isConnecting = ref(false);

let recorder = null;

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
};

const onError = (error) => {
  message.error(error);
  isConnecting.value = false;
};

function toggleRecording() {
  if (isRecording.value) {
    recorder.stop();
  } else {
    isConnecting.value = true;
    recorder = new IatRecorder({ onTextUpdate, onError, onStart, onStop });
    recorder.start();
  }
}
</script>
