<!-- 个人信息页面 -->
<script setup lang="ts">
import { getMemeberProfileAPI, putMemberProfileAPI } from '@/services/profile'
import { useMemberStore } from '@/stores'
import { onLoad } from '@dcloudio/uni-app'
import type { ProfileDetail, Gender } from '@/types/member'
import { ref } from 'vue'

// 获取屏幕边界到安全区域距离 这里很奇怪，因为别的地方就不会报这个错
const { safeAreaInsets } = uni.getSystemInfoSync()

// 获取个人信息以及修改个人信息  这里必须赋初始值,因为下面v-model绑定了profile的属性,
// 貌似是v-model需要和某个属性双向绑定必须读取到这个值,不然就无法双向绑定,而v-bind就不需要
const profile = ref<ProfileDetail>({} as ProfileDetail)
// console.log(profile.value?.nickname)
const getMemeberProfileData = async () => {
  const res = await getMemeberProfileAPI()
  // console.log(res)
  profile.value = res.result
  // uni.showToast({ title: '保存成功', icon: 'success' })
}

//页面加载
onLoad(() => {
  getMemeberProfileData()
})

//pinia仓库
const memberStore = useMemberStore()

// 修改头像
const onAvatarChange = () => {
  // #ifdef MP-WEIXIN
  // uniapp看官方文档
  uni.chooseMedia({
    // 选择可以上传文件个数
    count: 1,
    // 文件类型 这里只能是图片
    mediaType: ['image'],
    success: (res) => {
      // 解构出我们需要的生成的图片临时路径,uni.chooseMedia可以帮助我们将本地图片生成一个临时路径,
      // 而下面的uni.uploadFile可以将本地资源通过这个生成的临时路径上传到指定服务器.
      const { tempFilePath } = res.tempFiles[0]
      // 文件上传
      uni.uploadFile({
        // 默认发送一个post请求
        url: '/member/profile/avatar', //后端接口地址
        name: 'file', // 这个files是接口参数,后端指定的头像文件名,开发者可以通过这个file获取到上传文件的内容
        // 要上传资源的路径
        filePath: tempFilePath,
        success: (res) => {
          if (res.statusCode === 200) {
            // 获取到后端返回的图片地址
            const avatar = JSON.parse(res.data).result.avatar
            // 更新个人信息页的头像
            profile.value!.avatar = avatar
            // 将仓库里面的头像信息页更新,因为我的页面里面的头像就是通过pinia仓库获取到的
            memberStore.profile!.avatar = avatar
            uni.showToast({ icon: 'success', title: '头像更新成功' })
          } else {
            uni.showToast({ icon: 'error', title: '出现错误' })
          }
        },
      })
    },
  })
  // #endif
  // #ifdef H5|| APP-PLUS
  uni.chooseImage({
    count: 1,
    success: (res) => {
      const tempFilePaths = res.tempFilePaths[0]
      uni.uploadFile({
        url: '/member/profile/avatar',
        name: 'file',

        filePath: tempFilePaths,
        success: (res) => {
          if (res.statusCode === 200) {
            const avatar = JSON.parse(res.data).result.avatar
            profile.value!.avatar = avatar
            memberStore.profile!.avatar = avatar
            uni.showToast({ icon: 'success', title: '头像更新成功' })
          } else {
            uni.showToast({ icon: 'error', title: '出现错误' })
          }
        },
      })
    },
  })
  // #endif
}

// 修改性别
const onGenderChange: UniHelper.RadioGroupOnChange = (event) => {
  // 这里需要断言gender为Gender的原因是gender初始创建的时候给定的类型就是Gender这个类型,
  profile.value.gender = event.detail.value as Gender
}

// 修改生日
const onBirthdayChange: UniHelper.DatePickerOnChange = (event) => {
  profile.value.birthday = event.detail.value
}

// 修改城市
let fullLocationCode: [string | undefined, string | undefined, string | undefined] = ['', '', ''] //这是元组写法 具体城市的邮政编码,提交给后端用的是城市编码
const onFullLocationChange: UniHelper.RegionPickerOnChange = (event) => {
  // 返回回来的数据是数组里面用逗号隔开显示省市区
  // 首先修改前端界面,将数组转换成字符串显示
  profile.value.fullLocation = event.detail.value.join(' ')
  fullLocationCode = event.detail.code!
}

// 修改职业
const onProfessionChange: UniHelper.InputOnInput = (event) => {
  profile.value.profession = event.target!.value
}

// 点击保存提交修改后的个人信息到后端
const onSubmit = async () => {
  // 修改信息的接口
  const res = await putMemberProfileAPI({
    // 这里可以用解构简写,但是代码没那么容易看
    nickname: profile.value?.nickname,
    gender: profile.value.gender,
    birthday: profile.value.birthday,
    provinceCode: fullLocationCode[0],
    cityCode: fullLocationCode[1],
    countyCode: fullLocationCode[2],
    profession: profile.value.profession,
  })
  // 更新store里面的昵称
  memberStore.profile!.nickname = res.result.nickname

  uni.showToast({ icon: 'success', title: '修改信息成功' })
  // 返回上一页 如果默认打开的是我的信息就没有上一页,这里要注意
  setTimeout(() => {
    uni.navigateBack()
  }, 0)
}
</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator open-type="navigateBack" class="back icon-left" hover-class="none"></navigator>
      <view class="title">个人信息</view>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <view class="avatar-content" @tap="onAvatarChange">
        <image class="image" :src="profile?.avatar" mode="aspectFill" />
        <text class="text">点击修改头像</text>
      </view>
    </view>
    <!-- 表单 -->
    <view class="form">
      <!-- 表单内容 -->
      <view class="form-content">
        <view class="form-item">
          <text class="label">账号</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">昵称</text>
          <input class="input" type="text" placeholder="请填写昵称" v-model="profile!.nickname" />
        </view>
        <view class="form-item">
          <text class="label">性别</text>
          <radio-group @change="onGenderChange">
            <label class="radio">
              <radio value="男" color="#27ba9b" :checked="profile?.gender === '男'" />
              男
            </label>
            <label class="radio">
              <radio value="女" color="#27ba9b" :checked="profile?.gender === '女'" />
              女
            </label>
          </radio-group>
        </view>
        <view class="form-item">
          <text class="label">生日</text>
          <picker
            class="picker"
            mode="date"
            start="1900-01-01"
            :end="new Date()"
            :value="profile?.birthday"
            @change="onBirthdayChange"
          >
            <view v-if="profile?.birthday">{{ profile?.birthday }}</view>
            <view class="placeholder" v-else>请选择日期</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">城市</text>
          <picker
            class="picker"
            mode="region"
            :value="profile?.fullLocation?.split(' ')"
            @change="onFullLocationChange"
          >
            <view v-if="profile?.fullLocation">{{ profile?.fullLocation }}</view>
            <view class="placeholder" v-else>请选择城市</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">职业</text>
          <input
            class="input"
            type="text"
            placeholder="请填写职业"
            v-model="profile!.profession"
            @input="onProfessionChange"
          />
        </view>
      </view>
      <!-- 提交按钮 -->
      <button class="form-button" @tap="onSubmit">保 存</button>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: auto 420rpx;
  background-repeat: no-repeat;
}

// 导航栏
.navbar {
  position: relative;

  .title {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .back {
    position: absolute;
    height: 40px;
    width: 40px;
    left: 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 头像
.avatar {
  text-align: center;
  width: 100%;
  height: 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .text {
    display: block;
    padding-top: 20rpx;
    line-height: 1;
    font-size: 26rpx;
    color: #fff;
  }
}

// 表单
.form {
  background-color: #f4f4f4;

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  &-item {
    display: flex;
    height: 96rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    &:last-child {
      border: none;
    }

    .label {
      width: 180rpx;
      color: #333;
    }

    .account {
      color: #666;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .radio {
      margin-right: 20rpx;
    }

    .picker {
      flex: 1;
    }
    .placeholder {
      color: #808080;
    }
  }

  &-button {
    height: 80rpx;
    text-align: center;
    line-height: 80rpx;
    margin: 30rpx 20rpx;
    color: #fff;
    border-radius: 80rpx;
    font-size: 30rpx;
    background-color: #27ba9b;
  }
}
</style>
