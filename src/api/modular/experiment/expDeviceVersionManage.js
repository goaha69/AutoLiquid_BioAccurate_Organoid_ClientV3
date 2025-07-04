import { axios } from '@/utils/request'

/**
 * 获取地点列表
 *
 * @author matthew.mak
 */
export function exp_deviceversion_locationlist () {
  return axios({
    url: '/exp_deviceversion/locationlist',
    method: 'get',
    data: []
  })
}
/**
 * 获取地点
 *
 * @author matthew.mak
 */
export function exp_deviceversion_addlocation (parameter) {
  return axios({
    url: '/exp_deviceversion/addlocation',
    method: 'post',
    data: parameter
  })
}
/**
 * 获取地点列表
 *
 * @author matthew.mak
 */
export function exp_deviceversion_addversion (parameter) {
  return axios({
    url: '/exp_deviceversion/addversion',
    method: 'post',
    data: parameter
  })
}
/**
 * 根据地点id获取信息
 *
 * @author matthew.mak
 */
export function exp_deviceversion_getversionlist (parameter) {
  return axios({
    url: '/exp_deviceversion/getversionlist',
    method: 'post',
    data: parameter
  })
}

export function exp_deviceversion_getLastVersion (parameter) {
  return axios({
    url: '/exp_deviceversion/getLastVersion',
    method: 'post',
    data: parameter
  })
}