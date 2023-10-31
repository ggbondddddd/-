<!-- 这个模块的业务就是，1.当你是从修改进入，发请求显示你点击的那个修改对应的信息，如果你是点击新增地址进入就不需要发请求
不显示任何信息，信息都是你自己填入的，然后数据都绑定到标签上，当点击保存将所有数据发请求保存在后端
  2.进行表单验证 -->
<script setup lang="ts">
import {
  getMemberAddressByIdAPI,
  postMemberAddressAPI,
  putMemberAddressByIdAPI,
} from '@/services/address'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 表单数据
const form = ref({
  receiver: '', // 收货人
  contact: '', // 联系方式
  fullLocation: '', // 省市区(前端展示)
  provinceCode: '', // 省份编码(后端参数)
  cityCode: '', // 城市编码(后端参数)
  countyCode: '', // 区/县编码(后端参数)
  address: '', // 详细地址
  isDefault: 0, // 默认地址，1为是，0为否
})

// 获取页面参数  这里会接收到address地址跳转地址里面携带的参数
const query = defineProps<{ id?: string }>()

// 获取收货地址详细数据，当点击修改进入，应该将你需要修改的信息展示出来
const getMemberAddressByIdData = async () => {
  if (query.id) {
    const res = await getMemberAddressByIdAPI(query.id)
    // 将数据合并到表单中
    Object.assign(form.value, res.result)
  }
}
// 页面加载
onLoad(() => {
  getMemberAddressByIdData()
})

// 动态设置标题   uniapp里面这个方法可以动态设置当前页面的标题,因为修改地址和新建地址跳转的是同一个页面
uni.setNavigationBarTitle({ title: query.id ? '修改地址' : '新建地址' })

// #ifdef MP-WEIXIN
// 收集所在地区处理函数   这是picker的@change事件的回调
const onRegionChange: UniHelper.RegionPickerOnChange = (event) => {
  // event.detail.value这是一个数组，每个元素分别是省市区
  // 省市区用于前端展示
  form.value.fullLocation = event.detail.value.join(' ')
  // 后端需要的是省市区的邮政编码  用解构快速获取到
  const [provinceCode, cityCode, countyCode] = event.detail.code!
  // console.log(event.detail.code)

  // 利用这个方法直接将后面三个参数覆盖form里面对应的属性
  Object.assign(form.value, { provinceCode, cityCode, countyCode })
}
// #endif

// #ifdef H5 || APP-PLUS
const onCityChange: UniHelper.UniDataPickerOnChange = (event) => {
  // 后端需要的是省市区的邮政编码  用解构快速获取到
  const [provinceCode, cityCode, countyCode] = event.detail.value.map((v) => v.value)
  // 合并数据用于表单的提交
  Object.assign(form.value, { provinceCode, cityCode, countyCode })
}
// #endif

// 收集是否默认收货地址
const onSwitchChange: UniHelper.SwitchOnChange = (event) => {
  // 下面的意思是如果后面是true就把1给form的isdefault，反之给0
  form.value.isDefault = event.detail.value ? 1 : 0
}

// 定义校验规则
const rules: UniHelper.UniFormsRules = {
  receiver: {
    rules: [{ required: true, errorMessage: '请输入收货人姓名' }],
  },
  contact: {
    // 上面的规则是规定你必须填写数据，下面的规则是你填写数据的格式
    rules: [
      { required: true, errorMessage: '请输入联系方式' },
      { pattern: /^1[3-9]\d{9,}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  countyCode: {
    rules: [{ required: true, errorMessage: '请选择所在地区' }],
  },
  address: {
    rules: [{ required: true, errorMessage: '请选择详细地址' }],
  },
}

// 表单组件实例   类型是UniHelper.UniFormsItemInstance
const formRef = ref<UniHelper.UniFormsInstance>()

// 点击保存提交上面收集到的所有数据给后端接口，这个数据保存后，你从新获取地址获取到的就是新的数据了
// 这个回调我放到节流里面去了，不然你快速点击多次会调用多次接口，浪费性能
const onSubmit = async () => {
  try {
    // 等校验没有问题再区向后端发送请求保存修改或新建
    await formRef.value?.validate!()
    // 如果没有id调用修改地址的api，很好理解，数据库里面修改一个地址，和新增一个地址操作肯定是不一样的
    if (query.id) {
      await putMemberAddressByIdAPI(query.id, form.value)
    } else {
      // 如果没有id，就调用保存全新地址的api
      // 新建地址请求 数据在这里用不到，所有就不输出出来了
      await postMemberAddressAPI(form.value)
    }
    // 成功了就提示
    uni.showToast({ icon: 'success', title: query.id ? '修改成功' : '请求成功' })
    setTimeout(() => {
      uni.navigateBack()
    }, 500)
  } catch (error) {
    uni.showToast({ icon: 'error', title: '请填写完整信息' })
  }
}
let timer: any = null
const jieliu = () => {
  if (!timer) {
    timer = setInterval(() => {
      onSubmit()
      clearInterval(timer)
      timer = null
    }, 1000)
  }
}
</script>

<template>
  <view class="content">
    <!-- 利用了uni-forms里面的表单验证，需要把要验证的标签写成uni-forms-item -->
    <uni-forms :rules="rules" :model="form" ref="formRef">
      <!-- 表单内容 -->
      <uni-forms-item name="receiver" class="form-item">
        <text class="label">收货人</text>
        <input class="input" placeholder="请填写收货人姓名" v-model="form.receiver" />
      </uni-forms-item>
      <uni-forms-item name="contact" class="form-item">
        <text class="label">手机号码</text>
        <input class="input" placeholder="请填写收货人手机号码" v-model="form.contact" />
      </uni-forms-item>
      <uni-forms-item class="form-item" name="countyCode">
        <text class="label">所在地区</text>
        <!-- #ifdef MP-WEIXIN -->
        <!-- picker里面的value是mode=地区模式下为一个数组，里面字符串分别对应省市区 -->
        <picker
          @change="onRegionChange"
          class="picker"
          mode="region"
          :value="form.fullLocation.split(' ')"
        >
          <view v-if="form.fullLocation">{{ form.fullLocation }}</view>
          <view v-else class="placeholder">请选择省/市/区(县)</view>
        </picker>
        <!-- #endif -->
        <!-- #ifdef H5 || APP-PLUS -->
        <uni-data-picker
          placeholder="请选择地址"
          popup-title="请选择城市"
          collection="opendb-city-china"
          field="code as value, name as text"
          orderby="value asc"
          :step-searh="true"
          self-field="code"
          parent-field="parent_code"
          :clear-icon="false"
          @change="onCityChange"
          v-model="form.countyCode"
        >
        </uni-data-picker>
        <!-- #endif -->
      </uni-forms-item>
      <uni-forms-item class="form-item" name="address">
        <text class="label">详细地址</text>
        <input class="input" placeholder="街道、楼牌号等信息" v-model="form.address" />
      </uni-forms-item>
      <view class="form-item">
        <label class="label">设为默认地址</label>
        <switch
          @change="onSwitchChange"
          class="switch"
          color="#27ba9b"
          :checked="form.isDefault === 1"
        />
      </view>
    </uni-forms>
  </view>
  <!-- 提交按钮 -->
  <button class="button" @tap="jieliu">保存并使用</button>
</template>

<style lang="scss">
/* #ifdef H5 || APP-PLUS */
// 修改这个<uni-data-picker>内部的样式问题,必须利用深度选择器,因为h5端默认scoped
:deep(.selected-area) {
  height: auto;
  flex: 0 1 auto;
}
/* #endif */
page {
  background-color: #f4f4f4;
}

.content {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .form-item,
  .uni-forms-item {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    padding: 25rpx 10rpx 40rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;
    position: relative;
    margin-bottom: 0;

    // 调整 uni-forms 样式
    .uni-forms-item__content {
      display: flex;
    }

    .uni-forms-item__error {
      margin-left: 200rpx;
    }

    &:last-child {
      border: none;
    }

    .label {
      width: 200rpx;
      color: #333;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .switch {
      position: absolute;
      right: -20rpx;
      transform: scale(0.8);
    }

    .picker {
      flex: 1;
    }

    .placeholder {
      color: #808080;
    }
  }
}

.button {
  height: 80rpx;
  margin: 30rpx 20rpx;
  color: #fff;
  border-radius: 80rpx;
  font-size: 30rpx;
  background-color: #27ba9b;
}
</style>
