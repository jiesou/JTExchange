<template>
  <a-button type="primary" class="publish-button" @click="publishPost">发布</a-button>
  <a-spin :spinning="loading" delay=500>
    <a-flex wrap="wrap" gap="small">
      <a-card v-for="post in posts" :key="post.id" :title="post.title">
        <a-typography-paragraph v-if="post.time">
          <pre>{{ new Date(Number(post.time)).toLocaleString() }}</pre>
        </a-typography-paragraph>
        <pre style="white-space: pre-wrap;">{{ post.content }}</pre><!--  允许换行 -->
        <a-flex justify="center" gap="small" :style="{ marginTop: '10px' }">
          <a-button type="primary" @click="supportPost(post.id, 'support')" :disabled="post.supportDisabled">
            支持正方
          </a-button>
          <a-button type="primary" @click="supportPost(post.id, 'oppose')" :disabled="post.opposeDisabled">
            支持反方
          </a-button>
        </a-flex>
      </a-card>
    </a-flex>
  </a-spin>
  <a-empty v-if="!posts" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';

import { callApi } from '@/units/api';
import eventBus from '@/units/eventBus';

const posts = ref([]);
const loading = ref(false);

const fetchPosts = async () => {
  loading.value = true;
  // try {
  //   const response = await fetch('/api/post');
  //   posts.value = await response.json();
  //   posts.value = posts.value.data;
  // } catch (error) {
  //   posts.value = [
  //     { id: 1, title: 'Post 1', content: 'Post 1 contentyvagUBDSHv' },

  //   ];
  // } finally {
  //   loading.value = false;
  // }

  posts.value = [
      { id: 1, title: '小法庭事件', content: '详情\n正方' },
    { id: 2, title: '小法庭事件22', content: '详情' },
    ];
    loading.value = false;

  updateDisableBtn();
};

const publishPost = () => {
  message.info('Publish post clicked');
};

const updateDisableBtn = (() => {
  // 已投票就 disable
  posts.value.forEach((post) => {
    const voteKey = `vote_${post.id}`;
    console.log('voteKey', voteKey);
    if (localStorage.getItem(voteKey)) {
      post.supportDisabled = true;
      post.opposeDisabled = true;
    } else {
      post.supportDisabled = false;
      post.opposeDisabled = false;
    }
  });
});

const supportPost = async (postId, type) => {
  const voteKey = `vote_${postId}`;
  if (localStorage.getItem(voteKey)) {
    message.warning('您已经投过票了');
    return;
  }

  loading.value = true;
  callApi(`post/${postId}/${type}`, { method: 'POST' }).then((res) => {
    loading.value = false;
    message.success(res.message);
    localStorage.setItem(voteKey, true); // Mark as voted
    updateDisableBtn();
  }).catch((err) => {
    loading.value = false;
    message.error(err.message);
  });
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