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
const showFunc = ref(true);
const loading = ref(false);
const info = ref(t('login.title'));
const nick = ref(t('login.title'));

if (router.currentRoute.value.name === 'login') show.value = false;
const user = getUser();
if (user) {
    nick.value = user.nick;
} else {
    showFunc.value = false;
}
function handleMenuClick({ key }) {
    switch (key) {
        case '1':
            break;
        case '2':
            message.success('Account logouted');
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
}

const fetchBalance = () => {
    loading.value = true;
    callApi('transaction/fetch_balance').then((res) => {
        info.value = t('dash.balance', { amount: res.data.balance.toString() });
    }).catch((error) => {
        message.error(error.message);
    }).finally(() => {
        loading.value = false;
    });
};

const handleRefresh = () => {
    eventBus.refresh = !eventBus.refresh;
};


onMounted(() => {
    watch(() => eventBus.refresh, fetchBalance);
    handleRefresh();
});
</script>

<template>
    <a-dropdown v-if="show">
        <template #overlay>
            <a-menu @click="handleMenuClick" v-if="showFunc">
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
        <a-button @click="handleRefresh" :loading="loading">
            {{ info }}
        </a-button>
    </a-dropdown>
</template>

<style scoped></style>