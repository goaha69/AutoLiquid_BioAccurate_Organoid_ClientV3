import { axios} from '@/utils/request'

/**
 * 查询录像管理
 *
 * @author liu_ja
 */
export function exp_video_page (parameter) {
  return axios({
    url: '/exp_video/page',
    method: 'get',
    params: parameter
  })
}
/**
 * 录像管理
 *
 * @author liu_ja
 */
export function exp_video_list (parameter) {
  return axios({
    url: '/exp_video/list',
    method: 'get',
    params: parameter
  })
}

/**
 * 开始录像
 *
 * @author liu_ja
 */
export function exp_video_start (parameter) {
  return axios({
    url: '/exp_video/start',
    method: 'post',
    data: parameter
  })
}

/**
 * 停止录像
 *
 * @author liu_ja
 */
export function exp_video_stop (parameter) {
  return axios({
    url: '/exp_video/stop',
    method: 'post',
    data: parameter
  })
}

/**
 * 播放录像
 *
 * @author liu_ja
 */
export function exp_video_play (parameter) {
  return axios({
    url: '/exp_video/play',
    method: 'get',
    params: parameter
  })
}

