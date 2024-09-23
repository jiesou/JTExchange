<script setup>
import { ref } from 'vue';
import { getUser } from '../units/storage.js';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router'

const router = useRouter();

const loginState = ref({
    pk: null,
    password: null,
    loading: false,
});

const handleLogin = (loginResult) => {
    console.log(loginResult);
    loginState.value.loading = true;
    fetch('https://jtex.jiecs.top/api/user', {
        method: 'GET',
        headers: {
            'X-Pk': loginResult.pk,
            'X-Password': loginResult.password
        }
    })
        .then(res => res.json())
        .then(res => {
            console.log(res);
            if (Number(res.data.pk) == loginResult.pk) {
                message.success(res.message);
                localStorage.setItem('pk', loginResult.pk);
                localStorage.setItem('password', loginResult.password);
                router.push('/dash');
            } else {
                message.error(res.message);
            }
        })
        .catch(error => {
            message.error(error.message);
        });
};

const { pk: storagePk, password: storagePassword } = getUser();

if (storagePk && storagePassword) {
    loginState.value.pk = storagePk;
    loginState.value.password = storagePassword;
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
