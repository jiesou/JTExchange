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
  { title: '时间', dataIndex: 'time', key: 'date' },
  { title: '操作', dataIndex: 'action', key: 'action', scopedSlots: { customRender: 'action' }, minWidth: 200, },
  { title: '数量', dataIndex: 'amount', key: 'amount', minWidth: 200, },
  { title: '备注', dataIndex: 'comment', key: 'comment' },
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
      action: transaction.type === 'in' ? `${transaction.from_nick} 转入` : `转出给 ${transaction.to_nick} `,
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
    <TransactionsSummarize :transactions="transactions">
      <a-table :columns="columns" :data-source="transactions" :scroll="{ x: '1500' }" :width :pagination="pagination"
        :expand-column-width="100" @change="handleTableChange" row-key="id" :loading="loading">
        <template #bodyCell="{ record, column }">
          <template v-if="column.key === 'action'">
            <span>
              <span>{{ record.from_nick }}</span>
              <a-tag v-if="record.type === 'in'" color="green" :style="{ marginInlineStart: '8px' }">转入</a-tag>
              <a-tag v-else-if="record.type === 'out'" color="geekblue">转出给</a-tag>
              <span v-else>未知</span>
              <span>{{ record.to_nick }}</span>
            </span>
          </template>
        </template>
      </a-table>
    </TransactionsSummarize>
</template>


