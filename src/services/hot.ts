import type { PageParams } from "@/types/global"
import type { HotResult } from "@/types/hot"
import { http } from "@/utils/http"

// 这个类型是由type PageParams与{subType:string}组成的类型
type HotParams = PageParams & { subType?: string }

//通用热门推荐    这里是一个动态地址，有四种不同的请求回来的参数 url：请求地址 data：请求参数
export const getHotRecommendAPI = (url: string, data?: HotParams) => {
  // 这个HotResult类型很复杂，嵌套了好多层泛型，要好好看看理解理解
  return http<HotResult>({
    method: 'GET',
    url,
    data,
  })
}
