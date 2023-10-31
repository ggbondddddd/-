import { http } from "@/utils/http"
import type { LoginResult } from '@/types/member'
// 定义data的类型，根据文档里面写的
type loginParams = {
  code: string,
  encryptedData: string,
  iv: string,
}

// 小程序登录 data是请求需要携带的参数，这个接口个人用户获取不到，只有到公司才能获取到
export const postLoginWxMinAPI = (data: loginParams) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/login/wxMin',
    data
  })
}

// 小程序登录， 个人开发的时候使用，由于上面接口只能企业小程序使用，我们这里模拟一个类似的接口
export const postLoginWxMinSimpleAPI = (phoneNumber: string) => {
  return http<LoginResult>({
    method: 'POST',
    url: '/login/wxMin/simple',
    data: {
      phoneNumber
    }
  })
}
