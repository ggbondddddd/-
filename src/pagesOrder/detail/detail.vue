<script setup lang="ts">
import { useGuessList } from '@/composables'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { ref } from 'vue'
import {
  getMemberOrderByIdAPI,
  getMemberOrderConsignmentByIdAPI,
  putMemberOrderReceiptByIdAPI,
  getMemberOrderLogisticsByIdAPI,
  deleteMemberOrderAPI,
} from '@/services/order'
import type { OrderResult, LogisticItem } from '@/types/order'
import { OrderState, orderStateList } from '@/services/constants'
import PageSkeleton from './components/PageSkeleton.vue'
import { getPayWxPayMiniPayAPI, getPayMockAPI } from '@/services/pay'
// import { VertexBuffer } from 'XrFrame/kanata/lib/frontend'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 猜你喜欢
const { guessRef, onScrolltolower } = useGuessList()
// 弹出层组件
const popup = ref<UniHelper.UniPopupInstance>()
// 取消原因列表
const reasonList = ref([
  '商品无货',
  '不想要了',
  '商品信息填错了',
  '地址信息填写错误',
  '商品降价',
  '其它',
])
// 订单取消原因
const reason = ref('')
// 复制内容
const onCopy = (id: string) => {
  // 设置系统剪贴板的内容
  uni.setClipboardData({ data: id })
}
// 获取页面参数
const query = defineProps<{
  id: string
}>()

// 获取页面栈 返回的是一个数组，里面包含你访问到当前页之前的路由和当前页路由的一些相关信息，每一个元素就是你每个路由的实例
// 里面有你当前路径，还有可以使用的属性，如此处的animate动画
const pages = getCurrentPages()
// 获取当前页面实例 ,-1就是最后一项，也就是我们当前这一项,数组方法at，可以正负数下标获取到你指定的那个元素
// 此处需要把当前组件实例断言为any类型，这是官方并没有完善，只能这样屏蔽掉错误
const pageInstance = pages.at(-1) as any

// 页面渲染完毕，才可以绑定动画效果 onReady相当于是vue的onMounted
onReady(() => {
  // 动画效果  this.animate(selector, keyframes, duration, ScrollTimeline)依次属性是
  //实例（标签，关键帧，持续时间，滚动动画） ScrollTimeline里面scrollSource是你指定滚动的标签，只支持标签scroll-view
  pageInstance.animate(
    '.navbar', //选择器
    [{ backgroundColor: 'transparent' }, { backgroundColor: '#f8f8f8' }], //关键帧
    1000, //持续时间
    {
      scrollSource: '#scroller', //绑定的滚动标签名
      timeRange: 1000, //动画事件跨度
      startScrollOffset: 0, //滚动开始为0px
      endScrollOffset: 50, //结束为50px
    },
  )
  // 动画效果,导航栏标题
  pageInstance.animate('.navbar .title', [{ color: 'transparent' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
  // 动画效果,导航栏返回按钮
  pageInstance.animate('.navbar .back', [{ color: '#fff' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
})

// 获取订单详情
const order = ref<OrderResult>({} as OrderResult)
const getMemberOrderByIdData = async () => {
  const res = await getMemberOrderByIdAPI(query.id)
  order.value = res.result
  // 当此时处于待收货,待评价或已完成的状态显示物流信息,在支付失败这种肯定不能显示啊
  // 下面用的是includes方法,因为正常写太长了,这里不知道为啥
  // console.log(order.value.orderState)
  // console.log(order.value.orderState === OrderState.DaiShouHuo)

  // 暂时出问题了这里,详细地址接口
  // if (
  //   [OrderState.DaiShouHuo, OrderState.DaiPingJia, OrderState.YiWanCheng].includes(
  //     order.value.orderState,
  //   )
  // ) {
  // 发请求获取物流信息
  // getMemberOrderLogisticsByIdData()
}
// }
// 获取物流信息
const logisticList = ref<LogisticItem[]>()
const getMemberOrderLogisticsByIdData = async () => {
  try {
    // 这个接口貌似出问题了,好像是后端的问题,暂时应该无法解决了
    const res = await getMemberOrderLogisticsByIdAPI(query.id)
    logisticList.value = res.result.list
  } catch (error: any) {
    new Error(error.message)
  }
}
// 页面加载时
onLoad(() => {
  getMemberOrderByIdData()
})

// 倒计时结束的时间
const onTimeUp = () => {
  // 修改订单的状态为已取消
  order.value.orderState = OrderState.YiQuXiao
}

// 订单支付
const onOrderPay = async () => {
  // 开发环境就调用模拟支付
  if (import.meta.env.DEV) {
    await getPayMockAPI({ orderId: query.id })
  } else {
    // #ifdef MP-WEIXIN
    // 这个接口只有 appid 为 wx26729f20b9efae3a开发者才可以使用，而普通开发者用上面的模拟支付
    const res = await getPayWxPayMiniPayAPI({ orderId: query.id })
    wx.requestPayment(res.result)
    // #endif
  }

  uni.redirectTo({ url: `/pagesOrder/payment/payment?id=${query.id}` })
}

// 是否为开发环境,这里是为了显示出模拟发货这个按钮  当我们支付成功返回订单，order的orderstate就变为了代发货
const isDev = import.meta.env.DEV

// 模拟发货
const onOrderSend = async () => {
  // 也是判断是否是在开发环境下,只有开发环境下可以运行这个里面的代码
  if (isDev) {
    // 这个请求会将order.orderstate的值变为3,也就是待收货状态
    const res = await getMemberOrderConsignmentByIdAPI(query.id)
    // 提醒用户
    uni.showToast({ title: '模拟发货完成', icon: 'success' })
    // 主动更新订单状态为待收货
    // order.value.orderState = OrderState.DaiShouHuo
    order.value.orderState = res.result.orderState
    // console.log(order.value.orderState)
  }
}

// 确认收货
const onOrderConfirm = () => {
  // 二次确认的弹窗
  uni.showModal({
    content: '为保障您的权益,请受到或并确认无误后,再确认收货',
    success: async (res) => {
      if (res.confirm) {
        const res = await putMemberOrderReceiptByIdAPI(query.id)
        //  更新订单状态
        order.value = res.result
      }
    },
  })
}
// uni-popup 点击就弹出这个弹出框,取消在下面没有放在函数里
const cancelOrder = () => {
  // console.log(popup)
  popup.value!.open!()
}
// 点击取消订单里面的确认按钮跳转回购物车
const returnIndex = () => {
  uni.switchTab({ url: '/pages/cart/cart' })
}

// 删除订单
const onOrderDelete = () => {
  uni.showModal({
    content: '是否删除订单',
    success: async (success) => {
      if (success.confirm) {
        await deleteMemberOrderAPI({ ids: [query.id] })
        uni.redirectTo({ url: '/pagesOrder/list/list' })
      }
    },
  })
}
</script>

<template>
  <!-- 自定义导航栏: 默认透明不可见, scroll-view 滚动到 50 时展示 -->
  <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
    <view class="wrap">
      <!-- 此处是跳转回上一页  根据页面栈来判断,这里就是页面左上角的那个图表按钮,不同情况分别为小于号和小房子图标 -->
      <navigator
        v-if="pages.length > 1"
        open-type="navigateBack"
        class="back icon-left"
      ></navigator>
      <!-- 此处是跳转回首页 -->
      <navigator v-else url="/pages/index/index" open-type="switchTab" class="back icon-home">
      </navigator>
      <view class="title">订单详情</view>
    </view>
  </view>
  <scroll-view scroll-y class="viewport" id="scroller" @scrolltolower="onScrolltolower">
    <template v-if="order">
      <!-- 订单状态 -->
      <view class="overview" :style="{ paddingTop: safeAreaInsets!.top + 20 + 'px' }">
        <!-- 待付款状态:展示去支付按钮和倒计时 -->
        <template v-if="order!.orderState === OrderState.DaiFuKuan">
          <view class="status icon-clock">等待付款</view>
          <view class="tips">
            <text class="money">应付金额: ¥ {{ order.payMoney }}</text>
            <text class="time">支付剩余</text>
            <!-- 倒计时组件 uni里面的组件还是原生小程序里面的组件 second倒计时多少秒 @timeup倒计时时间到了触发-->
            <uni-countdown
              color="#fff"
              :show-day="false"
              :show-colon="false"
              splitor-color="#fff"
              :second="order.countdown"
              @timeup="onTimeUp"
            />
          </view>
          <!-- 支付 -->
          <view class="button" @tap="onOrderPay">去支付</view>
        </template>
        <!-- 其他订单状态:展示再次购买按钮 ,这里是我自己写的，有接口-->
        <template v-else>
          <!-- 订单状态文字 -->
          <view class="status"> {{ orderStateList[order.orderState]?.text }}</view>
          <view class="button-group">
            <navigator
              class="button"
              :url="`/pagesOrder/create/create?orderId=${query.id}`"
              hover-class="none"
            >
              再次购买
            </navigator>
            <!-- 待发货状态：模拟发货,开发期间使用,用于修改订单状态为已发货 -->
            <view
              v-if="isDev && order.orderState === OrderState.DaiFaHuo"
              @tap="onOrderSend"
              class="button"
            >
              模拟发货
            </view>
            <!-- 待收货状态：展示确认收货按钮 -->
            <view
              v-if="order.orderState === OrderState.DaiShouHuo"
              @tap="onOrderConfirm"
              class="button"
            >
              确认收货</view
            >
          </view>
        </template>
      </view>
      <!-- 配送状态  这里是我自己加的判断,因为详细地址获取不到,很简单因为接口出问题了-->
      <view class="shipment" v-if="logisticList">
        <!-- 订单物流信息 -->
        <view v-for="item in logisticList" :key="item.id" class="item">
          <view class="message">
            {{ item.text }}
          </view>
          <view class="date"> {{ item.time }}</view>
        </view>
        <!-- 用户收货地址 -->
        <view class="locate">
          <view class="user"> {{ order.receiverContact }} {{ order.receiverMobile }} </view>
          <view class="address"> {{ order.receiverAddress }} </view>
        </view>
      </view>
      <view class="shipment" v-else>
        <!-- 订单物流信息 -->
        <view v-for="item in 1" :key="item" class="item">
          <view class="message">
            您已在广州市天河区黑马程序员完成取件，感谢使用菜鸟驿站，期待再次为您服务。
          </view>
          <view class="date"> 2023-04-14 13:14:20 </view>
        </view>
        <!-- 用户收货地址 -->
        <view class="locate">
          <view class="user"> {{ order.receiverContact }} {{ order.receiverMobile }} </view>
          <view class="address"> {{ order.receiverAddress }} </view>
        </view>
      </view>

      <!-- 商品信息 -->
      <view class="goods">
        <view class="item">
          <navigator
            class="navigator"
            v-for="item in order.skus"
            :key="item.id"
            :url="`/pages/goods/goods?id=${item}`"
            hover-class="none"
          >
            <image class="cover" :src="item.image"></image>
            <view class="meta">
              <view class="name ellipsis">{{ item.name }}</view>
              <view class="type">{{ item.attrsText }}</view>
              <view class="price">
                <view class="actual">
                  <text class="symbol">¥</text>
                  <text>{{ item.curPrice }}</text>
                </view>
              </view>
              <view class="quantity">x{{ item.quantity }}</view>
            </view>
          </navigator>
          <!-- 待评价状态:展示按钮 -->
          <view class="action" v-if="order.orderState === OrderState.DaiPingJia">
            <view class="button primary">申请售后</view>
            <navigator url="" class="button"> 去评价 </navigator>
          </view>
        </view>
        <!-- 合计 -->
        <view class="total">
          <view class="row">
            <view class="text">商品总价: </view>
            <view class="symbol">{{ order.totalMoney }}</view>
          </view>
          <view class="row">
            <view class="text">运费: </view>
            <view class="symbol">{{ order.postFee }}</view>
          </view>
          <view class="row">
            <view class="text">应付金额: </view>
            <view class="symbol primary">{{ order.payMoney }}</view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="detail">
        <view class="title">订单信息</view>
        <view class="row">
          <view class="item">
            订单编号: {{ query.id }} <text class="copy" @tap="onCopy(query.id)">复制</text>
          </view>
          <view class="item">下单时间: {{ order.createTime }}</view>
        </view>
      </view>

      <!-- 猜你喜欢 -->
      <XtxGuess ref="guessRef" />

      <!-- 底部操作栏 -->
      <view class="toolbar-height" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"></view>
      <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
        <!-- 待付款状态:展示支付按钮 -->
        <template v-if="order.orderState === OrderState.DaiFuKuan">
          <view class="button primary" @tap="onOrderPay"> 去支付 </view>
          <!-- popup?.open?.() -->
          <view class="button" @tap="cancelOrder"> 取消订单 </view>
          <!-- 取消订单弹窗 -->
          <uni-popup ref="popup" type="bottom" background-color="#fff">
            <view class="popup-root">
              <view class="title">订单取消</view>
              <view class="description">
                <view class="tips">请选择取消订单的原因：</view>
                <view class="cell" v-for="item in reasonList" :key="item" @tap="reason = item">
                  <text class="text">{{ item }}</text>
                  <text class="icon" :class="{ checked: item === reason }"></text>
                </view>
              </view>
              <view class="footer">
                <view class="button" @tap="popup?.close?.()">取消</view>
                <view class="button primary" @tap="returnIndex">确认</view>
              </view>
            </view>
          </uni-popup>
        </template>
        <!-- 其他订单状态:按需展示按钮 -->
        <template v-else>
          <navigator
            class="button secondary"
            :url="`/pagesOrder/create/create?orderId=${query.id}`"
            hover-class="none"
          >
            再次购买
          </navigator>
          <!-- 待收货状态: 展示确认收货 -->
          <view class="button primary" v-if="order.orderState === OrderState.DaiShouHuo">
            确认收货
          </view>
          <!-- 待评价状态: 展示去评价 -->
          <view class="button" v-if="order.orderState === OrderState.DaiPingJia"> 去评价 </view>
          <!-- 待评价/已完成/已取消 状态: 展示删除订单 -->
          <view
            class="button delete"
            v-if="order.orderState >= OrderState.DaiPingJia"
            @tap="onOrderDelete"
          >
            删除订单
          </view>
        </template>
      </view>
    </template>
    <template v-else>
      <!-- 骨架屏组件 -->
      <PageSkeleton />
    </template>
  </scroll-view>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.navbar {
  width: 750rpx;
  color: #000;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  /* background-color: #f8f8f8; */
  background-color: transparent;

  .wrap {
    position: relative;

    .title {
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32rpx;
      /* color: #000; */
      color: transparent;
    }

    .back {
      position: absolute;
      left: 0;
      height: 44px;
      width: 44px;
      font-size: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      /* color: #000; */
      color: #fff;
    }
  }
}

.viewport {
  background-color: #f7f7f8;
}

.overview {
  display: flex;
  flex-direction: column;
  align-items: center;

  line-height: 1;
  padding-bottom: 30rpx;
  color: #fff;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: cover;

  .status {
    font-size: 36rpx;
  }

  .status::before {
    margin-right: 6rpx;
    font-weight: 500;
  }

  .tips {
    margin: 30rpx 0;
    display: flex;
    font-size: 14px;
    align-items: center;

    .money {
      margin-right: 30rpx;
    }
  }

  .button-group {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    width: 260rpx;
    height: 64rpx;
    margin: 0 10rpx;
    text-align: center;
    line-height: 64rpx;
    font-size: 28rpx;
    color: #27ba9b;
    border-radius: 68rpx;
    background-color: #fff;
  }
}

.shipment {
  line-height: 1.4;
  padding: 0 20rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;
  background-color: #fff;

  .locate,
  .item {
    min-height: 120rpx;
    padding: 30rpx 30rpx 25rpx 75rpx;
    background-size: 50rpx;
    background-repeat: no-repeat;
    background-position: 6rpx center;
  }

  .locate {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/locate.png);

    .user {
      font-size: 26rpx;
      color: #444;
    }

    .address {
      font-size: 24rpx;
      color: #666;
    }
  }

  .item {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/car.png);
    border-bottom: 1rpx solid #eee;
    position: relative;

    .message {
      font-size: 26rpx;
      color: #444;
    }

    .date {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.goods {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;

    .navigator {
      display: flex;
      margin: 20rpx 0;
    }

    .cover {
      width: 170rpx;
      height: 170rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .name {
      height: 80rpx;
      font-size: 26rpx;
      color: #444;
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 6rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .price {
      display: flex;
      margin-top: 6rpx;
      font-size: 24rpx;
    }

    .symbol {
      font-size: 20rpx;
    }

    .original {
      color: #999;
      text-decoration: line-through;
    }

    .actual {
      margin-left: 10rpx;
      color: #444;
    }

    .text {
      font-size: 22rpx;
    }

    .quantity {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 24rpx;
      color: #444;
    }

    .action {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-start;
      padding: 30rpx 0 0;

      .button {
        width: 200rpx;
        height: 60rpx;
        text-align: center;
        justify-content: center;
        line-height: 60rpx;
        margin-left: 20rpx;
        border-radius: 60rpx;
        border: 1rpx solid #ccc;
        font-size: 26rpx;
        color: #444;
      }

      .primary {
        color: #27ba9b;
        border-color: #27ba9b;
      }
    }
  }

  .total {
    line-height: 1;
    font-size: 26rpx;
    padding: 20rpx 0;
    color: #666;

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10rpx 0;
    }

    .symbol::before {
      content: '¥';
      font-size: 80%;
      margin-right: 3rpx;
    }

    .primary {
      color: #cf4444;
      font-size: 36rpx;
    }
  }
}

.detail {
  line-height: 1;
  padding: 30rpx 20rpx 0;
  margin: 20rpx 20rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 10rpx;
  background-color: #fff;

  .title {
    font-size: 30rpx;
    color: #444;
  }

  .row {
    padding: 20rpx 0;

    .item {
      padding: 10rpx 0;
      display: flex;
      align-items: center;
    }

    .copy {
      border-radius: 20rpx;
      font-size: 20rpx;
      border: 1px solid #ccc;
      padding: 5rpx 10rpx;
      margin-left: 10rpx;
    }
  }
}

.toolbar-height {
  height: 100rpx;
  box-sizing: content-box;
}

.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  height: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  border-top: 1rpx solid #ededed;
  border-bottom: 1rpx solid #ededed;
  background-color: #fff;
  box-sizing: content-box;

  .button {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 200rpx;
    height: 72rpx;
    margin-left: 15rpx;
    font-size: 26rpx;
    border-radius: 72rpx;
    border: 1rpx solid #ccc;
    color: #444;
  }

  .delete {
    order: 4;
  }

  .button {
    order: 3;
  }

  .secondary {
    order: 2;
    color: #27ba9b;
    border-color: #27ba9b;
  }

  .primary {
    order: 1;
    color: #fff;
    background-color: #27ba9b;
  }
}

.popup-root {
  padding: 30rpx 30rpx 0;
  border-radius: 10rpx 10rpx 0 0;
  overflow: hidden;

  .title {
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .description {
    font-size: 28rpx;
    padding: 0 20rpx;

    .tips {
      color: #444;
      margin-bottom: 12rpx;
    }

    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rpx 0;
      color: #666;
    }

    .icon::before {
      content: '\e6cd';
      font-family: 'erabbit' !important;
      font-size: 38rpx;
      color: #999;
    }

    .icon.checked::before {
      content: '\e6cc';
      font-size: 38rpx;
      color: #27ba9b;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 40rpx;
    font-size: 28rpx;
    color: #444;

    .button {
      flex: 1;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      margin: 0 20rpx;
      color: #444;
      border-radius: 72rpx;
      border: 1rpx solid #ccc;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border: none;
    }
  }
}
</style>
