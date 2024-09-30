<template>
    <div>
        <input type="text" v-model="inputValue" @keyup.enter="emitInput" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useEmit } from '@vueuse/core';

const inputValue = ref('');
const emit = useEmit();

const emitInput = () => {
    emit('input-entered', inputValue.value);
    inputValue.value = ''; // Clear the input after emitting
};
</script>

<style scoped>
/* Add your styles here */
</style>