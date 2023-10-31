import type { CartItem } from "@/types/cart"
import { http } from "@/utils/http"

// 加入购物车  data是请求参数
export const postMemberCartAPI = (data: { skuId: string, count: number }) => {
  return http({
    method: 'POST',
    url: '/member/cart',
    data
  })
}

// 获取购物车列表
export const getgetMemberCartAPI = () => {
  return http<CartItem[]>({
    method: 'GET',
    url: '/member/cart',
  })
}

// 删除或清空购物车商品
export const deleteMemberCartAPI = (data: { ids: string[] }) => {
  return http({
    method: 'DELETE',
    url: '/member/cart',
    data
  })
}

// 修改购物车商品数量 skuId是url需要携带的参数，然后data也需要携带两个可选参数
export const putMemberCartBySkuIdAPI = (skuId: string, data: { selected?: boolean, count?: number }) => {
  return http({
    method: 'PUT',
    url: `/member/cart/${skuId}`,
    data
  })
}

// 修改购物车全选或取消全选
export const putMemberCartSelectAll = (data: { selected: boolean }) => {
  return http({
    method: 'PUT',
    url: '/member/cart/selected',
    data
  })
}
