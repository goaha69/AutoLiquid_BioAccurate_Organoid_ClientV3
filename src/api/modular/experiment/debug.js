/**
 * 设备
 */
import { axios} from '@/utils/request'

export function connect(parameter) {
    return axios({
      url: '/exp_equipment/connect',
      method: 'post',
      data: parameter
    })
  }

  export function doCmd(parameter) {
    return axios({
      url: '/exp_equipment/doCmd',
      method: 'post',
      data: parameter
    })
  }


  export function connectAll(parameter) {
    return axios({
      url: '/exp_equipment/connectAll',
      method: 'post',
      data: parameter
    })
  }


  export function doMethod(parameter) {
    return axios({
      url: '/exp_equipment/doMethod',
      method: 'post',
      data: parameter
    })
  }

  export function doStepMethod(parameter) {
    return axios({
      url: '/exp_equipment/doStepMethod',
      method: 'post',
      data: parameter
    })
  }

  export function exp_equipment_setCurrentStatus(parameter) {
    return axios({
      url: '/exp_equipment/setCurrentStatus',
      method: 'post',
      data: parameter
    })
  }

  export function exp_equipment_setAllCurrentStatus(parameter) {
    return axios({
      url: '/exp_equipment/setAllCurrentStatus',
      method: 'post',
      data: parameter
    })
  }