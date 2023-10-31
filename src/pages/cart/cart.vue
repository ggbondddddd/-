<script setup lang="ts">
import CartMain from './components/CartMain.vue'
</script>
<template>
  <CartMain />
</template>
<!-- 解决手机端视口的问题，不设置高度触底也不会刷新出下一页数据，因为你的高度没设置的时候显示一千多px而屏幕肯定小于，设置了就解决了这个问题 -->
<style lang="scss">
page {
  height: 100%;
}
</style>
