<script setup>
import { ref, onMounted, watch } from 'vue';
import { callApi } from '@/units/api';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

const { t } = useI18n();


const initialNewPostState = {
    title: '',
    content: '',
    enableVote: false,
    loading: false
};

const newPostState = ref({ ...initialNewPostState });

const emit = defineEmits(['refresh']);

const handlePost = post => {
    newPostState.value.loading = true;
    callApi('post/new', {
        method: 'POST',
        body: post
    }).then((res) => {
        newPostState.value.loading = false;
        newPostState.value = { ...initialNewPostState };
        emit('refresh', res.data);
    }).catch((err) => {
        newPostState.value.loading = false;
        message.error(err.message);
    });
};

</script>

<template>
    <a-card :title="t('post.new')" style="max-width: 600px; margin: 16px auto;">
        <a-form class="new-post" :model="newPostState" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }"
            @finish="handlePost">
            <a-form-item name="title" :label="t('post.title')" required>
                <a-input v-model:value="newPostState.title" />
            </a-form-item>
            <a-form-item name="content" :label="t('post.content')" required>
                <a-textarea v-model:value="newPostState.content" />
            </a-form-item>
            <a-form-item name="enableVote" :wrapper-col="{ offset: 8, span: 16 }">
                <a-checkbox v-model:checked="newPostState.enableVote">{{ t('post.enableVote') }}</a-checkbox>
            </a-form-item>
            <a-form-item>
                <a-button type="primary" html-type="submit" :loading="newPostState.loading">
                    {{ t('post.submit') }}
                </a-button>
            </a-form-item>
        </a-form>
    </a-card>
</template>
