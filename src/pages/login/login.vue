<script setup lang="ts">
import { postLoginWxMinAPI, postLoginWxMinSimpleAPI } from '@/services/login'
import { useMemberStore } from '@/stores'
import { onLoad } from '@dcloudio/uni-app'

// #ifdef MP-WEIXIN
// 获取code登录凭证,这里也是不用页面渲染，所有不需要写成响应式
let code = ''
onLoad(async () => {
  const res = await wx.login()
  code = res.code
})
// 获取用户手机号码（企业中写法，需要用到企业里面的appid，个人没有，我们用下面的模拟手机号码即可）
// 获取用户手机号码的回调，是button里面的  :UniHelper.ButtonOnGetphonenumber这里也是用Unihelper帮忙指定了
const OnGetphonenumber: UniHelper.ButtonOnGetphonenumber = async (event) => {
  // 这两个参数是uniapp响应回来参数中1接口需要携带的那两个
  const encryptedData = event.detail!.encryptedData!
  const iv = event.detail!.iv!
  const res = await postLoginWxMinAPI({ code, encryptedData, iv })
  // console.log(res)
}
// #endif

// 模拟手机号码快捷登录，这里是我们自己输入一个手机号，后端将你手机号保存到数据库，然后返回回来一些数据
const OnGetphonenumberSimple = async () => {
  const res = await postLoginWxMinSimpleAPI('13797194021')
  // console.log(res)
  // 将返回的会员信息保存到pinia的对应的方法里面
  const memberStore = useMemberStore()
  memberStore.setProfile(res.result)
  // 成功提示
  uni.showToast({ icon: 'none', title: '登录成功' })
  // 页面跳转  uni.navigateTo是跳转普通页面 跳转到你设置的taabar页，也就是最下方显示的页面需要用uni.switchTab
  // 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面,所以成功提示会不显示，我们可以用异步，那么提示就能显示了
  setTimeout(() => {
    // uni.switchTab({ url: '/pages/my/my' })
    uni.navigateBack()
  }, 500)
}
</script>

<template>
  <view class="viewport">
    <view class="logo">
      <image
        src="https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/logo_icon.png"
      ></image>
    </view>
    <view class="login">
      <!-- 网页端表单登录 -->
      <!-- #ifdef H5 -->
      <input class="input" type="text" placeholder="请输入用户名/手机号码" />
      <input class="input" type="text" password placeholder="请输入密码" />
      <button class="button phone">登录</button>
      <!-- #endif -->

      <!-- 小程序端授权登录 利用下面的  #ifdef #endif 实现，是uniapp提供的-->
      <!-- #ifdef MP-WEIXIN -->
      <button class="button phone" open-type="getPhoneNumber" @getphonenumber="OnGetphonenumber">
        <text class="icon icon-phone"></text>
        手机号快捷登录
      </button>
      <!-- #endif -->

      <view class="extra">
        <view class="caption">
          <text>其他登录方式</text>
        </view>
        <view class="options">
          <!-- 通用模拟登录 -->
          <button @tap="OnGetphonenumberSimple">
            <text class="icon icon-phone">模拟快捷登录</text>
          </button>
        </view>
      </view>
      <view class="tips">登录/注册即视为你同意《服务条款》和《小兔鲜儿隐私协议》</view>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 20rpx 40rpx;
}

.logo {
  flex: 1;
  text-align: center;
  image {
    width: 220rpx;
    height: 220rpx;
    margin-top: 15vh;
  }
}

.login {
  display: flex;
  flex-direction: column;
  height: 60vh;
  padding: 40rpx 20rpx 20rpx;

  .input {
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    border-radius: 72rpx;
    border: 1px solid #ddd;
    padding-left: 30rpx;
    margin-bottom: 20rpx;
  }

  .button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 80rpx;
    font-size: 28rpx;
    border-radius: 72rpx;
    color: #fff;
    .icon {
      font-size: 40rpx;
      margin-right: 6rpx;
    }
  }

  .phone {
    background-color: #28bb9c;
  }

  .wechat {
    background-color: #06c05f;
  }

  .extra {
    flex: 1;
    padding: 70rpx 70rpx 0;
    .caption {
      width: 440rpx;
      line-height: 1;
      border-top: 1rpx solid #ddd;
      font-size: 26rpx;
      color: #999;
      position: relative;
      text {
        transform: translate(-40%);
        background-color: #fff;
        position: absolute;
        top: -12rpx;
        left: 50%;
      }
    }

    .options {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 70rpx;
      button {
        padding: 0;
        background-color: transparent;
      }
    }

    .icon {
      font-size: 24rpx;
      color: #444;
      display: flex;
      flex-direction: column;
      align-items: center;

      &::before {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 80rpx;
        height: 80rpx;
        margin-bottom: 6rpx;
        font-size: 40rpx;
        border: 1rpx solid #444;
        border-radius: 50%;
      }
    }
    .icon-weixin::before {
      border-color: #06c05f;
      color: #06c05f;
    }
  }
}

.tips {
  position: absolute;
  bottom: 80rpx;
  left: 20rpx;
  right: 20rpx;
  font-size: 22rpx;
  color: #999;
  text-align: center;
}
</style>
