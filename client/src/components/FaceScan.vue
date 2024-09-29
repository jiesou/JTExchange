<script setup>
import * as faceapi from 'face-api.js';
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const video = ref(null);
const canvas = ref(null);

const loadingModels = ref(true);

const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    loadingModels.value = false;
};

const startVideo = () => {
    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            if (videoDevices.length > 0) {
                return navigator.mediaDevices.getUserMedia({ video: { deviceId: videoDevices[0].deviceId } });
            } else {
                message.error('No video devices found');
            }
        })
        .then(stream => {
            video.value.srcObject = stream;
        })
        .catch(err => console.error('Error starting video stream:', err));
};

const detectFaces = async () => {
    const detections = await faceapi.detectAllFaces(video.value, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

    const resizedDetections = faceapi.resizeResults(detections, {
        width: video.value.width,
        height: video.value.height
    });

    canvas.value.getContext('2d').clearRect(0, 0, canvas.value.width, canvas.value.height);
    faceapi.draw.drawDetections(canvas.value, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas.value, resizedDetections);

    // Load labeled face descriptors from your database
    const labeledFaceDescriptors = await loadLabeledImages();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);

    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
    results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const text = result.toString();
        const drawBox = new faceapi.draw.DrawBox(box, { label: text });
        drawBox.draw(canvas.value);
    });
};

const loadLabeledImages = async () => {
    const labels = ['1'];
    return Promise.all(
        labels.map(async label => {
            const descriptions = [];
            for (let i = 1; i <= 1; i++) {
                const img = await faceapi.fetchImage(`/labeled_images/${label}.jpg`);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                descriptions.push(detections.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
};

onMounted(async () => {
    await loadModels();
    startVideo();
});
</script>

<template>
    <a-spin :spinning="loadingModels">
        <video ref="video" width="720" height="560" autoplay></video>
        <canvas ref="canvas" width="720" height="560"></canvas>
    </a-spin>
    <a-button type="primary" @click="detectFaces">Detect</a-button>
</template>

<style scoped>
video, canvas {
    position: absolute;
    top: 0;
    left: 0;
}
a-spin {
    position: relative;
    display: inline-block;
    min-height: 10vh;
}
</style>
