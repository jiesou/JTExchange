<script setup>
import { ref, watch } from 'vue';
import { useRouter, RouterView } from 'vue-router'
const selectedKeys = ref(['1']);

const router = useRouter();
watch(selectedKeys, (val) => {
  switch (val[0]) {
    case '1':
      router.push({ name: 'home' });
      break;
    case '2':
      router.push({ name: 'dash' });
      break;
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
      },

    }
  }">
    <a-layout>
      <a-layout-sider breakpoint="lg" collapsed-width="0">
        <a-space align="baseline">
          <img alt="JTX logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        </a-space>
        <a-menu v-model:selectedKeys="selectedKeys" mode="inline">
          <a-menu-item key="1">
            <user-outlined />
            <span class="nav-text">{{ $t('welcome.title') }}</span>
          </a-menu-item>
          <a-menu-item key="2">
            <user-outlined />
            <span class="nav-text">{{ $t('dash.title') }}</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
        <a-layout-header>
          <h1>{{ $t('app.title') }}</h1>
          <a-select v-model:value="$i18n.locale" :style="{ position: 'absolute', right: '10px', top: '10px' }">
            <a-select-option value="en">en</a-select-option>
            <a-select-option value="zh">zh</a-select-option>
          </a-select>
        </a-layout-header>
        <a-layout-content>
          <div :style="{ margin: '50px', padding: '24px', background: '#fff', minHeight: '360px' }">
            <RouterView />
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-config-provider>
</template>

<style  scoped>
.logo {
  margin: 16px;
}

h1 {
  align-content: center;
  font-size: xx-large;
  font-weight: bold;
}

a-select {
  align-self: center;
}
</style>
