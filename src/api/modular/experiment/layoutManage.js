import { axios} from '@/utils/request'

/**
 * 查询布局管理
 *
 * @author matthew.mak
 */
export function exp_layout_page (parameter) {
  return axios({
    url: '/exp_layout/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 查询布局管理
 *
 * @author matthew.mak
 */
export function exp_layout_list (parameter) {
  return axios({
    url: '/exp_layout/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 添加布局管理
 *
 * @author matthew.mak
 */
export function exp_layout_add (parameter) {
  return axios({
    url: '/exp_layout/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑布局管理
 *
 * @author matthew.mak
 */
export function exp_layout_edit (parameter) {
  return axios({
    url: '/exp_layout/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除布局管理
 *
 * @author matthew.mak
 */
export function exp_layout_delete (parameter) {
  return axios({
    url: '/exp_layout/delete',
    method: 'post',
    data: parameter
  })
}

export function exp_layout_detail (parameter) {
  return axios({
    url: '/exp_layout/detail',
    method: 'post',
    data: parameter
  })
}


export function exp_layout_getShippingSpaces (parameter) {
  return axios({
    url: '/exp_layout/getShippingSpaces',
    method: 'post',
    data: parameter
  })
}

export function exp_layout_importShippingSpaces (parameter) {
  return axios({
    url: '/exp_layout/importShippingSpaces',
    method: 'post',
    data: parameter
  })
}


export function exp_layout_addShippingSpace (parameter) {
  return axios({
    url: '/exp_layout/addShippingSpace',
    method: 'post',
    data: parameter
  })
}

export function exp_layout_updateShippingSpace (parameter) {
  return axios({
    url: '/exp_layout/updateShippingSpace',
    method: 'post',
    data: parameter
  })
}

export function exp_layout_deleteConsumable (parameter) {
  return axios({
    url: '/exp_layout/deleteConsumable',
    method: 'post',
    data: parameter
  })
}