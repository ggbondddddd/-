import type { AddressItem, AddressParams } from "@/types/address"
import { http } from "@/utils/http"

// 添加收获地址  data是请求参数，也需要指定类型  响应头也是默认配置在了请求拦截器里面
export const postMemberAddressAPI = (data: AddressParams) => {
  // 这里没有给http指定类型的原因我觉得是这次响应回来的数据太简单了
  return http({
    method: 'POST',
    url: '/member/address',
    data
  })
}

// 获取收货地址列表
export const getMemberAddressAPI = () => {
  return http<AddressItem[]>({
    method: 'GET',
    url: '/member/address',
  })
}

// 获取收获地址详细 修改地址和新建地址跳转的是同一个页面，id存在就说明调用修改地址接口，获取到你要修改的地址的数据在页面显示
export const getMemberAddressByIdAPI = (id: string) => {
  return http<AddressItem>({
    method: 'GET',
    url: `/member/address/${id}`
  })
}

// 修改收货地址点击保存的接口，和有新建的收获地址点击保存接口不一样，很好理解，数据库里面修改和新增是两种不同的操作
export const putMemberAddressByIdAPI = (id: string, data: AddressParams) => {
  return http({
    method: 'PUT',
    url: `/member/address/${id}`,
    data,
  })
}

// 删除收货地址 只需要把你删除地址id传入，数据库就会删除指定的地址信息
export const deleteMemberAddressByIdAPI = (id: string) => {
  return http({
    method: 'DELETE',
    url: `/member/address/${id}`
  })
}
