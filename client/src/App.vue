<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, RouterView } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue';
import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import en_US from 'ant-design-vue/es/locale/en_US';
import { useI18n } from 'vue-i18n';

import UserInfo from '@/components/UserInfo.vue';
import { set } from '@vueuse/core';

const router = useRouter();
const { t, locale } = useI18n();

const langs = {
  'zh-hans': 'zh-hans',
  'zh-hant': 'zh-hant',
  'en-us': 'en-us',
  zh: 'zh-hans',
  'zh-cn': 'zh-hans',
  'zh-hk': 'zh-hant',
  'zh-tw': 'zh-hant',
  'zh-sg': 'zh-hans',
}
const currentLocale = computed({
  get() {
    console.log('Getting current locale', router.currentRoute.value.query.lang);
    const lang =
      langs[(router.currentRoute.value.query.lang ||
        navigator.language ||
        navigator.languages[0] ||
        '').toLowerCase()];
    console.log('Current language:', lang);
    return lang;
  },
  set(val) {
    const lang = langs[val.toLowerCase()] || 'en-us';
    console.log('Setting locale:', lang);
    router.replace({
      query: {
        ...router.currentRoute.query,
        lang: lang
      }
    });
    locale.value = lang;
  }
});
router.isReady().then(() => {
  currentLocale.value = currentLocale.value; // 初始化时确保语言正确
});
const isLargeScreen = computed(() => window.innerWidth >= 768);
const drawerOpen = ref(false);
const items = computed(() => [
  {
    key: 'home',
    label: t('welcome.title'),
  },
  {
    key: 'dash',
    label: t('dash.title'),
  },
  {
    key: 'platform',
    label: t('platform.title'),
  },
]);
const selectedKeys = computed({
  get() {
    const routeName = router.currentRoute.value.name;
    return routeName ? [routeName] : ['home'];
  },
  set(value) {
    const currentQuery = router.currentRoute.value.query;
    router.push({ name: value[0], query: { ...currentQuery } });

    // 小屏幕时关闭抽屉
    if (!isLargeScreen.value) {
      drawerOpen.value = false;
    }
  }
});

</script>

<template>
  <a-config-provider :theme="{
    token: {
      colorBgBase: '#fff'
    },
    components: {
      Layout: {
        colorBgHeader: '#fff'
      },
      Menu: {
        colorItemBg: '#fff',
        colorSubItemBg: '#fff'
      }
    }
  }" :locale="{
    'zh-hans': zh_CN,
    'zh-hant': zh_CN,
    'en-us': en_US,
  }[currentLocale]">
    <a-layout>
      <!-- 小屏幕时显示的drawer -->
      <a-drawer v-if="!isLargeScreen" placement="left" :open="drawerOpen" @close="drawerOpen = false" :closable="false"
        :width="250">
        <a-space align="baseline">
          <img alt="JTX logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        </a-space>
        <a-menu v-model:selectedKeys="selectedKeys" mode="vertical" :items="items" />
      </a-drawer>

      <!-- 大屏幕时显示的固定侧边栏 -->
      <a-layout-sider v-if="isLargeScreen" :width="250" :style="{
        background: '#fff',
        borderRight: '1px solid #f0f0f0'
      }">
        <a-space align="baseline">
          <img alt="JTX logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        </a-space>
        <a-menu v-model:selectedKeys="selectedKeys" mode="vertical" :items="items" />
      </a-layout-sider>

      <a-layout>
        <a-layout-header :style="{ paddingInline: '0' }">
          <a-space :style="{ margin: '0 16px' }" size="large">
            <!-- 只在小屏幕时显示菜单按钮 -->
            <a-button v-if="!isLargeScreen" @click="drawerOpen = true">
              <MenuOutlined />
            </a-button>
            <router-link to="/" @click="selectedKeys = ['1']">
              <h1>{{ t('app.title') }}</h1>
            </router-link>
          </a-space>
          <a-select v-model:value="currentLocale" :style="{ position: 'absolute', right: '16px', top: '16px' }">
            <a-select-option value="en">en</a-select-option>
            <a-select-option value="zh">zh</a-select-option>
          </a-select>
          <UserInfo :style="{ position: 'absolute', right: '32px', top: '16px' }" />
        </a-layout-header>
        <a-layout-content>
          <div :style="{ padding: '24px', minHeight: '360px', background: '#fff' }">
            <RouterView />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<style scoped>
.logo {
  margin: 16px;
}

h1 {
  align-content: center;
  font-size: xx-large;
  font-weight: bold;
}

router-link {
  color: inherit;
}

a-layout-content>div {
  margin: 10px;
  padding: 24px;
  background: #fff;
  min-height: 360px;
}
</style>