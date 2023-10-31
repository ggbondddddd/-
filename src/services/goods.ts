import type { GoodsResult } from "@/types/good"
import { http } from "@/utils/http"

// 商品详情
export const getGoodsByIdAPI = (id: string) => {
  return http<GoodsResult>({
    method: 'GET',
    url: '/goods',
    data: {
      id
    }
  })
}
