import type { BannerItem, CategoryItem, HotItem, GuessItem } from '@/types/home'
import type { PageParams, PageResult } from '@/types/global.d.ts'
import { http } from '@/utils/http'

// 首页广告区域轮播图   distributionSite=1为首页，2为分类商品页
export const getHomeBannerAPI = (distributionSite = 1) => {
  return http<BannerItem[]>({
    method: 'GET',
    url: '/home/banner',
    data: {
      distributionSite,
    },
  })
}
// 首页前台分类，就是轮播图下面的是个小图标
export const getHomeCategoryAPI = () => {
  return http<CategoryItem[]>({
    method: 'GET',
    url: '/home/category/mutli',
  })
}
// 首页热门推荐
export const getHomeHotAPI = () => {
  return http<HotItem[]>({
    method: 'GET',
    url: '/home/hot/mutli'
  })
}

// 猜你喜欢
export const getHomeGoodsGuessLikeAPI = (data?: PageParams) => {
  // 这里是一个难点PageResult里面还有一个泛型
  return http<PageResult<GuessItem>>({
    method: 'GET',
    url: '/home/goods/guessLike',
    // 小程序中不管get还是post请求，请求参数统一都是data
    data
  })
}
