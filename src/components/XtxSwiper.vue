<script setup lang="ts">
import type { BannerItem } from '@/types/home'
import { ref } from 'vue'

const activeIndex = ref(0)

// 当swiper下标发生变化时触发
// ts类型也可这样写 const onChange = (event: { detail: {} }) => {  下面利用的是我们安装的UniHelper插件提供的给小程序标签的类型声明
const onChange: UniHelper.SwiperOnChange = (event) => {
  // ！ 非空断言，就是我们主观上排除detail为空值的情况，前面value就不会飘红
  activeIndex.value = event.detail!.current
}

// 定义一个props接收轮播图数据   defineProps属性是vue3提供的
defineProps<{
  list: BannerItem[]
}>()
// console.log(props)
</script>

<template>
  <view class="carousel">
    <!-- @change是uniapp里给当swiper轮播图图片变化触发，回调函数参数event.detail里面有变化图片的下标 -->
    <swiper :circular="true" :autoplay="false" :interval="3000" @change="onChange">
      <swiper-item class="item" v-for="item in list" :key="item.id">
        <navigator url="/pages/index/index" hover-class="none" class="navigator">
          <image mode="aspectFill" class="image" :src="item.imgUrl"></image>
        </navigator>
      </swiper-item>
    </swiper>
    <!-- 指示点 -->
    <view class="indicator">
      <text
        v-for="(item, index) in list"
        :key="item.id"
        class="dot"
        :class="{ active: index === activeIndex }"
      ></text>
    </view>
  </view>
</template>

<style lang="scss">
@import './style/XtxSwiper.scss';
</style>
