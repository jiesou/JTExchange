<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { callApi } from '@/units/api';

const transactions = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 10,
});

const columns = [
  { title: 'ID', dataIndex: 'key', key: 'key' },
  { title: 'From', dataIndex: 'from_pk', key: 'from_pk' },
  { title: 'To', dataIndex: 'to_pk', key: 'to_pk' },
  { title: 'Date', dataIndex: 'time', key: 'date' },
  { title: 'Amount', dataIndex: 'amount', key: 'amount' },
  { title: 'Comment', dataIndex: 'comment', key: 'comment' },
];

const fetchData = async (page = pagination.current, pageSize = pagination.pageSize) => {
  loading.value = true;
  callApi('transaction?' + new URLSearchParams({
    limit: pageSize,
    offset: (page - 1) * pageSize,
  })).then((res) => {
    console.log(res.data);
    transactions.value = res.data;
    pagination.total = res.data.length;
  }).catch((error) => {
    message.error(error.message);
  }).finally(() => {
    loading.value = false;
  });
};

onMounted(fetchData);

const handleTableChange = (pagination) => {
  fetchData(pagination.current, pagination.pageSize);
};
</script>

<template>
  <a-table
    :columns="columns"
    :data-source="transactions"
    :scroll="{ x: 'max-content' }"
    :pagination="pagination"
    @change="handleTableChange"
    row-key="id"
    :loading="loading.value">
    <template #bodyCell="{ text, record, column }">
      <span v-if="column.key === 'time'">{{ new Date(record.time).toLocaleString() }}</span>
      <span v-else>{{ text }}</span>
    </template>
  </a-table>
</template>
