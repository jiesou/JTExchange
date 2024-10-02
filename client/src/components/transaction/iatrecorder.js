const transcodeWorker = new Worker(new URL("./transcode.worker.js", import.meta.url));

const arrayBufferToBase64 = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

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

export class IatRecorder {
  constructor({ onTextUpdate, onError, onStart, onStop }) {
    this.onTextUpdate = onTextUpdate;
    this.onError = onError;
    this.onStart = onStart;
    this.onStop = onStop;

    this.websocket = null;

    this.mediaStreamSource = null;
    this.scriptProcessor = null;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.audioDataQueue = [];
    this.audioInterval = null;

    transcodeWorker.onmessage = (event) => {
      this.audioDataQueue.push(...event.data);
    }
  }

  async start() {
    try {
      const websocketUrl = await getWebSocketUrl();
      this.websocket = new WebSocket(websocketUrl);
      this.websocket.onopen = this.handleWebSocketOpen.bind(this);
      this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
      this.websocket.onerror = this.handleWebSocketError.bind(this);
      this.websocket.onclose = this.handleWebSocketClose.bind(this);
    } catch (error) {
      this.onError(error);
      console.error(error);
    }
  }

  handleWebSocketOpen() {
    this.onStart();
    this.startUserMediaRecording();

    this.websocket.send(JSON.stringify({
      common: { app_id: import.meta.env.VITE_IFLYTEK_APP_ID },
      business: { language: "zh_cn", domain: "iat", accent: "mandarin", vad_eos: 5000, dwa: "wpgs" },
      data: { status: 0, format: "audio/L16;rate=16000", encoding: "raw" }
    }));

    this.audioInterval = setInterval(() => {
      console.log(this.audioDataQueue.length);
      if (this.audioDataQueue.length >= 1280) {
        this.sendAudioData();
        this.audioDataQueue = [];
      }
    }, 40);
    // Send audio data every 40ms, for 1280B (bytes) per time
  }

  handleWebSocketMessage(event) {
    const data = JSON.parse(event.data);
    if (data.code === 0 && data.data && data.data.result) {
      const word = data.data.result.ws
        .map(ws => ws.cw)
        .map(cw => cw.map(c => c.w).join(''))
        .join('');

      switch (data.data.result.pgs) {
        case 'apd':
          this.onTextUpdate((prevTexts) => {
            return prevTexts.push(word);
          });
          break;
        case 'rpl':
          const [start, end] = data.data.result.rg;
          this.onTextUpdate((prevTexts) => {
            return prevTexts.splice(start - 1, end - start + 1, word);
          });
          break;
      }
    } else if (data.code !== 0) {
      this.onError(data.message);
      this.stop();
    }
  }

  handleWebSocketError(error) {
    this.onError(error);
    this.stop();
  }

  handleWebSocketClose() {
    this.stop();
  }

  async startUserMediaRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.scriptProcessor = this.audioContext.createScriptProcessor(0, 1, 1);

    this.scriptProcessor.onaudioprocess = (event) => {
      const audioBuffer = event.inputBuffer.getChannelData(0);
      transcodeWorker.postMessage(audioBuffer);
      // this.audioDataQueue.push(pcmData);
      // Push to audio data queue, but dont send immediately
    }

    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
    this.mediaStreamSource.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  async sendAudioData() {
    const audio = this.audioDataQueue.slice(0, 1280);
    const base64Audio = arrayBufferToBase64(audio);
    this.websocket.send(JSON.stringify({
      data: { status: 1, format: "audio/L16;rate=16000", encoding: "raw", audio: base64Audio }
    }));
  }

  stop() {
    if (this.scriptProcessor) this.scriptProcessor.disconnect();
    if (this.mediaStreamSource) this.mediaStreamSource.disconnect();
    if (this.websocket) {
      this.websocket.send(JSON.stringify({
        data: { status: 2, format: "audio/L16;rate=16000", encoding: "raw" }
      }));
      this.websocket.close();
    }
    clearInterval(this.audioInterval);
    this.onStop();
  }
}
