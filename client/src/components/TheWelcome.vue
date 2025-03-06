<script setup>
import WelcomeItem from './WelcomeItem.vue'
import DocumentationIcon from './icons/IconDocumentation.vue'
import ToolingIcon from './icons/IconTooling.vue'
import EcosystemIcon from './icons/IconEcosystem.vue'
import CommunityIcon from './icons/IconCommunity.vue'
import SupportIcon from './icons/IconSupport.vue'
</script>

<template>
  <h2>{{ $t('welcome.intro') }}</h2>
  <h3>{{ $t('welcome.introDesc') }}</h3>
  <a-flex wrap="wrap" gap="large" justify="center" :style="{ maxWidth: '80vw', justifySelf: 'center' }">
    <WelcomeItem :title="$t('welcome.education')" :description="$t('welcome.educationDesc')">
      <template #icon>
        <DocumentationIcon />
      </template>
    </WelcomeItem>

    <WelcomeItem :title="$t('welcome.tooling')" :description="$t('welcome.toolingDesc')">
      <template #icon>
        <ToolingIcon />
      </template>
    </WelcomeItem>

    <WelcomeItem :title="$t('welcome.ecosystem')" :description="$t('welcome.ecosystemDesc')">
      <template #icon>
        <EcosystemIcon />
      </template>
    </WelcomeItem>

    <WelcomeItem :title="$t('welcome.community')" :description="$t('welcome.communityDesc')">
      <template #icon>
        <CommunityIcon />
      </template>
    </WelcomeItem>

    <WelcomeItem :title="$t('welcome.support')" :description="$t('welcome.supportDesc')">
      <template #icon>
        <SupportIcon />
      </template>
    </WelcomeItem>
  </a-flex>

  <a-flex justify="center" :style="{ marginTop: '30px' }">
    <a-button type="primary" size="large" href="/register">{{ $t('welcome.registerNow') }}</a-button>
    <a-button type="secondary" size="large" href="/dash">{{ $t('welcome.getStarted') }}</a-button>
  </a-flex>
</template>

<style scoped>
h2 {
  text-align: center;
  font-size: xxx-large;
  font-weight: bolder;
  margin-top: 20px;
  margin-bottom: 20px;
}

h3 {
  text-align: center;
  font-size: x-large;
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 20px;
  color: grey;
}
</style>