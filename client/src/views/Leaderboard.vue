<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { callApi } from '@/units/api';
import eventBus from '@/units/eventBus';

const { t } = useI18n();

const loading = ref(true);
const allUsers = ref([]);
const mostBalance = ref(0);

const fetchLeaderboard = async () => {
    loading.value = true;
    callApi("leaderboard/balance").then((res) => {
        allUsers.value = res.data;
        mostBalance.value = Math.max(...res.data.map(user => user.balance || 0));
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        loading.value = false;
    });
};
watch(eventBus.refresh, fetchLeaderboard);
fetchLeaderboard();
</script>
<template>
    <a-card :title="t('leaderboard.title')" class="leaderboard-card">
        <a-spin :spinning="loading" size="large">
            <a-list>
                <a-list-item v-for="user in allUsers">
                    <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                        <span style="min-width: 64px; text-wrap-mode: nowrap;">{{ user.nick }}</span>
                        <a-progress :percent="user.balance / mostBalance * 100" status="active" :show-info="false" />
                    </div>
                </a-list-item>
            </a-list>
        </a-spin>
        <a-empty v-if="allUsers.length === 0" :description="t('none')" />
    </a-card>
</template>