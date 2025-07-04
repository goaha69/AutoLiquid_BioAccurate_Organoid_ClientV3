import { axios } from '@/utils/request'

/**
 * 查询系统通知公告
 *
 * @author matthew.mak
 * @date 2020/6/30 01:56
 */
export function sysArticlePage (parameter) {
  return axios({
    url: '/sysArticle/page',
    method: 'get',
    params: parameter
  })
}

export function sysArticleHelpList () {
  return axios({
    url: '/sysArticle/helpList',
    method: 'get'
  })
}

/**
 * 添加系统通知公告
 *
 * @author matthew.mak
 * @date 2020/6/30 01:56
 */
export function sysArticleAdd (parameter) {
  return axios({
    url: '/sysArticle/add',
    method: 'post',
    data: parameter
  })
}

/**
 * 编辑系统通知公告
 *
 * @author matthew.mak
 * @date 2020/6/30 01:56
 */
export function sysArticleEdit (parameter) {
  return axios({
    url: '/sysArticle/edit',
    method: 'post',
    data: parameter
  })
}

/**
 * 删除系统通知公告
 *
 * @author matthew.mak
 * @date 2020/6/30 01:56
 */
export function sysArticleDelete (parameter) {
  return axios({
    url: '/sysArticle/delete',
    method: 'post',
    data: parameter
  })
}

/**
 * 通知公告详情
 *
 * @author matthew.mak
 * @date 2020/6/30 01:56
 */
export function sysArticleDetail (parameter) {
  return axios({
    url: '/sysArticle/detail',
    method: 'get',
    params: parameter
  })
}

