<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api.js';
import { getUser, setUser } from '@/units/storage.js';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router'

import CardReader from '@/components/CardReader.vue';
import eventBus from '@/units/eventBus';

const router = useRouter();

const loginState = ref({
    pk: null,
    password: null,
    cardData: null,
    loading: false
});

const handleCardInput = (cardData) => {
    loginState.value.cardData = cardData;
    handleLogin(loginState.value);
};

const handleLogin = (loginResult) => {
    loginState.value.loading = true;
    callApi('user', {
        method: 'GET',
        headers: {
            'X-Pk': loginResult.pk,
            ...(loginResult.password && { 'X-Password': loginResult.password }),
            ...(loginResult.cardData && { 'X-Carddata': loginResult.cardData })
        }
    }).then(res => {
        message.success(res.message);
        setUser(res.data.pk, res.data.nick, loginResult.password, loginResult.cardData);
        eventBus.refresh = !eventBus.refresh;
        router.push({ name: 'dash' });
    }).catch(error => {
        message.error(error.message);
        loginState.value.loading = false;
    });
};

const user = getUser();

if (user) {
    loginState.value.pk = user.pk;
    loginState.value.password = user.password;
    loginState.value.cardData = user.cardData;
    handleLogin( loginState.value );
}
</script>

<template>
        <a-flex wrap="wrap" justify="center" gap="large" :style="{ marginTop: '10px' }">
            <a-card :title="$t('login.title')" style="width: 300px;">
            <a-form :model="loginState" @finish="handleLogin">
                <a-form-item name="pk" :label="$t('login.pk')">
                    <a-input v-model:value="loginState.pk" :placeholder="$t('login.pk')" required></a-input>
                </a-form-item>
                <a-form-item name="password" :label="$t('login.password')">
                    <a-input-password v-model:value="loginState.password" type="password"
                        :placeholder="$t('login.password')" required></a-input-password>
                </a-form-item>
                <a-space size="large">
                    <a-button type="primary" html-type="submit" :loading="loginState.loading">{{ $t('login.title')}}</a-button>
                    <router-link to="/register">{{ $t('register.title') }}</router-link>
                </a-space>
            </a-form>
            </a-card>
            <CardReader @input-entered="handleCardInput" />
        </a-flex>
</template>

<style scoped>
</style>
