<script setup lang="ts">
import { ref } from 'vue'
import OrderList from './components/OrderList.vue'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// tabs 数据
const orderTabs = ref([
  { orderState: 0, title: '全部' },
  { orderState: 1, title: '待付款' },
  { orderState: 2, title: '待发货' },
  { orderState: 3, title: '待收货' },
  { orderState: 4, title: '待评价' },
])

// 高亮下标 从my.vue我的页面跳转过来的时候显示对应的页面，且对应高亮
//  Number(qeury.type)将query.type由字符串转换为数字，因为orderstate就是数字
// 数组方法findIndex（）如果可以找到返回你找到的那个元素在数组里的下标
const activeIndex = ref(orderTabs.value.findIndex((v) => v.orderState === Number(qeury.type)))

// 获取从我的my.vue页面跳转过来传递的id
const qeury = defineProps<{
  type: string
}>()
</script>

<template>
  <view class="viewport">
    <!-- tabs -->
    <view class="tabs">
      <text
        class="item"
        v-for="(item, index) in orderTabs"
        :key="item.orderState"
        @tap="activeIndex = index"
      >
        {{ item.title }}
      </text>
      <!-- 游标  这里其实是利用定位加过渡做的，是一个新思路做tab栏切换时候 -->
      <view class="cursor" :style="{ left: activeIndex * 20 + '%' }"></view>
    </view>
    <!-- 添加下拉事件，用scroll-view -->

    <!-- 滑动容器 -->
    <!-- $event.detail.current当前滑块也就是当前swiper-item的下标
      :current="activeIndex"的意思就是让swiper所处item是activeIndex的值 -->
    <swiper class="swiper" @change="activeIndex = $event.detail.current" :current="activeIndex">
      <!-- 滑动项 -->
      <swiper-item v-for="item in orderTabs" :key="item.title">
        <!-- 订单列表 由于多页面都要用到，所以封装成组件，传递了区别不同tabs栏的orderState-->
        <OrderList :order-state="item.orderState" />
      </swiper-item>
    </swiper>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

// tabs
.tabs {
  display: flex;
  justify-content: space-around;
  line-height: 60rpx;
  margin: 0 10rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);
  position: relative;
  z-index: 9;

  .item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #262626;
  }

  .cursor {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 20%;
    height: 6rpx;
    padding: 0 50rpx;
    background-color: #27ba9b;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}
</style>
