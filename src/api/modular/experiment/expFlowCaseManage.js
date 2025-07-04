import { axios } from '@/utils/request'

/**
 * 查询流程
 *
 * @author matthew.mak
 */
export function exp_flow_case_page (parameter) {
  return axios({
    url: '/exp_flow_case/page',
    method: 'get',
    params: parameter
  })
}

/**
 * 流程列表
 *
 * @author matthew.mak
 */
export function exp_flow_case_list (parameter) {
  return axios({
    url: '/exp_flow_case/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 添加流程
 *
 * @author matthew.mak
 */
export function exp_flow_case_add (parameter) {
  return axios({
    url: '/exp_flow_case/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 增加判断流程
 *
 * @author matthew.mak
 */
export function exp_flow_case_addJudement (parameter) {
  return axios({
    url: '/exp_flow_case/addJudement',
    method: 'post',
    data: parameter
  })
}

/**
 * 增加手动流程
 *
 * @author matthew.mak
 */
export function exp_flow_case_addManual (parameter) {
  return axios({
    url: '/exp_flow_case/addManual',
    method: 'post',
    data: parameter
  })
}


export function exp_flow_case_addQueue (parameter) {
  return axios({
    url: '/exp_flow_case/addQueue',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_cancelCase (parameter) {
  return axios({
    url: '/exp_flow_case/cancelCase',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_pauseCase (parameter) {
  return axios({
    url: '/exp_flow_case/pauseCase',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_continueCase (parameter) {
  return axios({
    url: '/exp_flow_case/continueCase',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_addTemporaryFlow (parameter) {
  return axios({
    url: '/exp_flow_case/addTemporaryFlow',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑流程
 *
 * @author matthew.mak
 */
export function exp_flow_case_edit (parameter) {
  return axios({
    url: '/exp_flow_case/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除流程
 *
 * @author matthew.mak
 */
export function exp_flow_case_delete (parameter) {
  return axios({
    url: '/exp_flow_case/delete',
    method: 'post',
    data: parameter
  })
}


export function exp_flow_case_getNodeList (parameter) {
  return axios({
    url: '/exp_flow_case/getNodeList',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_getStepList (parameter) {
  return axios({
    url: '/exp_flow_case/getStepList',
    method: 'post',
    data: parameter
  })
}


export function exp_flow_case_saveNodeList (parameter) {
  return axios({
    url: '/exp_flow_case/saveNodeList',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_updateStepStatus (parameter) {
  return axios({
    url: '/exp_flow_case/updateStepStatus',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_handleIntervention (parameter) {
  return axios({
    url: '/exp_flow_case/handleIntervention',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_detail (parameter) {
  return axios({
    url: '/exp_flow_case/detail',
    method: 'post',
    data: parameter
  })
}

export function exp_flow_case_handleError (parameter) {
  return axios({
    url: '/exp_flow_case/handleError',
    method: 'post',
    data: parameter
  })
}
/**
 * 获取缓存列表
 *
 * @author matthew.mak
 */
export function exp_flow_case_getcachelist () {
  return axios({
    url: '/exp_flow_case/getCacheList',
    method: 'post',
    data: []
  })
}/**
 * 保存缓存列表
 *
 * @author matthew.mak
 */
export function exp_flow_case_savecacheinput (parameter) {
  return axios({
    url: '/exp_flow_case/saveCacheInput',
    method: 'post',
    data: parameter
  })
}

/**
 * 获取样品列表
 *
 * @author matthew.mak
 */
export function exp_flow_case_getSamplelist (parameter) {
  return axios({
    url: '/exp_flow_case/getSampleList',
    method: 'post',
    data: parameter
  })
}

/**
 * 获取判断结果列表
 *
 * @author matthew.mak
 */
export function exp_flow_case_getAfterJudementList (parameter) {
  return axios({
    url: '/exp_flow_case/getAfterJudementList',
    method: 'post',
    data: parameter
  })
}

/**
 * 判断流程后处理
 *
 * @author matthew.mak
 */
export function exp_flow_case_afterJudement (parameter) {
  return axios({
    url: '/exp_flow_case/afterJudement',
    method: 'post',
    data: parameter
  })
}
/**
 * 获取最后一条通知
 *
 * @author matthew.mak
 */
export function exp_flow_case_getLastNotice (parameter) {
  return axios({
    url: '/exp_flow_case/getLastNotice',
    method: 'post',
    data: parameter
  })
}
/**
 * 获取样品明细
 *
 * @author matthew.mak
 */
export function exp_flow_case_getSampleDetail (parameter) {
  return axios({
    url: '/exp_flow_case/getSampleDetail',
    method: 'get',
    params: parameter
  })
}
/**
 * 获取样品列表（不筛选）
 *
 * @author matthew.mak
 */
export function exp_flow_case_getSamples (parameter) {
  return axios({
    url: '/exp_flow_case/getSamples',
    method: 'get',
    params: parameter
  })
}


/**
 * 获取计划列表
 *
 * @author matthew.mak
 */
export function exp_flow_case_getPlanList (parameter) {
  return axios({
    url: '/exp_flow_case/getPlanList',
    method: 'post',
    data: parameter
  })
}

/**
 * 新增计划
 *
 * @author matthew.mak
 */
export function exp_flow_case_addPlan (parameter) {
  return axios({
    url: '/exp_flow_case/addPlan',
    method: 'post',
    data: parameter
  })
}

/**
 * 修改计划
 *
 * @author matthew.mak
 */
export function exp_flow_case_editPlan (parameter) {
  return axios({
    url: '/exp_flow_case/editPlan',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除计划
 *
 * @author matthew.mak
 */
export function exp_flow_case_deletePlan (parameter) {
  return axios({
    url: '/exp_flow_case/deletePlan',
    method: 'post',
    data: parameter
  })
}


/**
 * 修改样品信息状态
 *
 * @author matthew.mak
 */
export function exp_flow_case_UpdateSampleStatus (parameter) {
  return axios({
    url: '/exp_flow_case/UpdateSampleStatus',
    method: 'post',
    data: parameter
  })
}

/**
 * 查询样品离心管编号
 *
 * @author matthew.mak
 */
export function exp_flow_case_QuerySampleCentrifugeCode () {
  return axios({
    url: '/exp_flow_case/querySampleCentrifugeCode',
    method: 'get',
    data: []
  })
}


/**
 * 根据流程编号获取显微镜图像
 *
 * @author matthew.mak
 */
export function exp_flow_case_getFlowCaseFiles (parameter) {
  return axios({
    url: '/exp_flow_case/getFlowCaseFiles',
    method: 'get',
    params: parameter
  })
}