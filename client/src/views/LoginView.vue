<script setup>
import { ref } from 'vue';
import { callApi } from '@/units/api.js';
import { getUser, setUser } from '@/units/storage.js';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router'

import CardReader from '@/components/CardReader.vue';

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
            'X-Password': loginResult.password ? loginResult.password : null,
            'X-Carddata': loginResult.cardData ? loginResult.cardData : null
        }
    }).then(res => {
        message.success(res.message);
        setUser(res.data.pk, res.data.nick, loginResult.password, loginResult.cardData,);
        router.push('/dash');
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
    <div class="login-container">
        <h1>{{ $t('login.title') }}</h1>
        <a-form :model="loginState" @finish="handleLogin">
            <a-form-item name="pk" :label="$t('login.pk')">
                <a-input v-model:value="loginState.pk" :placeholder="$t('login.pk')" required></a-input>
            </a-form-item>
            <a-form-item name="password" :label="$t('login.password')">
                <a-input-password v-model:value="loginState.password" type="password" :placeholder="$t('login.password')"
                    required></a-input-password>
            </a-form-item>
            <a-button type="primary" html-type="submit" :loading="loginState.loading">{{ $t('login.title') }}</a-button>
        </a-form>
    </div>
    <CardReader @input-entered="handleCardInput" />
</template>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
