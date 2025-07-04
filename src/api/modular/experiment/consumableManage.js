import { axios} from '@/utils/request'

/**
 * 查询耗材管理
 *
 * @author matthew.mak
 */
export function exp_consumable_page (parameter) {
  return axios({
    url: '/exp_consumable/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 查询耗材管理
 *
 * @author matthew.mak
 */
export function exp_consumable_list (parameter) {
  return axios({
    url: '/exp_consumable/list',
    method: 'get',
    params: parameter
  })
}


/**
 * 添加耗材管理
 *
 * @author matthew.mak
 */
export function exp_consumable_add (parameter) {
  return axios({
    url: '/exp_consumable/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑耗材管理
 *
 * @author matthew.mak
 */
export function exp_consumable_edit (parameter) {
  return axios({
    url: '/exp_consumable/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除耗材管理
 *
 * @author matthew.mak
 */
export function exp_consumable_delete (parameter) {
  return axios({
    url: '/exp_consumable/delete',
    method: 'post',
    data: parameter
  })
}

/**
 * 获取机械臂相关参数
 *
 * @author matthew.mak
 */
export function exp_consumable_getArmAttribute (parameter) {
  return axios({
    url: '/exp_consumable/getArmAttribute',
    method: 'get',
    params: parameter
  })
}
/**
 * 根据布局ID获取所有耗材标签
 *
 * @author matthew.mak
 */
export function exp_consumable_getConsumableTags (parameter) {
  return axios({
    url: '/exp_consumable/getConsumableTags',
    method: 'get',
    params: parameter
  })
}

export function exp_consumable_getParams (parameter) {
  return axios({
    url: '/exp_consumable/getParams',
    method: 'post',
    data: parameter
  })
}
/*
根据耗材tagId获取耗材参数
*/
export function exp_getConsumable_Param (parameter) {
  return axios({
    url: '/exp_consumable/getConsumableParam',
    method: 'get',
    params: parameter
  })
}