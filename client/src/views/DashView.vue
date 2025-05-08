<script setup>
import { ref, h, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Modal } from 'ant-design-vue';

import { getUser } from '@/units/storage';
import eventBus from '@/units/eventBus';
import NewTransactionView from '@/components/transaction/NewTransactionView.vue';
import TransactionsList from '@/components/transaction/TransactionsList.vue';

const router = useRouter();
const { t } = useI18n();

const transactionsList = ref();

const nick = ref(t('login.title'));

const user = getUser();
const isLoggedIn = ref(user);

onMounted(() => {
  const welcomeElement = document.querySelector('.welcome');
  if (welcomeElement) {
    console.log(welcomeElement.innerHTML);
  }
  let speechInstance = new SpeechSynthesisUtterance(t('dash.welcome', { name: nick.value }));
  speechSynthesis.speak(speechInstance);

  if (user) {
    nick.value = user.nick;
  }
});

const handleTransferSuccess = (result) => {
  console.log(result);
  const messages = result.transactions.map((transaction) => {
    return t('dash.transferSuccessMessage', {
      to: transaction.to_nick,
      amount: transaction.amount,
      comment: transaction.comment,
    });
  });

  Modal.success({
    title: t('dash.transferSuccess'),
    content: h('div', {
      innerHTML: messages.join('<br>') + '<br>' + t('dash.balance', { amount: result.balance })
    }),
  });
  eventBus.balance = result.balance;
  eventBus.refresh = !eventBus.refresh;
};

</script>

<template>
  <a-alert v-if="!isLoggedIn" :message="t('dash.loginPrompt')" type="info" show-icon>
  </a-alert>
  <div v-else>
    <a-typography-title :level="2" class="welcome">{{ $t('dash.welcome', { name: nick }) }}</a-typography-title>
    <a-flex wrap="wrap" justify="center" gap="large" :style="{ marginTop: '10px' }">
      <NewTransactionView class="transactions-list" @success="handleTransferSuccess" />
      <a-flex>
      </a-flex>
    </a-flex>

    <a-flex wrap="wrap" justify="center" gap="large" :style="{ marginTop: '10px' }">
        <TransactionsList ref="transactionsList" :style="{ width: '100%', maxWidth: '980px' }" class="transactions-list" />
</a-flex>
  </div>
</template>

<style scoped></style>
