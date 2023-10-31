<!-- 1.拿到服务器请求回来的地址数据渲染页面
     2.添加右滑删除地址的操作 这是一个组件，具体看下面的结构
     uni.showModal  uni-swipe-action  -->

<script setup lang="ts">
import { getMemberAddressAPI, deleteMemberAddressByIdAPI } from '@/services/address'
import { useAddressStore } from '@/stores/modules/address'
import type { AddressItem } from '@/types/good'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
//  获取收货地址列表数据
const addressList = ref<AddressItem[]>([])
const getMemberAddressData = async () => {
  const res = await getMemberAddressAPI()
  addressList.value = res.result
}
// onLoad初始化调用,只会在初始化的时候调用一次，当你新建地址保存跳转回了这个页面，并没有发请求更新页面
// 而onshow你新建页面后跳转回本页面会重新发请求获取新的数据，这也是一个生命周期钩子
onShow(() => {
  getMemberAddressData()
})

// 删除收货地址
const onDeleteAddress = (id: string) => {
  // 二次确认  是uniapp的组件，用法看文档
  uni.showModal({
    content: '删除地址',
    success: async (res) => {
      // 用户点击了确认按钮
      if (res.confirm) {
        // 根据id删除收货地址
        await deleteMemberAddressByIdAPI(id)
        // 删除成功后重新获取收货地址列表
        getMemberAddressData()
      }
    },
  })
}

// 点击某一个地址的时候收集到这个收货地址的参数，然后返回上一页，在上一页渲染返回来的参数
const onChangeAddress = (item: AddressItem) => {
  // 修改地址返回上一页
  const addressStore = useAddressStore()
  addressStore.changeSelectdAddress(item)
  // 返回上一页
  uni.navigateBack()
}
</script>

<template>
  <view class="viewport">
    <!-- 地址列表 -->
    <scroll-view class="scroll-view" scroll-y>
      <!--数组addressList长度为0说明没有地址存在，显示暂无地址  -->
      <view v-if="addressList.length" class="address">
        <!--uni-swipe-action 滑动操作，右滑地址栏可以展示删除按钮  -->
        <uni-swipe-action class="address-list">
          <!-- 收货地址项 uni-swipe-action-item 滑动操作项-->
          <uni-swipe-action-item class="item" v-for="item in addressList" :key="item.id">
            <view class="item-content" @tap="onChangeAddress(item)">
              <view class="user">
                {{ item.receiver }}
                <text class="contact">{{ item.contact }}</text>
                <text v-if="item.isDefault === 1" class="badge">默认</text>
              </view>
              <view class="locate">{{ item.fullLocation }}{{ item.address }}</view>
              <navigator
                class="edit"
                hover-class="none"
                :url="`/pagesMember/address-form/address-form?id=${item.id}`"
                @tap.stop="() => {}"
                @tap.prevent="() => {}"
              >
                修改
              </navigator>
            </view>
            <!-- 滑动右侧显示的删除按钮的插槽 这里是上面的语法规定 -->
            <template #right>
              <button class="delete-button" @tap="onDeleteAddress(item.id)">删除</button>
            </template>
          </uni-swipe-action-item>
        </uni-swipe-action>
      </view>
      <view v-else class="blank">暂无收货地址</view>
    </scroll-view>
    <!-- 添加按钮 -->
    <view class="add-btn">
      <navigator hover-class="none" url="/pagesMember/address-form/address-form">
        新建地址
      </navigator>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

/* 删除按钮 */
.delete-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 100%;
  font-size: 28rpx;
  color: #fff;
  border-radius: 0;
  padding: 0;
  background-color: #cf4444;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;

  .scroll-view {
    padding-top: 20rpx;
  }
}

.address {
  padding: 0 20rpx;
  margin: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item-content {
    line-height: 1;
    padding: 40rpx 10rpx 38rpx;
    border-bottom: 1rpx solid #ddd;
    position: relative;

    .edit {
      position: absolute;
      top: 36rpx;
      right: 30rpx;
      padding: 2rpx 0 2rpx 20rpx;
      border-left: 1rpx solid #666;
      font-size: 26rpx;
      color: #666;
      line-height: 1;
    }
  }

  .item:last-child .item-content {
    border: none;
  }

  .user {
    font-size: 28rpx;
    margin-bottom: 20rpx;
    color: #333;

    .contact {
      color: #666;
    }

    .badge {
      display: inline-block;
      padding: 4rpx 10rpx 2rpx 14rpx;
      margin: 2rpx 0 0 10rpx;
      font-size: 26rpx;
      color: #27ba9b;
      border-radius: 6rpx;
      border: 1rpx solid #27ba9b;
    }
  }

  .locate {
    line-height: 1.6;
    font-size: 26rpx;
    color: #333;
  }
}

.blank {
  margin-top: 300rpx;
  text-align: center;
  font-size: 32rpx;
  color: #888;
}

.add-btn {
  height: 80rpx;
  text-align: center;
  line-height: 80rpx;
  margin: 30rpx 20rpx;
  color: #fff;
  border-radius: 80rpx;
  font-size: 30rpx;
  background-color: #27ba9b;
}
</style>
