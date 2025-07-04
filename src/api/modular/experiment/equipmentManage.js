/**
 * 设备
 */
import { axios} from '@/utils/request'

/**
 * 设备列表
 *
 */
export function exp_equipment_page(parameter) {
  return axios({
    url: '/exp_equipment/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 设备列表
 *
 */
export function exp_equipment_list(parameter) {
  return axios({
    url: '/exp_equipment/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 新增设备
 *
 */
export function exp_equipment_add(parameter) {
  return axios({
    url: '/exp_equipment/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除设备
 *
 */
export function exp_equipment_delete(parameter) {
  return axios({
    url: '/exp_equipment/delete',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑设备
 *
 */
export function exp_equipment_edit(parameter) {
  return axios({
    url: '/exp_equipment/edit',
    method: 'post',
    data: parameter
  })
}


export function exp_equipment_getScales (parameter) {
  return axios({
    url: '/exp_equipment/getScales',
    method: 'post',
    data: parameter
  })
}

export function exp_equipment_editScales(parameter) {
  return axios({
    url: '/exp_equipment/editScales',
    method: 'post',
    data: parameter
  })
}


export function exp_equipment_getPipetteAttribute(parameter) {
  return axios({
    url: '/exp_equipment/getPipetteAttribute',
    method: 'get',
    params: parameter
  })
}

export function exp_equipment_getArmAttribute(parameter) {
  return axios({
    url: '/exp_equipment/getArmAttribute',
    method: 'get',
    params: parameter
  })
}

export function exp_equipment_getControlMethods(parameter) {
  return axios({
    url: '/exp_equipment/getControlMethods',
    method: 'post',
    params: parameter
  })
}

export function exp_equipment_heartbeat(parameter) {
  return axios({
    url: '/exp_equipment/heartbeat',
    method: 'post',
    params: parameter
  })
}

export function exp_equipment_au(parameter) {
  return axios({
    url: '/exp_equipment/au',
    method: 'post',
    params: parameter
  })
}


export function exp_equipment_refreshTemp(parameter) {
  return axios({
    url: '/exp_equipment/refreshTemp',
    method: 'post',
    params: parameter
  })
}