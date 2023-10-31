import { useMemberStore } from '@/stores'

// 请求基地址
const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

// 小程序端一般没有跨域,而且一般跨域后端会给你配置好,且小程序不支持axiso,配置起来很复杂
// 添加请求拦截器
const heepIntercepter = {
  // 拦截触发前 options是自取名,可以拿到你在名为request的拦截器里面的写的参数
  invoke(options: UniApp.RequestOptions) {
    // 1。非http开头需要拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    //  2.请求超时，默认60s ,毫秒为单位
    options.timeout = 10000
    // 3.添加小程序端请求头表示
    options.header = {
      // 如果有请求头就也放在这,不写这一步扩展那么如果还有其他请求头会被覆盖,因为这是对象
      ...options.header,
      // 小兔鲜服务器要求,添加请求头,告诉后端这是小程序端
      'source-client': 'miniapp',
    }
    // 4.添加token请求头标识
    // 这里的useMemberStore这个pinia仓库是在pages.json里面的easycom配置的当你使用了某个组件自动导入,很方便,不需要自己引入组件
    const memberStore = useMemberStore()
    // 此处这个?.是可选链运算符   只有当a存在,同时memberStore.profile具有token属性的时候,才会把值赋给token,否则就会将undefined赋值给token.
    // 重要的是,不管a存在与否,这么做都不会报错
    // 此处是让所有的请求的请求头上都携带有token，主要只是个别接口需要，这里只是顺带给全部接口加上了token，这样就不需要额外再到请求个人信息接口添加token参数了
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
    // console.log(options)
  },
}
uni.addInterceptor('request', heepIntercepter)
uni.addInterceptor('uploadFile', heepIntercepter)

// 定义一个ts里面的接口
interface Date<T> {
  code: string
  msg: string
  result: T
}

// 封装请求函数,uniapp里面响应拦截器不是很完善,借鉴axios用promise封装,这里的sucess，fail只有在网络失败等常规问题才会检测到假如你需要请求
// 一个携带token的参数，你携带的参数没用配置token，但是有响应，依然会在success里面显示，显示token响应失败，比如你url是一个错的地址或者空，
// 都有响应，所有也都会在success里面显示，即使程序已经报错了，而不是在fail里面显示，所以需要
// 用promise封装，完善这个响应结果的不同情况，而在axios里面只有响应状态码为2开头才会调用resolve函数，业务更准确
export const http = <T>(options: UniApp.RequestOptions) => {
  // 1.返回promise对象
  return new Promise<Date<T>>((reslove, reject) => {
    uni.request({
      ...options,
      // 2.请求成功
      success(res) {
        // 类型断言
        // console.log(res.data);
        // 状态码 2xx，参考 axios 的设计
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          reslove(res.data as Date<T>)
        } else if (res.statusCode == 401) {
          // 401错误，清理用户信息，跳转到登录页
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 其他错误，根据后端错误信息轻提示
          uni.showToast({
            title: (res.data as Date<T>).msg || '请求错误',
            icon: 'none',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          title: '网络错误，换个网络试试',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}
