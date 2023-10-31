import { http } from "@/utils/http"

// 获取微信支付参数  这个我们普通开发者用不了，所以用下面那个mock接口模拟支付
export const getPayWxPayMiniPayAPI = (data: { orderId: string }) => {
  // WechatMiniprogram.RequestPaymentOption这个类型是原生微信小程序提供的
  return http<WechatMiniprogram.RequestPaymentOption>({
    method: 'GET',
    url: '/pay/wxPay/miniPay',
    data
  })
}

// 模拟支付，这是我可以用的支付接口
export const getPayMockAPI = (data: { orderId: string }) => {
  // WechatMiniprogram.RequestPaymentOption这个类型是原生微信小程序提供的
  return http<WechatMiniprogram.RequestPaymentOption>({
    method: 'GET',
    url: '/pay/mock',
    data
  })
}
