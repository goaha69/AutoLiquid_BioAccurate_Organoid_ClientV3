import { axios} from '@/utils/request'

/**
 * 查询数据
 *
 * 
 */
export function exp_incubator_storage_list (parameter) {
    return axios({
      url: '/exp_incubator_storage/list',
      method: 'get',
      params: parameter
    })
  }

  /**
 * 删除数据
 *
 * 
 */
export function exp_incubator_storage_DeleteData (Id) {
    return axios({
      url: '/exp_incubator_storage/DeleteData',
      method: 'post',
      params: Id
    })
  }