// Volar官方提供的插件Vue Language Tools：https://github.com/vuejs/language-tools
import XtxSwiper from './XtxSwiper.vue'
import XtxGuess from '@/components/XtxGuess.vue'
declare module 'vue' {
  // 给全局组件指定类型为自己
  export interface GlobalComponents {
    XtxSwiper: typeof XtxSwiper
    XtxGuess: typeof XtxGuess
  }
}

// 组件实例类型  InstanceType可以获取组件实例的类型
export type XtxGuessInstance = InstanceType<typeof XtxGuess>
