import { reactive } from 'vue';
const eventBus = reactive({
    refresh: false,
    balance: '--',
});
export default eventBus;