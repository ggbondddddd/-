<script setup lang="ts">
import { getHomeGoodsGuessLikeAPI } from '@/services/home'
import type { GuessItem } from '@/types/home'
import { ref } from 'vue'
import { onMounted } from 'vue'
import type { PageParams } from '@/types/global.d.ts'

// 分页参数      ts里面的泛型工具函数Required可以将可选泛型变为必选
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}

// 猜你喜欢的列表
const guessList = ref<GuessItem[]>([])
// 已结束的标记  由于这里设计到了页面渲染所有利用到了响应式数据，而分页参数并没有涉及到页面渲染，只是作为请求参数，所有不需要添加响应式
const finish = ref(false)
//获取猜你喜欢数据,之所以不在首页里面获取而在组件内获取貌似因为还有别的组件会用到这个接口，而放在首页的
const getHomeGoodsGuessLikeData = async () => {
  // 退出判断，这里必须写在发请求之前，不然当你到了35页还会一直发请求，一直获取第35页的数据展示出来，这里相当于堵死了发请求
  if (finish.value === true) {
    // uniapp提供的轻提示
    return uni.showToast({ icon: 'none', title: '没有更多数据了' })
  }
  const res = await getHomeGoodsGuessLikeAPI(pageParams)
  // guessList.value = res.result.items
  // 数组追加，每次页面触底，就发一次请求，将猜你喜欢下一页数据获取过来追加到数组里渲染出来
  guessList.value.push(...res.result.items)
  // 分页条件，不能大于后端设置的最大页数
  if (pageParams.page < res.result.pages) {
    // 页码累加
    pageParams.page++
  } else {
    finish.value = true
  }
}
//当首页下拉刷新页面，重置数据的方法
const resetDate = () => {
  pageParams.page = 1
  guessList.value = []
  finish.value = false
}
// 组件挂载完毕
onMounted(() => {
  getHomeGoodsGuessLikeData()
})
// 暴露方法  是setup语法糖提供的暴露一些属性或方法给父页面去调用
defineExpose({
  // 前面是暴露出去的名字，键值一样的时候可省略
  getMore: getHomeGoodsGuessLikeData,
  // 重置数据
  resetDate,
})
</script>

<template>
  <!-- 猜你喜欢 -->
  <view class="caption">
    <text class="text">猜你喜欢</text>
  </view>
  <view class="guess">
    <navigator
      class="guess-item"
      v-for="item in guessList"
      :key="item.id"
      :url="`/pages/goods/goods?id=${item.id}`"
    >
      <image class="image" mode="aspectFill" :src="item.picture"></image>
      <view class="name"> {{ item.desc }} </view>
      <view class="price">
        <text class="small">¥</text>
        <text>{{ item.price }}</text>
      </view>
    </navigator>
  </view>
  <view class="loading-text"> {{ finish === true ? '没有数据了' : '正在加载...' }} </view>
</template>

<style lang="scss">
:host {
  display: block;
}
/* 分类标题 */
.caption {
  display: flex;
  justify-content: center;
  line-height: 1;
  padding: 36rpx 0 40rpx;
  font-size: 32rpx;
  color: #262626;
  .text {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 28rpx 0 30rpx;

    &::before,
    &::after {
      content: '';
      width: 20rpx;
      height: 20rpx;
      background-image: url(@/static/images/bubble.png);
      background-size: contain;
      margin: 0 10rpx;
    }
  }
}

/* 猜你喜欢 */
.guess {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0 20rpx;
  .guess-item {
    width: 345rpx;
    padding: 24rpx 20rpx 20rpx;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    overflow: hidden;
    background-color: #fff;
  }
  .image {
    width: 304rpx;
    height: 304rpx;
  }
  .name {
    height: 75rpx;
    margin: 10rpx 0;
    font-size: 26rpx;
    color: #262626;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .price {
    line-height: 1;
    padding-top: 4rpx;
    color: #cf4444;
    font-size: 26rpx;
  }
  .small {
    font-size: 80%;
  }
}
// 加载提示文字
.loading-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0;
}
</style>
