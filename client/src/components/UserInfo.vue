<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

import { callApi } from '@/units/api';
import { getUser, setUser } from '@/units/storage';
import eventBus from '@/units/eventBus';

const router = useRouter();
const { t } = useI18n();

const show = ref(true);
const loading = ref(false);
const nick = ref(t('login.title'));
const user = ref(getUser());

onMounted(() => {
    if (user.value) {
        nick.value = user.value.nick || t('login.title');
    }
});


// 已在登录页面则不显示信息（未登录状态为登录按钮）
if (router.currentRoute.value.name === 'login') show.value = false;

function handleMenuClick({ key }) {
    switch (key) {
        case '1':
            break;
        case '2':
            message.success('账号已登出');
            setUser();
            router.push({ name: 'login' });
            break;
        case '3':
            callApi('user/delete', { method: 'DELETE' }).then(() => {
                message.success('Account deleted');
                setUser();
                router.push({ name: 'login' });
            }).catch((error) => {
                message.error(error.message);
            });
            break;
    }
    eventBus.refresh = !eventBus.refresh;
}

const fetchBalance = () => {
    loading.value = true;
    callApi('transaction/fetch_balance').then((res) => {
        eventBus.balance = res.data.balance;
    }).catch((error) => {
        // message.error(error.message);
    }).finally(() => {
        loading.value = false;
    });
};

watch(() => eventBus.refresh, () => {
    user.value = getUser();
    nick.value = user.value.nick;
    fetchBalance();
});

const broadcastRefresh = () => eventBus.refresh = !eventBus.refresh;

onMounted(() => {
    broadcastRefresh();
});
</script>

<template>
    <a-dropdown v-if="show">
        <template #overlay>
            <a-menu @click="handleMenuClick" v-if="user">
                <a-menu-item key="1">
                    {{ nick }}
                </a-menu-item>
                <a-menu-item key="2">
                    {{ $t('dash.logout') }}
                </a-menu-item>
                <a-menu-item key="3">
                    {{ $t('dash.deleteAccount') }}
                </a-menu-item>
            </a-menu>
        </template>
        <a-button @click="broadcastRefresh" :loading="loading" v-if="user">
            {{ t('dash.balance', { amount: eventBus.balance }) }}
        </a-button>
        <a-button @click="router.push({ name: 'login' })" v-else>
            {{ t('login.title') }}
        </a-button>
    </a-dropdown>
</template>

<style scoped></style>