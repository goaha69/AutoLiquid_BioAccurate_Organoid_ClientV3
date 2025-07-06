import cloneDeep from 'lodash.clonedeep'

export function convertRoutes (nodes) {
  if (!nodes) return null

  nodes = cloneDeep(nodes)

  let queue = Array.isArray(nodes) ? nodes.concat() : [nodes]

  while (queue.length) {
    const levelSize = queue.length

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()

      if (!node.children || !node.children.length) continue

      node.children.forEach(child => {
        // 转化相对路径
        if (child.path[0] !== '/' && !child.path.startsWith('http')) {
          // 生成绝对路径，防止出现 "welcome/auth/app" 这类相对跳转
          const parentPath = node.path.endsWith('/') ? node.path.slice(0, -1) : node.path
          child.path = `${parentPath}/${child.path}`
          // 确保以 / 开头
          if (!child.path.startsWith('/')) {
            child.path = '/' + child.path
          }
        }
      })

      queue = queue.concat(node.children)
    }
  }

  return nodes
}
