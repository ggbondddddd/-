// 通用的用户信息type

type BaseProfile = {
  /** 用户ID */
  id: number
  /** 头像  */
  avatar: string
  /** 账户名  */
  account: string
  /** 昵称 */
  nickname?: string
}
// 通用的用户信息interface
interface BaseProfile2 {
  /** 用户ID */
  id: number
  /** 头像  */
  avatar: string
  /** 账户名  */
  account: string
  /** 昵称 */
  nickname?: string
}


/** 小程序登录 登录用户信息 BaseProfile& 的意思就是让上面那个类型添加到下面这个类型里面去，&就相当于interface里面的extends继承 */
export type LoginResult = BaseProfile & {
  /** 手机号 */
  mobile: string
  /** 登录凭证 */
  token: string
}

/** 个人信息 用户详情信息 */
export type ProfileDetail = BaseProfile2 & {
  /** 性别 */
  gender?: Gender
  /** 生日 */
  birthday?: string
  /** 省市区 */
  fullLocation?: string
  /** 职业 */
  profession?: string
}
/** 性别 */
export type Gender = '女' | '男'

// 个人信息 修改请求体参数;ts泛型工具方法Pick可以选取类型中部分相同的类型,如下就选取了四个属性放到下面这个类型里
export type ProfileParams = Pick<ProfileDetail, 'nickname' | 'gender' | 'birthday' | 'profession'> & {
  // 省份编码
  provinceCode?: string,
  // 城市编码
  cityCode?: string,
  // 区县编码
  countyCode?: string
}
