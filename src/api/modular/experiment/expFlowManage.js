import { axios } from '@/utils/request'

/**
 * 查询流程
 *
 * @author matthew.mak
 */
export function exp_flow_page (parameter) {
  return axios({
    url: '/exp_flow/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 流程列表
 *
 * @author matthew.mak
 */
export function exp_flow_list (parameter) {
  return axios({
    url: '/exp_flow/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 添加流程
 *
 * @author matthew.mak
 */
export function exp_flow_add (parameter) {
  return axios({
    url: '/exp_flow/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑流程
 *
 * @author matthew.mak
 */
export function exp_flow_edit (parameter) {
  return axios({
    url: '/exp_flow/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除流程
 *
 * @author matthew.mak
 */
export function exp_flow_delete (parameter) {
  return axios({
    url: '/exp_flow/delete',
    method: 'post',
    data: parameter
  })
}


export function exp_flow_getNodeList (parameter) {
  return axios({
    url: '/exp_flow/getNodeList',
    method: 'post',
    data: parameter
  })
}


export function exp_flow_saveNodeList (parameter) {
  return axios({
    url: '/exp_flow/saveNodeList',
    method: 'post',
    data: parameter
  })
}


export function exp_flow_detail (parameter) {
  return axios({
    url: '/exp_flow/detail',
    method: 'post',
    data: parameter
  })
}

/**
 * 步骤自定义绑定
 *
 * 
 */

export function exp_flow_saveAttribute (parameter){
  return axios({
    url: '/exp_flow/saveAttribute',
    method: 'post',
    data: parameter
  })
}
/**
 * 流程导入
 *
 * 
 */

export function exp_flow_ImportFlow (parameter){
  return axios({
    url: '/exp_flow/ImportFlow',
    method: 'post',
    data: parameter,
    headers: {
      'Content-Type': 'multipart/form-data' // 正确设置表单类型
    }
  })
}
/**
 * 流程导出
 *
 * 
 */

export function exp_flow_ExportFlow (parameter){
  return axios({
    url: `/exp_flow/ExportFlow`, // 使用路径参数
    params: { flowId: parameter.flowId }, // 确保参数名为flowId
    method: 'get',
    responseType: 'blob' // 重要：接收二进制流
  })
}