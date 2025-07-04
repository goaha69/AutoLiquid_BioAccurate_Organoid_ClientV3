import { axios} from '@/utils/request'

/**
 * 查询试剂管理
 *
 * @author matthew.mak
 */
export function exp_liquid_page (parameter) {
  return axios({
    url: '/exp_liquid/page',
    method: 'get',
    params: parameter
  })
}
/**
 * 试剂管理
 *
 * @author matthew.mak
 */
export function exp_liquid_list (parameter) {
  return axios({
    url: '/exp_liquid/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 添加试剂管理
 *
 * @author matthew.mak
 */
export function exp_liquid_add (parameter) {
  return axios({
    url: '/exp_liquid/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑试剂管理
 *
 * @author matthew.mak
 */
export function exp_liquid_edit (parameter) {
  return axios({
    url: '/exp_liquid/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除试剂管理
 *
 * @author matthew.mak
 */
export function exp_liquid_delete (parameter) {
  return axios({
    url: '/exp_liquid/delete',
    method: 'post',
    data: parameter
  })
}

