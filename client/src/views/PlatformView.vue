<template>
  <a-button type="primary" class="publish-button" @click="publishPost">发布</a-button>
  <a-spin :spinning="loading">
    <a-flex wrap="wrap" gap="small">
        <a-card v-for="post in posts" :key="post.id" :title="post.title">{{ post.content }}</a-card>
    </a-flex>
  </a-spin>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const posts = ref([]);
const loading = ref(false);

const fetchPosts = async () => {
  loading.value = true;
  try {
    const response = await fetch('/api/posts');
    posts.value = await response.json();
  } catch (error) {
    posts.value = [
      { id: 1, title: 'Post 1', content: 'Post 1 contentyvagUBDSHv' },
      { id: 2, title: 'Post 2', content: 'Post 2 content' },
      { id: 3, title: 'Post 3', content: 'Post 3 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 contentdVASZ' },
      { id: 4, title: 'Post 4', content: 'Post 4 contentSBDczSDBbRWS' },
      { id: 4, title: 'Post 4', content: 'Post 4 contentNDTRZZNsznfz' },
      { id: 4, title: 'Post 4', content: 'Post 4 contentNRDFfnrSRg' },
{ id: 4, title: 'Post 4', content: 'Post 4 contentSHRSBS' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },
      { id: 4, title: 'Post 4', content: 'Post 4 content' },

    ];
  } finally {
    loading.value = false;
  }
};

const publishPost = () => {
  message.info('Publish post clicked');
};

onMounted(() => {
  fetchPosts();
});
</script>

<style scoped>
.publish-button {
  position: absolute;
  top: 16px;
  right: 16px;
}
</style>