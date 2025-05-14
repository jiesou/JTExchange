<template>
  <NewPost @refresh="fetchPosts" />
  <a-spin :spinning="loading" delay=500>
    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
      <a-card v-for="post in posts" :key="post.id" style="max-width: 520px; min-width: 400px; margin-bottom: 8px;">
        <template #title>
          <a-card-meta :title="post.title"
            :description="post.author_nick + ' 于 ' + new Date(Number(post.time)).toLocaleString()"
            style="margin: 12px 0 8px 0;">
          </a-card-meta>
        </template>
        <template #extra v-if="post.author === getUser().pk">
          <a-button danger shape="circle" :icon="h(DeleteOutlined)" @click="() => deletePost(post.innerid)"
            :loading="deleteBtnStates[post.innerid]"></a-button>
        </template>
        <pre style="white-space: pre-wrap;">{{ post.content }}</pre><!--  允许换行 -->

        <div style="margin-top: 16px; position: relative;" v-if="post.supportCount || post.opposeCount">
          <a-progress style="position: absolute;"
            :percent="post.supportCount / (post.supportCount + post.opposeCount) * 100"
            :stroke-color="{ from: '#108ee9', to: '#87d068' }" :show-info="false" status="active" />
          <a-progress style="transform: rotateY(180deg);"
            :percent="post.opposeCount / (post.supportCount + post.opposeCount) * 100"
            :stroke-color="{ from: '#ff4d4f', to: '#ff7a45' }" :show-info="false" status="active" />
        </div>
        <a-flex v-if="post.enable_vote" justify="center" gap="small" :style="{ marginTop: '12px' }">
          <a-button type="primary" @click="votePost(post.innerid, 'support')" :disabled="post.supportDisabled">
            支持正方
          </a-button>
          <a-button type="primary" @click="votePost(post.innerid, 'oppose')" :disabled="post.opposeDisabled">
            支持反方
          </a-button>
        </a-flex>
      </a-card>
    </div>
  </a-spin>
  <a-empty v-if="posts.length === 0" :description="t('post.none')" />
</template>

<script setup>
import { ref, h, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';
import { DeleteOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();

import { callApi } from '@/units/api';
import eventBus from '@/units/eventBus';

import NewPost from '@/components/posts/NewPost.vue';
import { getUser } from '@/units/storage';

const posts = ref([]);
const loading = ref(true);

const fetchPosts = async () => {
  loading.value = true;
  callApi("post").then((res) => {
    posts.value = res.data;
  })
  // posts.value = [
  //   {
  //     id: 1,
  //     title: '钢笔摔坏，赔偿还是意外？',
  //     content: '测试同学一的钢笔被测试同学二无意中碰掉地上，导致笔尖摔坏，无法正常书写。\n\n正方（测试同学一）：测试同学二在打闹时碰掉了我的钢笔，导致笔尖损坏，他应该负责维修或赔偿。\n反方（测试同学二）：我并非故意针对测试同学一，只是和测试同学三玩耍时不小心碰到的。而且钢笔放在桌边本来就容易掉。'
  //   },
  //   {
  //     id: 2,
  //     title: '窗台清洁不彻底，谁的责任？',
  //     content: '小组负责的清洁区，测试同学一发现测试同学二负责擦的窗台仍有明显污渍，向老师报告。\n\n正方（测试同学一）：测试同学二没有认真完成他负责的窗台清洁，影响了我们小组的卫生评分，他不负责任。\n反方（测试同学二）：我已经擦过一遍了，那些污渍很难清理。而且测试同学一检查时过于挑剔，要求太高了。'
  //   },
  //   {
  //     id: 3,
  //     title: '漫画书书角折了，谁来负责？',
  //     content: '测试同学一向测试同学二借阅了一本漫画书，归还时书本有轻微破损（一个书角折叠）。\n\n正方（测试同学二）：测试同学一借我的漫画书时是完好的，但归还时书角已经折了。他不爱惜别人的东西，应该赔偿。\n反方（测试同学一）：我承认书角是在我这里折的，但这并非故意，可能是放在书包里时不小心压到了。'
  //   },
  //   {
  //     id: 4,
  //     title: '体育课冲撞纠纷，故意还是意外？',
  //     content: '体育课分组游戏时，测试同学一认为测试同学二在游戏中故意冲撞他，导致他摔倒。\n\n正方（测试同学一）：测试同学二在抢球时明显是故意朝我撞过来，导致我摔倒并擦伤了膝盖，他的行为具有攻击性。\n反方（测试同学二）：我只是积极抢球，场地比较滑，测试同学一自己没站稳摔倒了。这是正常的身体接触，并非故意。'
  //   },
  //   {
  //     id: 5,
  //     title: '自习课讨论引冲突，谁的错？',
  //     content: '测试同学一在自习课上小声和测试同学三讨论问题，测试同学二认为声音过大影响了他学习，出言制止时语气较重。\n\n正方（测试同学一或测试同学三）：我们讨论声音很小，测试同学二反应过度，并且用词不礼貌，影响了我们的学习。\n反方（测试同学二）：自习课应该保持安静，他们反复说话确实干扰了我思考。我提醒他们是应该的，语气稍重也是因为他们不听劝。'
  //   }
  // ];
  loading.value = false;
};

const deleteBtnStates = ref({});

const deletePost = (postInnerid) => {
  deleteBtnStates.value[postInnerid] = true;
  callApi("post/delete", {
    method: 'POST',
    body: { innerid: postInnerid }
  }).then((res) => {
    message.success(res.message);
    fetchPosts();
  }).catch((err) => {
    message.error(err.message);
  }).finally(() => {
    deleteBtnStates.value[postInnerid] = false;
  });
};


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

const votePost = async (postId, type) => {
  loading.value = true;
  callApi(`post/${postId}/${type}`, { method: 'POST' }).then((res) => {
    loading.value = false;
    message.success(res.message);
    for (const post of posts.value) {
      if (post.innerid === postId) {
        post.supportCount = res.data.supportCount;
        post.opposeCount = res.data.opposeCount;
      }
    }
  }).catch((err) => {
    loading.value = false;
    message.error(err.message);
  });
};

watch(() => eventBus.refresh, fetchPosts);

fetchPosts();
</script>

<style>
.ant-spin-container {
  /* post 列表在页面中间 */
  max-width: 1200px;
  margin: auto;
}

.publish-button {
  position: absolute;
  top: 16px;
  right: 16px;
}

.ant-card-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ant-form-item:last-child {
  margin-bottom: 0;
}

.ant-progress-inner {
  background-color: transparent;
}
</style>