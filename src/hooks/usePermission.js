import { useStore } from 'vuex'

export function usePermission() {
  const store = useStore()
  
  const hasPerm = (permission) => {
    // 简化权限检查逻辑，实际项目中可能需要更复杂的权限验证
    const userPermissions = store.getters.permissionList || []
    
    // 如果没有权限列表，暂时返回 true（开发阶段）
    if (!userPermissions || userPermissions.length === 0) {
      return true
    }
    
    // 检查权限是否存在
    return userPermissions.includes(permission)
  }
  
  return {
    hasPerm
  }
} 