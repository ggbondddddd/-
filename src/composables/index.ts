import type { XtxGuessInstance } from "@/types/component"
import { ref } from "vue"

// 这是封装的猜你喜欢组合式函数，里面具体式获取猜你喜欢实例，然后调用滚动触底函数的回调
export const useGuessList = () => {
  // 获取猜你喜欢组件实例
  const guessRef = ref<XtxGuessInstance>()
  // 滚动触底函数的回调
  const onScrolltolower = () => {
    guessRef.value?.getMore()
  }
  // 上面的数据变为了局部数据，需要return才能给外部使用
  return {
    guessRef,
    onScrolltolower
  }
}
