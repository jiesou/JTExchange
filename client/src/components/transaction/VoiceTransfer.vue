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
import { message } from 'ant-design-vue';

// 初始化状态变量
const isRecording = ref(false);
const isConnecting = ref(false);
const recognizedText = ref('');
let websocket = null;
let mediaStreamSource = null;
let scriptProcessor = null;

// 获取 WebSocket URL
async function getWebSocketUrl() {
  const apiKey = import.meta.env.VITE_IFLYTEK_API_KEY;
  const apiSecret = import.meta.env.VITE_IFLYTEK_API_SECRET;
  const host = "iat-api.xfyun.cn";
  const date = new Date().toGMTString();
  const signature = await generateSignature(apiSecret, host, date);
  const authorization = btoa(`api_key="${apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`);
  return `wss://iat-api.xfyun.cn/v2/iat?authorization=${authorization}&date=${date}&host=${host}`;
}

async function generateSignature(apiSecret, host, date) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`);
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureArrayBuffer = await crypto.subtle.sign("HMAC", key, data);
  return arrayBufferToBase64(signatureArrayBuffer);
}

function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// 处理录音
async function startRecording() {
  isConnecting.value = true;
  const websocketUrl = await getWebSocketUrl();

  websocket = new WebSocket(websocketUrl);
  websocket.onopen = () => {
    isConnecting.value = false;
    isRecording.value = true;
    startUserMediaRecording();
    websocket.send(JSON.stringify({
      common: { app_id: import.meta.env.VITE_IFLYTEK_APP_ID },
      business: { language: "zh_cn", domain: "iat", accent: "mandarin", vad_eos: 5000, dwa: "wpgs" },
      data: { status: 0, format: "audio/L16;rate=16000", encoding: "raw" }
    }));
  };

  websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.code === 0 && data.data && data.data.result) {
      console.log(data.data.result);
      const word = data.data.result.ws
        .map((ws) => ws.cw)
          .map((cw) => cw.map((cw) => cw.w).join(''))
        .join('');

      console.log(word);
      switch (data.data.result.pgs) {
        case 'apd':
          recognizedText.value += data.data.result.ws.map((ws) => ws.cw.map((cw) => cw.w).join('')).join('');
          break;
        case 'rpl':
          const originText = recognizedText.value;
          const rg = data.data.result.rg;
          recognizedText.value = originText.slice(0, rg[0]) + word + originText.slice(rg[1]);
          break;
      }
      console.log(recognizedText.value);
    } else if (data.code !== 0) {
      message.error(data.message);
      stopRecording();
    }
  };

  websocket.onerror = (error) => {
    message.error(error);
    stopRecording();
  };

  websocket.onclose = () => {
    stopRecording();
  };
}

// 开始使用 getUserMedia 录音
async function startUserMediaRecording() {
  isRecording.value = true;

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // 创建 AudioContext 来处理音频流
  const audioContext = new AudioContext();
  mediaStreamSource = audioContext.createMediaStreamSource(stream);

  // 创建 ScriptProcessorNode 来捕获音频数据
  scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

  // 连接音频流到 ScriptProcessorNode
  mediaStreamSource.connect(scriptProcessor);
  scriptProcessor.connect(audioContext.destination);

  // 每次有音频数据时处理
  scriptProcessor.onaudioprocess = function(event) {
    const audioBuffer = event.inputBuffer.getChannelData(0);
    const pcmData = convertFloat32ToPCM(audioBuffer);
    const pcmBlob = new Blob([pcmData], { type: 'audio/pcm' });

    // 将 PCM Blob 发送到 sendAudioData
    sendAudioData(pcmBlob);
  };
}

// 将 Float32Array 转换为 PCM 格式的 Uint8Array
function convertFloat32ToPCM(float32Array) {
  const pcmData = new DataView(new ArrayBuffer(float32Array.length * 2)); // 16-bit PCM
  for (let i = 0; i < float32Array.length; i++) {
    const sample = Math.max(-1, Math.min(1, float32Array[i])); // 限制值在 [-1, 1] 之间
    pcmData.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true); // 写入 PCM 数据
  }
  return pcmData.buffer;
}

// 发送录音数据
async function sendAudioData(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const base64Audio = arrayBufferToBase64(arrayBuffer);
  websocket.send(JSON.stringify({
    data: { status: 1, format: "audio/L16;rate=16000", encoding: "lame", audio: base64Audio }
  }));
}

// 停止录音
function stopRecording() {
  isRecording.value = false;

  // 停止 ScriptProcessorNode
  if (scriptProcessor) {
    scriptProcessor.disconnect();
  }

  // 停止 MediaStreamSource
  if (mediaStreamSource) {
    mediaStreamSource.disconnect();
  }

  websocket.send(JSON.stringify({
    data: { status: 2, format: "audio/L16;rate=16000", encoding: "lame" }
  }));
  websocket.close();
}

// 切换录音状态
function toggleRecording() {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
}
</script>

<style scoped>
a-card {
  max-width: 600px;
  margin: auto;
}
</style>
