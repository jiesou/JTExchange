<template>
  <a-card hoverable style="width: 300px">
    <a-card-meta :title="title" :description="description">
      <template #avatar>
        <slot name="icon"></slot>
      </template>
    </a-card-meta>
  </a-card>
</template>
<script>
export default {
  props: ['title', 'description']
}
</script>