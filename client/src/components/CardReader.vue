<template>
    <div>
        <!-- 隐藏的 input 元素，用于捕获键盘输入 -->
        <input type="text" v-model="inputValue" ref="hiddenInput" style="opacity: 0; position: absolute; left: -9999px;" />
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const inputValue = ref('');
const emit = defineEmits(['input-entered']);

const emitInput = () => {
    emit('input-entered', inputValue.value);
    inputValue.value = ''; // 清空输入框
};

const handleKeydown = (event) => {
    // 假设卡片数据以回车键结束
    if (event.key === 'Enter') {
        console.log('Card data entered:', inputValue.value);
        emitInput();
    } else {
        if (event.key.length === 1) inputValue.value += event.key;
    }
};

onMounted(() => {
    window.addEventListener('keydown', handleKeydown);
});

onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
/* 添加你的样式 */
</style>