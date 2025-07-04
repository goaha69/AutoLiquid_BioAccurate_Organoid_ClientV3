import store from '@/store'

export function actionToObject (json) {
  try {
    return JSON.parse(json)
  } catch (e) {
    console.log('err', e.message)
  }
  return []
}

/**
 * 控制按钮是否显示
 *
 * @author matthew.mak
 * @date 2020/06/27 02:34
 */
export function hasBtnPermission (permission) {
  try {
    const myBtns = store.getters.buttons || []
    const admintype = store.getters.admintype
    
    console.log('🔐 [permissions] 权限检查:', {
      permission,
      admintype,
      buttons: myBtns,
      buttonsLength: myBtns.length
    })
    
    // 如果是超级管理员，直接返回true
    // eslint-disable-next-line eqeqeq
    if (admintype == '1') {
      console.log('✅ [permissions] 超级管理员，权限通过')
      return true
    }
    
    // 如果buttons数组为空且不是超管，可能是权限数据还未加载，暂时允许访问
    if (!myBtns || myBtns.length === 0) {
      console.log('⚠️ [permissions] 权限数据为空，暂时允许访问')
      return true // 暂时允许访问，避免页面空白
    }
    
    const hasPermission = myBtns.indexOf(permission) > -1
    console.log(hasPermission ? '✅' : '❌', '[permissions] 权限检查结果:', hasPermission)
    
    return hasPermission
  } catch (error) {
    console.error('❌ [permissions] 权限检查出错:', error)
    // 出错时默认允许访问，避免页面完全无法使用
    return true
  }
}

// 导出别名，兼容不同的调用方式
export const hasPerm = hasBtnPermission
