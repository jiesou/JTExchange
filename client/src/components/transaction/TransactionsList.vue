<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { callApi } from '@/units/api';

import TransactionsSummarize from '@/components/transaction/TransactionsSummarize.vue';

const transactions = ref([]);
const loading = ref(false);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const columns = [
  { title: 'ID', dataIndex: 'innerid', key: 'innerid' },
  { title: 'From', dataIndex: 'from_pk', key: 'from_pk' },
  { title: 'To', dataIndex: 'to_pk', key: 'to_pk' },
  { title: 'Date', dataIndex: 'time', key: 'date' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  { title: 'Comment', dataIndex: 'comment', key: 'comment' },
];

const fetchData = async (page, pageSize) => {
  loading.value = true;
  callApi('transaction?' + new URLSearchParams({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  })).then((res) => {
    transactions.value = res.data.map((transaction) => ({
      ...transaction,
      time: new Date(Number(transaction.time)).toLocaleString(),
    }));
    pagination.value.total = res.data.length;
  }).catch((error) => {
    message.error(error.message);
  }).finally(() => {
    loading.value = false;
  });
};

const handleTableChange = (newPagination) => {
  pagination.value = newPagination || pagination.value;
  fetchData(pagination.value.current, pagination.value.pageSize);
};

onMounted(handleTableChange);

defineExpose({
  handleTableChange,
});
</script>

<template>
  <a-flex>
  <TransactionsSummarize :transactions="transactions" />
  <a-table :columns="columns" :data-source="transactions" :scroll="{ x: 'max-content' }" :pagination="pagination"
    @change="handleTableChange" row-key="id" :loading="loading" />
  </a-flex>
</template>
