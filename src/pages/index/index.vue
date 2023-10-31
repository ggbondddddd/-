<script setup lang="ts">
import { getHomeBannerAPI, getHomeCategoryAPI, getHomeHotAPI } from '@/services/home'
import type { BannerItem, CategoryItem, HotItem } from '@/types/home.d.ts'
import type { XtxGuessInstance } from '@/types/component.d.ts'
import CustomNavbar from './components/CustomNavbar.vue'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import CategoryPanel from '@/pages/index/components/CategoryPanel.vue'
import XtxGuess from '@/components/XtxGuess.vue'
// 骨架屏,应该就是没有任何任何请求回来数据的骨架，防止数据请求回来速度太慢，用户看到的是白板，可以让用户看到页面的大体结构
import PageSkeleton from '@/pages/index/components/PageSkeleton.vue'

// 获取轮播图数据        运用了一个type类型
const bannerList = ref<BannerItem[]>([])
const getHomerBannerData = async () => {
  const res = await getHomeBannerAPI()
  // console.log(res)
  bannerList.value = res.result
}

// 获取前台分类数据
const categoryList = ref<CategoryItem[]>([])
const getHomeCategoryData = async () => {
  const res = await getHomeCategoryAPI()
  categoryList.value = res.result
  // console.log(res)
}

// 获取热门推荐数据
const hotList = ref<HotItem[]>([])
const getHomeHotData = async () => {
  const res = await getHomeHotAPI()
  hotList.value = res.result
}

// 是否加载中标记
const isLoading = ref(false)

// 这个onLoad是小程序提供的生命周期钩子,我认为这个生命周期在电脑端也有，这是属于最大的组件vue的生命周期
onLoad(async () => {
  // 加载过程中，骨架屏显现
  isLoading.value = true
  await Promise.all([getHomerBannerData(), getHomeCategoryData(), getHomeHotData()])
  // 当await获得到结果也就说明加载完毕了,骨架屏隐藏
  isLoading.value = false
})

// 这是vue3的api，假如你给子组件标记为ref='ggbond' ，父组件获取的时候必须 const ggbond=ref(),这是规定
// // 1.没有封装版本 获取猜你喜欢组件实例
// const guessRef = ref<XtxGuessInstance>()
// // 滚动触底事件的回调函数
// const onScrolltolower = () => {
//   guessRef.value?.getMore()
// }

//2.封装的版本 引入调用猜你喜欢组合式函数
import { useGuessList } from '@/composables/index'
import HotPanel from '@/pages/index/components/HotPanel.vue'
const { guessRef, onScrolltolower } = useGuessList()

const isTriggered = ref(false)
// 自定义下拉刷新被触发事件的回调，这里用async，await是为了等这几个请求全部发送完毕然后再关闭动画
const onRefresherrefresh = async () => {
  // 开始动画
  isTriggered.value = true
  // 重置猜你喜欢组件数据,然后调用猜你喜欢组件发请求获取重置后的数据渲染页面
  guessRef.value?.resetDate()
  // await getHomerBannerData()
  // await getHomeCategoryData()
  // await getHomeHotData()
  await Promise.all([
    getHomerBannerData(),
    getHomeCategoryData(),
    getHomeHotData(),
    guessRef.value?.getMore(),
  ])
  // 请求全部完毕关闭下拉刷新的动画
  isTriggered.value = false
}
</script>

<template>
  <!-- 自定义导航栏 -->
  <CustomNavbar />
  <!-- 被包裹的组件可以滚动，而上方导航栏没有被包裹，不会滚动，而是类似固定定位，一直在那不动 -->
  <!-- refresher-enabled:true 开启下拉刷新，写成refresher-enabled就是前面true的意思  @refresherrefresh刷新的事件-->
  <scroll-view
    refresher-enabled
    @refresherrefresh="onRefresherrefresh"
    :refresher-triggered="isTriggered"
    @scrolltolower="onScrolltolower"
    class="scroll-view"
    scroll-y
  >
    <!-- 骨架屏 -->
    <PageSkeleton v-if="isLoading" />
    <template v-else>
      <!-- 自定义轮播图  pages.json里面自动导入了，不需要自己引入了 -->
      <!-- <view style="height: 30%; width: 100%"> -->
      <XtxSwiper :list="bannerList" />
      <!-- </view> -->
      <!--分类面板  -->
      <CategoryPanel :list="categoryList" />
      <!-- 热门推荐 -->
      <HotPanel :list="hotList" />
      <!-- 猜你喜欢全局组件 -->
      <XtxGuess ref="guessRef" />
    </template>
  </scroll-view>
</template>

<style lang="scss">
/* #ifdef APP-PLUS */
#app,
/* #endif */
// page就相当于是电脑端的body标签
page {
  background-color: #f7f7f7;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.scroll-view {
  flex: 1;
}
</style>
