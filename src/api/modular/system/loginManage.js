/**
 * 系统应用
 *
 * @author matthew.mak
 * @date 2020/5/26 19:06
 */
import { axios } from '@/utils/request'

/**
 * 登录
 *
 * @author matthew.mak
 * @date 2020/5/26 19:06
 */
export function login (parameter) {
  return axios({
    url: '/login',
    method: 'post',
    data: parameter
  })
}

/**
 * 模拟租户登录
 *
 * @author matthew.mak
 * @date 2022/4/13 22:06
 */
export function simulationTenantLogin(parameter){
	return axios({
	  url: '/simulationTenantLogin',
	  method: 'post',
	  data: parameter
	})
}

/**
 * 登出
 *
 * @author matthew.mak
 * @date 2020/5/26 19:07
 */
export function logout (parameter) {
  return axios({
    url: '/logout',
    method: 'get',
    params: parameter
  })
}

/**
 * 获取登录用户信息
 *
 * @author matthew.mak
 * @date 2020/5/26 19:08
 */
export function getLoginUser (parameter) {
  return axios({
    url: '/getLoginUser',
    method: 'get',
    params: parameter
  })
}

/**
 * 获取短信验证码
 *
 * @author matthew.mak
 * @date 2020/5/26 19:29
 */
export function getSmsCaptcha (parameter) {
  return axios({
    url: '/getSmsCaptcha',
    method: 'get',
    params: parameter
  })
}

/**
 * 获取验证码开关
 *
 * @author matthew.mak
 * @date 2021/1/22 00:00
 */
export function getCaptchaOpen (parameter) {
  return axios({
    url: '/getCaptchaOpen',
    method: 'get',
    params: parameter
  })
}

/**
 * 获取验证图片 以及token
 *
 * @author matthew.mak
 * @date 2021/1/22 00:00
 */
export function reqGet(data) {
  return axios({
    url: '/captcha/get',
    method: 'post',
    data
  })
}

/**
 * 滑动或者点选验证
 *
 * @author matthew.mak
 * @date 2021/1/22 00:00
 */
export function reqCheck(data) {
  return axios({
    url: '/captcha/check',
    method: 'post',
    data
  })
}
