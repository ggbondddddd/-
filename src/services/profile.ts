import type { ProfileDetail, ProfileParams } from "@/types/member"
import { http } from "@/utils/http"

// 获取个人信息
export const getMemeberProfileAPI = (token?: string) => {
  return http<ProfileDetail>({
    method: 'GET',
    url: '/member/profile',
    // 此处的请求头需要携带的token参数不需要写，因为在http的请求拦截器里面已经帮你写好了，当pinia仓库里面的token存在了，就会自动获取然后添加到响应头里面
    // 如果想要自己写，就如下，然后需要传参，然后在http.ts里面将配置的请求头删掉即可
    // header: { 'Authorization': token }

  })
}

// 修改个人信息   data是参数,
export const putMemberProfileAPI = (data: ProfileParams) => {
  return http<ProfileDetail>({
    method: 'PUT',
    url: '/member/profile',
    data
  })
}
