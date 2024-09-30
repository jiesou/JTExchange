
<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api.js';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router'

import CardReader from '@/components/CardReader.vue';

const router = useRouter();

const registerState = ref({
    pk: null,
    nick: null,
    password: null,
    cardData: null,
    loading: false
});

const handleCardInput = (cardData) => {
    registerState.value.cardData = cardData;
};

const handleRegister = () => {
    registerState.value.loading = true;
    callApi('user/new', {
        method: 'POST',
        headers: {
            'X-Pk': registerState.value.pk,
            'X-Password': registerState.value.password ? registerState.value.password : null,
            'X-Carddata': registerState.value.cardData ? registerState.value.cardData : null
        },
        body: {
            nick: registerState.value.nick,
        }
    }).then(res => {
        message.success(res.message);
        router.push('/login');  // 注册成功后跳转到登录页面
    }).catch(error => {
        message.error(error.message);
        registerState.value.loading = false;
    });
};
</script>

<template>
    <div class="register-container">
        <h1>{{ $t('register.title') }}</h1>
        <a-form :model="registerState" @finish="handleRegister">
            <a-form-item name="pk" :label="$t('login.pk')">
                <a-input v-model:value="registerState.pk" :placeholder="$t('login.pk')" required></a-input>
            </a-form-item>
            <a-form-item name="nick" :label="$t('login.nick')">
                <a-input v-model:value="registerState.nick" :placeholder="$t('login.nick')" required></a-input>
            </a-form-item>
            <a-form-item name="password" :label="$t('login.password')">
                <a-input-password v-model:value="registerState.password" type="password" :placeholder="$t('login.password')" required></a-input-password>
            </a-form-item>
            <a-space size="large">
                <a-button type="primary" html-type="submit" :loading="registerState.loading">{{ $t('register.title') }}</a-button>
                <router-link to="/login">{{ $t('login.title') }}</router-link>
            </a-space>
        </a-form>
    </div>
    <CardReader @input-entered="handleCardInput" />
</template>

<style scoped>
.register-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
