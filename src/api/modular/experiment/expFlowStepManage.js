import { axios } from '@/utils/request'

/**
 * 查询实验步骤管理
 *
 * @author matthew.mak
 */
export function exp_flow_step_page (parameter) {
  return axios({
    url: '/exp_flow_step/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 实验步骤管理列表
 *
 * @author matthew.mak
 */
export function exp_flow_step_list (parameter) {
  console.log('==================')
  return axios({
    url: '/exp_flow_step/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 用于新增，编辑时选择上级节点
 *
 * @author matthew.mak
 * @date 2020/4/23 12:22
 */
export function exp_flow_step_tree (parameter) {
  return axios({
    url: '/exp_flow_step/tree',
    method: 'get',
    params: parameter
  })
}

/**
 * 添加实验步骤管理
 *
 * @author matthew.mak
 */
export function exp_flow_step_add (parameter) {
  return axios({
    url: '/exp_flow_step/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑实验步骤管理
 *
 * @author matthew.mak
 */
export function exp_flow_step_edit (parameter) {
  return axios({
    url: '/exp_flow_step/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除实验步骤管理
 *
 * @author matthew.mak
 */
export function exp_flow_step_delete (parameter) {
  return axios({
    url: '/exp_flow_step/delete',
    method: 'post',
    data: parameter
  })
}

/**
 * 用于拖拽排序
 *
 * @author matthew.mak
 */
export function exp_flow_step_updateSort (parameter) {
  return axios({
    url: '/exp_flow_step/updateSort',
    method: 'post',
    data: parameter
  })
}

/**
 * 复制实验步骤管理
 *
 * @author matthew.mak
 */
export function exp_flow_step_copy (parameter) {
  return axios({
    url: '/exp_flow_step/copy',
    method: 'post',
    data: parameter
  })
}

/**
 * 复制实验步骤管理
 *
 * @author matthew.mak
 */
export function exp_flow_step_copyByLayout (parameter) {
  return axios({
    url: '/exp_flow_step/copyByLayout',
    method: 'post',
    data: parameter
  })
}