<template>
  <a-button type="primary" class="publish-button" @click="publishPost">发布</a-button>
  <a-spin :spinning="loading" delay=500>
    <a-flex wrap="wrap" gap="small">
      <a-card v-for="post in posts" :key="post.id" :title="post.title" style="max-width: 480px;">
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
        <a-flex justify="center" gap="middle" :style="{ marginTop: '16px' }">
          <a-progress 
            :percent="calculateVotePercentage(post.supportCount, post.opposeCount, 'support')" 
            :stroke-color="{ from: '#108ee9', to: '#87d068' }"
            :format="() => `${post.supportCount || 0} 票`"
            status="active"
          />
          <a-progress 
            :percent="calculateVotePercentage(post.supportCount, post.opposeCount, 'oppose')" 
            :stroke-color="{ from: '#ff4d4f', to: '#ff7a45' }"
            :format="() => `${post.opposeCount || 0} 票`"
            status="active"
          />
        </a-flex>
        <a-typography-paragraph v-if="post.supportCount !== undefined && post.opposeCount !== undefined">
          支持正方: {{ post.supportCount }} | 支持反方: {{ post.opposeCount }}
        </a-typography-paragraph>
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

const fetchVotes = async (postId) => {
  try {
    const response = await callApi(`post/${postId}/votes`);
    const { support, oppose } = response.data;
    const post = posts.value.find(p => p.id === postId);
    if (post) {
      post.supportCount = support;
      post.opposeCount = oppose;
    }
  } catch (error) {
    console.error('Error fetching votes:', error);
  }
};

const fetchPosts = async () => {
  loading.value = true;
  posts.value = [
    {
      id: 1,
      title: '钢笔摔坏，赔偿还是意外？',
      content: '测试同学一的钢笔被测试同学二无意中碰掉地上，导致笔尖摔坏，无法正常书写。\n\n正方（测试同学一）：测试同学二在打闹时碰掉了我的钢笔，导致笔尖损坏，他应该负责维修或赔偿。\n反方（测试同学二）：我并非故意针对测试同学一，只是和测试同学三玩耍时不小心碰到的。而且钢笔放在桌边本来就容易掉。'
    },
    {
      id: 2,
      title: '窗台清洁不彻底，谁的责任？',
      content: '小组负责的清洁区，测试同学一发现测试同学二负责擦的窗台仍有明显污渍，向老师报告。\n\n正方（测试同学一）：测试同学二没有认真完成他负责的窗台清洁，影响了我们小组的卫生评分，他不负责任。\n反方（测试同学二）：我已经擦过一遍了，那些污渍很难清理。而且测试同学一检查时过于挑剔，要求太高了。'
    },
    {
      id: 3,
      title: '漫画书书角折了，谁来负责？',
      content: '测试同学一向测试同学二借阅了一本漫画书，归还时书本有轻微破损（一个书角折叠）。\n\n正方（测试同学二）：测试同学一借我的漫画书时是完好的，但归还时书角已经折了。他不爱惜别人的东西，应该赔偿。\n反方（测试同学一）：我承认书角是在我这里折的，但这并非故意，可能是放在书包里时不小心压到了。'
    },
    {
      id: 4,
      title: '体育课冲撞纠纷，故意还是意外？',
      content: '体育课分组游戏时，测试同学一认为测试同学二在游戏中故意冲撞他，导致他摔倒。\n\n正方（测试同学一）：测试同学二在抢球时明显是故意朝我撞过来，导致我摔倒并擦伤了膝盖，他的行为具有攻击性。\n反方（测试同学二）：我只是积极抢球，场地比较滑，测试同学一自己没站稳摔倒了。这是正常的身体接触，并非故意。'
    },
    {
      id: 5,
      title: '自习课讨论引冲突，谁的错？',
      content: '测试同学一在自习课上小声和测试同学三讨论问题，测试同学二认为声音过大影响了他学习，出言制止时语气较重。\n\n正方（测试同学一或测试同学三）：我们讨论声音很小，测试同学二反应过度，并且用词不礼貌，影响了我们的学习。\n反方（测试同学二）：自习课应该保持安静，他们反复说话确实干扰了我思考。我提醒他们是应该的，语气稍重也是因为他们不听劝。'
    }
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
    fetchVotes(postId); // 更新投票结果
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