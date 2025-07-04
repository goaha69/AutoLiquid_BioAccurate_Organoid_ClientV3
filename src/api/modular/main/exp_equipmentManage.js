import { axios } from '@/utils/request'

/**
 * 查询设备管理
 *
 * @author matthew.mak
 */
export function exp_equipmentPage (parameter) {
  return axios({
    url: '/exp_equipment/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 设备管理列表
 *
 * @author matthew.mak
 */
export function exp_equipmentList (parameter) {
  return axios({
    url: '/exp_equipment/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 添加设备管理
 *
 * @author matthew.mak
 */
export function exp_equipmentAdd (parameter) {
  return axios({
    url: '/exp_equipment/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑设备管理
 *
 * @author matthew.mak
 */
export function exp_equipmentEdit (parameter) {
  return axios({
    url: '/exp_equipment/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除设备管理
 *
 * @author matthew.mak
 */
export function exp_equipmentDelete (parameter) {
  return axios({
    url: '/exp_equipment/delete',
    method: 'post',
    data: parameter
  })
}
