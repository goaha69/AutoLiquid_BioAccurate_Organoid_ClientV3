import { axios } from '@/utils/axios'

/**
 * 获取字典类型分页
 */
export function sysDictTypePage(parameter) {
  return axios({
    url: '/sysDictType/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 获取字典类型下拉
 */
export function sysDictTypeDropDown(parameter) {
  return axios({
    url: '/sysDictType/dropDown',
    method: 'get',
    params: parameter
  })
}

/**
 * 添加字典类型
 */
export function sysDictTypeAdd(parameter) {
  return axios({
    url: '/sysDictType/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑字典类型
 */
export function sysDictTypeEdit(parameter) {
  return axios({
    url: '/sysDictType/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除字典类型
 */
export function sysDictTypeDelete(parameter) {
  return axios({
    url: '/sysDictType/delete',
    method: 'post',
    data: parameter
  })
} 