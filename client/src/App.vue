<script setup>
import { ref, watch } from 'vue';
import { useRouter, RouterView } from 'vue-router'
import { MenuOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const selectedKeys = ref(['1']);
const drawerOpen = ref(false);
const items = ref([
  {
    key: '1',
    label: t('welcome.title'),
  },
  {
    key: '2',
    label: t('dash.title'),
  },
]);

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
  drawerOpen.value = false;
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
      <a-drawer placement="left" :open="drawerOpen" @close="drawerOpen = false" :closable=false >
        <a-space align="baseline">
          <img alt="JTX logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
        </a-space>
        <a-menu v-model:selectedKeys="selectedKeys" mode="vertical" :items="items" />
      </a-drawer>
      <a-layout>
        <a-layout-header :style="{ paddingInline: '0' }">
          <a-menu mode="horizontal" :selectable=false>
            <a-menu-item key="1">
              <a-button @click="drawerOpen = true">
                <MenuOutlined />
              </a-button>
            </a-menu-item>
            <a-menu-item key="2">
              <router-link to="/"><h1>{{ t('app.title') }}</h1></router-link>
            </a-menu-item>
          </a-menu>
          <a-select v-model:value="$i18n.locale" :style="{ position: 'absolute', right: '16px', top: '16px' }">
            <a-select-option value="en">en</a-select-option>
            <a-select-option value="zh">zh</a-select-option>
          </a-select>
        </a-layout-header>
        <a-layout-content>
          <div :style="{ padding: '24px' }">
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


a-layout-content > div {
  margin: 10px;
  padding: 24px;
  background: #fff;
  min-height: 360px;
}
</style>
