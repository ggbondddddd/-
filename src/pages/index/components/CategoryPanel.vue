<script setup lang="ts">
import type { CategoryItem } from '../../../types/home'
// 定义props接收前台参数
defineProps<{ list: CategoryItem[] }>()
</script>

<template>
  <view class="category">
    <navigator
      class="category-item"
      hover-class="none"
      url="/pages/index/index"
      v-for="item in list"
      :key="item.id"
    >
      <image class="icon" :src="item.icon"></image>
      <text class="text">{{ item.name }}</text>
    </navigator>
  </view>
</template>

<style lang="scss">
// 这应该是scss引入的方式吧
@import './style/CategoryPanel.scss';
</style>
