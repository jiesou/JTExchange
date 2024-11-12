<template>
  <a-button type="primary" class="publish-button" @click="publishPost">发布</a-button>
  <a-spin :spinning="loading" delay=500>
    <a-flex wrap="wrap" gap="small">
      <a-card v-for="post in posts" :key="post.id" :title="post.title">
        <a-typography-paragraph v-if="post.time">
          <pre>{{ new Date(Number(post.time)).toLocaleString() }}</pre>
        </a-typography-paragraph>
        {{ post.content }}
      </a-card>
    </a-flex>
  </a-spin>
  <a-empty v-if="!posts" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';

import eventBus from '@/units/eventBus';

const posts = ref([]);
const loading = ref(false);

const fetchPosts = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/post');
    posts.value = await response.json();
    posts.value = posts.value.data;
  } catch (error) {
    posts.value = [
      { id: 1, title: 'Post 1', content: 'Post 1 contentyvagUBDSHv' },

    ];
  } finally {
    loading.value = false;
  }
};

const publishPost = () => {
  message.info('Publish post clicked');
};

onMounted(() => {
  setInterval(() => {
    eventBus.refresh = !eventBus.refresh;
  }, 1000);
});

watch(() => eventBus.refresh, fetchPosts);
</script>

<style scoped>
.publish-button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>